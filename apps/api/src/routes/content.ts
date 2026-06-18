import { Elysia, t } from "elysia";
import { prisma } from "@ckt/db";
import { authPlugin } from "../lib/auth";
import { requireRole } from "../lib/rbac";
import { ga4Configured, topPages, topSearchTerms } from "../lib/ga4";
import { generateSeo } from "../lib/seo";

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
          aioSummary: t.String(),
          aioFaqJson: t.Any(),
          ga4PropertyId: t.String(),
        }),
      ),
    },
  )
  // ---- SEO/AIO generation from GA4 ----
  .get("/seo/ga4-status", async () => {
    const s = await prisma.siteSettings.findUnique({ where: { id: "default" }, select: { ga4PropertyId: true } });
    return { credentialsConfigured: ga4Configured(), propertyId: s?.ga4PropertyId ?? null };
  })
  .post(
    "/seo/generate",
    async ({ body, status }) => {
      if (!ga4Configured())
        return status(422, { message: "ยังไม่ได้ตั้งค่า GA4 service account (GA4_SA_CLIENT_EMAIL / GA4_SA_PRIVATE_KEY)" });
      const settings = await prisma.siteSettings.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });
      if (!settings.ga4PropertyId)
        return status(422, { message: "ยังไม่ได้กรอก GA4 Property ID" });

      const days = body?.days ?? 28;
      try {
        const [pages, terms] = await Promise.all([
          topPages(settings.ga4PropertyId, days),
          topSearchTerms(settings.ga4PropertyId, days),
        ]);
        const suggestion = generateSeo(settings.siteName ?? "", pages, terms);
        return { suggestion, source: { topPages: pages.slice(0, 10), topSearchTerms: terms.slice(0, 10), days } };
      } catch (e: any) {
        return status(502, { message: `เรียก GA4 ไม่สำเร็จ: ${e?.message ?? e}` });
      }
    },
    { body: t.Optional(t.Object({ days: t.Optional(t.Integer({ minimum: 1, maximum: 365 })) })) },
  )
  // apply a generated suggestion + stamp seoGeneratedAt
  .patch(
    "/seo/apply",
    async ({ body }) =>
      prisma.siteSettings.upsert({
        where: { id: "default" },
        update: { ...(body as any), seoGeneratedAt: new Date() },
        create: { id: "default", ...(body as any), seoGeneratedAt: new Date() },
      }),
    {
      body: t.Object({
        metaTitle: t.Optional(t.String()),
        metaDescription: t.Optional(t.String()),
        keywords: t.Optional(t.Array(t.String())),
        aioSummary: t.Optional(t.String()),
      }),
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
