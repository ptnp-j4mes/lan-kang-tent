import { Elysia, t } from "elysia";
import { prisma } from "@ckt/db";
import { buildWhere, lightMarkerSelect, toLightDTO } from "../lib/campsite-query";

export const campsiteRoutes = new Elysia({ prefix: "/api/campsites" })
  // paginated listing
  .get(
    "/",
    async ({ query }) => {
      const where = buildWhere(query);
      const page = Math.max(1, Number(query.page ?? 1));
      const limit = Math.min(48, Math.max(1, Number(query.limit ?? 12)));
      const sort = query.sort ?? "rating";

      const orderBy =
        sort === "price"
          ? { priceMin: "asc" as const }
          : sort === "newest"
            ? { createdAt: "desc" as const }
            : { memberRating: "desc" as const };

      const [total, rows] = await Promise.all([
        prisma.campsite.count({ where }),
        prisma.campsite.findMany({
          where,
          select: lightMarkerSelect,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        campsites: rows.map(toLightDTO),
      };
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        sort: t.Optional(t.String()),
        province: t.Optional(t.String()),
        region: t.Optional(t.String()),
        keyword: t.Optional(t.String()),
        rating: t.Optional(t.String()),
        priceMin: t.Optional(t.String()),
        priceMax: t.Optional(t.String()),
        amenities: t.Optional(t.String()),
        verified: t.Optional(t.String()),
      }),
    },
  )
  // full detail by slug (or id)
  .get("/:id", async ({ params, status }) => {
    const c = await prisma.campsite.findFirst({
      where: { OR: [{ slug: params.id }, { id: params.id }], status: "published" },
      include: {
        photos: { orderBy: { sortOrder: "asc" } },
        amenities: { include: { amenity: true } },
        googleSnapshots: { orderBy: { publishTime: "desc" }, take: 5 },
        owner: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    if (!c) return status(404, { message: "Not found" });
    return c;
  })
  // member reviews for a campsite (approved only) — by slug or id
  .get("/:id/reviews", async ({ params, status }) => {
    const site = await prisma.campsite.findFirst({
      where: { OR: [{ slug: params.id }, { id: params.id }] },
      select: { id: true },
    });
    if (!site) return status(404, { message: "Not found" });
    const reviews = await prisma.review.findMany({
      where: { campsiteId: site.id, status: "approved" },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        photos: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { count: reviews.length, reviews };
  });
