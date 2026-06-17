import { Prisma } from "@ckt/db";
import { parseBounds } from "./geo";

export type CampsiteFilters = {
  province?: string;
  region?: string;
  keyword?: string;
  rating?: string;
  priceMin?: string;
  priceMax?: string;
  amenities?: string; // comma separated keys
  verified?: string;
  bounds?: string;
};

// Build a Prisma where clause for published campsites from query filters.
export function buildWhere(f: CampsiteFilters): Prisma.CampsiteWhereInput {
  const where: Prisma.CampsiteWhereInput = {
    status: "published",
    latitude: { not: null },
    longitude: { not: null },
  };
  const and: Prisma.CampsiteWhereInput[] = [];

  if (f.province) where.province = f.province;
  if (f.region) where.region = f.region;
  if (f.verified === "true") where.isVerified = true;

  if (f.rating) {
    const r = Number(f.rating);
    if (!Number.isNaN(r)) {
      and.push({ OR: [{ memberRating: { gte: r } }, { googleRating: { gte: r } }] });
    }
  }
  if (f.priceMin) {
    const v = Number(f.priceMin);
    if (!Number.isNaN(v)) where.priceMin = { gte: v };
  }
  if (f.priceMax) {
    const v = Number(f.priceMax);
    if (!Number.isNaN(v)) and.push({ priceMin: { lte: v } });
  }
  if (f.keyword) {
    const q = f.keyword.trim();
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { province: { contains: q, mode: "insensitive" } },
        { district: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (f.amenities) {
    const keys = f.amenities.split(",").map((s) => s.trim()).filter(Boolean);
    for (const key of keys) {
      and.push({ amenities: { some: { amenity: { key } } } });
    }
  }
  const b = parseBounds(f.bounds);
  if (b) {
    where.latitude = { gte: b.swLat, lte: b.neLat };
    where.longitude = { gte: b.swLng, lte: b.neLng };
  }

  if (and.length) where.AND = and;
  return where;
}

export const lightMarkerSelect = {
  id: true,
  name: true,
  slug: true,
  latitude: true,
  longitude: true,
  province: true,
  district: true,
  priceMin: true,
  googleRating: true,
  memberRating: true,
  isVerified: true,
  photos: { take: 1, orderBy: { sortOrder: "asc" }, select: { imageUrl: true } },
  amenities: { select: { amenity: { select: { key: true, name: true } } } },
} satisfies Prisma.CampsiteSelect;

export function toLightDTO(c: any) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    latitude: c.latitude,
    longitude: c.longitude,
    province: c.province,
    district: c.district,
    coverImageUrl: c.photos?.[0]?.imageUrl ?? null,
    googleRating: c.googleRating,
    memberRating: c.memberRating,
    priceMin: c.priceMin,
    isVerified: c.isVerified,
    tags: (c.amenities ?? []).map((a: any) => ({ key: a.amenity.key, name: a.amenity.name })),
  };
}
