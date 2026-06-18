import { Elysia, t } from "elysia";
import { prisma } from "@ckt/db";
import { authPlugin } from "../lib/auth";
import { requireRole } from "../lib/rbac";

const settingsDefault = { id: "default" };

// ---------- public ----------
export const contentPublicRoutes = new Elysia()
  .get("/api/site-settings", async () =>
    (await prisma.siteSettings.findUnique({ where: { id: "default" } })) ?? settingsDefault,
  )
  .get("/api/banners", () =>
    prisma.homeBanner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  )
  .get(
    "/api/articles",
    ({ query }) =>
      prisma.article.findMany({
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        take: query.limit ? Number(query.limit) : 20,
        select: { id: true, slug: true, title: true, excerpt: true, coverImageUrl: true, tags: true, publishedAt: true },
      }),
    { query: t.Object({ limit: t.Optional(t.String()) }) },
  )
  .get("/api/articles/:slug", async ({ params, status }) => {
    const a = await prisma.article.findFirst({ where: { slug: params.slug, status: "published" } });
    if (!a) return status(404, { message: "Not found" });
    return a;
  });

// ---------- admin ----------
const bannerBody = t.Object({
  title: t.String({ minLength: 1 }),
  subtitle: t.Optional(t.String()),
  imageUrl: t.String({ minLength: 1 }),
  ctaLabel: t.Optional(t.String()),
  ctaHref: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Integer()),
});

const articleBody = t.Object({
  slug: t.String({ minLength: 1 }),
  title: t.String({ minLength: 1 }),
  excerpt: t.Optional(t.String()),
  content: t.Optional(t.String()),
  coverImageUrl: t.Optional(t.String()),
  status: t.Optional(t.String()),
  metaTitle: t.Optional(t.String()),
  metaDescription: t.Optional(t.String()),
  tags: t.Optional(t.Array(t.String())),
});

export const contentAdminRoutes = new Elysia({ prefix: "/api/admin" })
  .use(authPlugin)
  .onBeforeHandle(({ user }) => {
    requireRole(user, "admin");
  })
  // site settings (AIO / SEO / analytics)
  .get("/site-settings", async () =>
    prisma.siteSettings.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } }),
  )
  .patch(
    "/site-settings",
    ({ body }) =>
      prisma.siteSettings.upsert({ where: { id: "default" }, update: body as any, create: { id: "default", ...(body as any) } }),
    {
      body: t.Partial(
        t.Object({
          siteName: t.String(),
          metaTitle: t.String(),
          metaDescription: t.String(),
          keywords: t.Array(t.String()),
          ogImage: t.String(),
          ga4Id: t.String(),
          gtmId: t.String(),
          organizationName: t.String(),
          twitterHandle: t.String(),
          robotsExtra: t.String(),
        }),
      ),
    },
  )
  // banners
  .get("/banners", () => prisma.homeBanner.findMany({ orderBy: { sortOrder: "asc" } }))
  .post("/banners", ({ body, status }) => status(201, prisma.homeBanner.create({ data: body as any })), { body: bannerBody })
  .patch("/banners/:id", ({ params, body }) => prisma.homeBanner.update({ where: { id: params.id }, data: body as any }), {
    body: t.Partial(bannerBody),
  })
  .delete("/banners/:id", async ({ params }) => {
    await prisma.homeBanner.delete({ where: { id: params.id } });
    return { ok: true };
  })
  // articles
  .get("/articles", () => prisma.article.findMany({ orderBy: { updatedAt: "desc" } }))
  .post(
    "/articles",
    ({ body, status }) => {
      const publishedAt = body.status === "published" ? new Date() : null;
      return status(201, prisma.article.create({ data: { ...(body as any), status: (body.status as any) ?? "draft", publishedAt } }));
    },
    { body: articleBody },
  )
  .patch(
    "/articles/:id",
    async ({ params, body }) => {
      const next = body as any;
      if (next.status === "published") {
        const cur = await prisma.article.findUnique({ where: { id: params.id }, select: { publishedAt: true } });
        if (!cur?.publishedAt) next.publishedAt = new Date();
      }
      return prisma.article.update({ where: { id: params.id }, data: next });
    },
    { body: t.Partial(articleBody) },
  )
  .delete("/articles/:id", async ({ params }) => {
    await prisma.article.delete({ where: { id: params.id } });
    return { ok: true };
  });
