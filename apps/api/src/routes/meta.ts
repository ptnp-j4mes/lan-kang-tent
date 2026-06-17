import { Elysia } from "elysia";
import { prisma } from "@ckt/db";

export const metaRoutes = new Elysia()
  // provinces with published campsite counts (for landing + filters)
  .get("/api/provinces", async () => {
    const grouped = await prisma.campsite.groupBy({
      by: ["province", "region"],
      where: { status: "published" },
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
    });
    return grouped.map((g) => ({
      province: g.province,
      region: g.region,
      count: g._count._all,
    }));
  })
  .get("/api/amenities", async () => {
    return prisma.amenity.findMany({ orderBy: { name: "asc" } });
  });
