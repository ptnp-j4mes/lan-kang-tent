import type { CampsiteLight, MapFilters, ProvinceStat, Amenity } from "./types";
import { MOCK_AMENITIES, MOCK_CAMPSITES, mockProvinces } from "./mock";

const API = process.env.NEXT_PUBLIC_API_URL;
// When no backend is configured we run fully on mock data so the UI is demoable.
const USE_API = false;

function haversine(la1: number, lo1: number, la2: number, lo2: number) {
  const R = 6371;
  const dLa = ((la2 - la1) * Math.PI) / 180;
  const dLo = ((lo2 - lo1) * Math.PI) / 180;
  const a =
    Math.sin(dLa / 2) ** 2 +
    Math.cos((la1 * Math.PI) / 180) * Math.cos((la2 * Math.PI) / 180) * Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---- local mock filtering (mirrors API query semantics) ----
export function filterCampsites(filters: Partial<MapFilters>): CampsiteLight[] {
  let list = [...MOCK_CAMPSITES] as (CampsiteLight & { region: string })[];

  if (filters.keyword) {
    const q = filters.keyword.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.province.toLowerCase().includes(q) ||
        (c.district ?? "").toLowerCase().includes(q),
    );
  }
  if (filters.province) list = list.filter((c) => c.province === filters.province);
  if (filters.region) list = list.filter((c) => c.region === filters.region);
  if (filters.verified) list = list.filter((c) => c.isVerified);
  if (filters.rating) list = list.filter((c) => Math.max(c.memberRating ?? 0, c.googleRating ?? 0) >= filters.rating!);
  if (filters.priceMax != null) list = list.filter((c) => (c.priceMin ?? 0) <= filters.priceMax!);
  if (filters.amenities?.length) {
    list = list.filter((c) => filters.amenities!.every((k) => c.tags.some((t) => t.key === k)));
  }
  if (filters.nearby) {
    const { lat, lng, radius } = filters.nearby;
    list = list
      .map((c) => ({ ...c, distanceKm: haversine(lat, lng, c.latitude, c.longitude) }))
      .filter((c) => (c.distanceKm ?? 999) <= radius)
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }
  return list;
}

export async function getMapCampsites(filters: Partial<MapFilters> = {}): Promise<CampsiteLight[]> {
  if (USE_API && API) {
    const res = await fetch(`${API}/api/map/campsites`, { cache: "no-store" });
    const data = await res.json();
    return data.campsites;
  }
  return filterCampsites(filters);
}

export async function getCampsiteBySlug(slug: string) {
  return MOCK_CAMPSITES.find((c) => c.slug === slug) ?? null;
}

export async function getProvinces(): Promise<ProvinceStat[]> {
  if (USE_API && API) {
    return (await fetch(`${API}/api/provinces`).then((r) => r.json())) as ProvinceStat[];
  }
  return mockProvinces();
}

export async function getAmenities(): Promise<Amenity[]> {
  if (USE_API && API) return fetch(`${API}/api/amenities`).then((r) => r.json());
  return MOCK_AMENITIES;
}

export function topRated(n = 6) {
  return [...MOCK_CAMPSITES].sort((a, b) => (b.memberRating ?? 0) - (a.memberRating ?? 0)).slice(0, n);
}
export function popular(n = 6) {
  return [...MOCK_CAMPSITES].sort((a, b) => (b.googleRating ?? 0) - (a.googleRating ?? 0)).slice(0, n);
}
