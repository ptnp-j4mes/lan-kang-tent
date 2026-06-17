import { Elysia, t } from "elysia";
import { prisma } from "@ckt/db";
import { buildWhere, lightMarkerSelect, toLightDTO } from "../lib/campsite-query";
import { distanceKm } from "../lib/geo";

export const mapRoutes = new Elysia({ prefix: "/api/map" })
  // lightweight marker data for the map
  .get(
    "/campsites",
    async ({ query }) => {
      const where = buildWhere(query);
      let rows = await prisma.campsite.findMany({
        where,
        select: lightMarkerSelect,
        take: 2000,
      });

      // nearby filter (post-query haversine)
      const { nearbyLat, nearbyLng, radius } = query;
      let dto = rows.map(toLightDTO);
      if (nearbyLat && nearbyLng) {
        const lat = Number(nearbyLat);
        const lng = Number(nearbyLng);
        const rad = radius ? Number(radius) : 50;
        dto = dto
          .map((c) => ({
            ...c,
            distanceKm: c.latitude && c.longitude ? distanceKm(lat, lng, c.latitude, c.longitude) : null,
          }))
          .filter((c) => c.distanceKm != null && c.distanceKm <= rad)
          .sort((a, b) => (a.distanceKm! - b.distanceKm!));
      }

      return { count: dto.length, campsites: dto };
    },
    {
      query: t.Object({
        bounds: t.Optional(t.String()),
        province: t.Optional(t.String()),
        region: t.Optional(t.String()),
        keyword: t.Optional(t.String()),
        rating: t.Optional(t.String()),
        priceMin: t.Optional(t.String()),
        priceMax: t.Optional(t.String()),
        amenities: t.Optional(t.String()),
        nearbyLat: t.Optional(t.String()),
        nearbyLng: t.Optional(t.String()),
        radius: t.Optional(t.String()),
        verified: t.Optional(t.String()),
      }),
    },
  )
  // preview card on marker click
  .get("/campsites/:id", async ({ params, status }) => {
    const c = await prisma.campsite.findFirst({
      where: { id: params.id, status: "published" },
      select: lightMarkerSelect,
    });
    if (!c) return status(404, { message: "Not found" });
    return toLightDTO(c);
  })
  // nearby search shortcut
  .get(
    "/nearby",
    async ({ query }) => {
      const lat = Number(query.lat);
      const lng = Number(query.lng);
      const rad = query.radius ? Number(query.radius) : 50;
      const rows = await prisma.campsite.findMany({
        where: buildWhere(query),
        select: lightMarkerSelect,
        take: 2000,
      });
      const dto = rows
        .map(toLightDTO)
        .map((c) => ({
          ...c,
          distanceKm: c.latitude && c.longitude ? distanceKm(lat, lng, c.latitude, c.longitude) : null,
        }))
        .filter((c) => c.distanceKm != null && c.distanceKm <= rad)
        .sort((a, b) => a.distanceKm! - b.distanceKm!);
      return { count: dto.length, campsites: dto };
    },
    {
      query: t.Object({
        lat: t.String(),
        lng: t.String(),
        radius: t.Optional(t.String()),
        amenities: t.Optional(t.String()),
        rating: t.Optional(t.String()),
      }),
    },
  );
