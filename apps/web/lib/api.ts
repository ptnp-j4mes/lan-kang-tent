import type { CampsiteLight, MapFilters, ProvinceStat, Amenity } from "./types";
import { MOCK_AMENITIES, MOCK_CAMPSITES, mockProvinces } from "./mock";

// Server components run inside the web container → localhost won't reach the API.
// Use the internal docker URL on the server, the public URL in the browser.
const API =
  typeof window === "undefined"
    ? process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL;
// Real API when NEXT_PUBLIC_API_URL is set; mock otherwise (demoable with no backend).
const USE_API = !!API;

function haversine(la1: number, lo1: number, la2: number, lo2: number) {
  const R = 6371;
  const dLa = ((la2 - la1) * Math.PI) / 180;
  const dLo = ((lo2 - lo1) * Math.PI) / 180;
  const a =
    Math.sin(dLa / 2) ** 2 +
    Math.cos((la1 * Math.PI) / 180) * Math.cos((la2 * Math.PI) / 180) * Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Base dataset for client-side filtering: real API when configured, else mock.
// ponytail: client-side filter over the full set (fine for hundreds). Switch to
// per-filter server queries (GET /api/map/campsites?...) when the set gets big.
export async function getAllCampsites(): Promise<CampsiteLight[]> {
  if (USE_API && API) {
    const data = await fetch(`${API}/api/map/campsites`, { cache: "no-store" }).then((r) => r.json());
    return data.campsites as CampsiteLight[];
  }
  return MOCK_CAMPSITES;
}

// ---- client-side filtering (mirrors API query semantics) ----
export function filterCampsites(
  filters: Partial<MapFilters>,
  dataset: CampsiteLight[] = MOCK_CAMPSITES,
): CampsiteLight[] {
  let list = [...dataset] as (CampsiteLight & { region: string })[];

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

// normalized detail view: same shape from API or mock
export type CampsiteDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  province: string;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  priceMin: number | null;
  isVerified: boolean;
  coverImageUrl: string | null;
  gallery: string[];
  tags: { key: string; name: string }[];
  googleRating: number | null;
  memberRating: number | null;
  memberReviewCount: number;
  googleReviews: { authorName?: string; rating?: number; text?: string; relativeTimeDescription?: string }[];
};

const STOCK = [
  "https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=600",
  "https://images.unsplash.com/photo-1496080174650-637e3f22fa03?w=600",
];

export async function getCampsiteDetail(slug: string): Promise<CampsiteDetail | null> {
  if (USE_API && API) {
    try {
      const c = await fetch(`${API}/api/campsites/${slug}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null));
      if (!c) return null;
      const photos: string[] = (c.photos ?? []).map((p: any) => p.imageUrl);
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        province: c.province,
        district: c.district,
        latitude: c.latitude,
        longitude: c.longitude,
        priceMin: c.priceMin,
        isVerified: c.isVerified,
        coverImageUrl: photos[0] ?? null,
        gallery: photos.length ? photos : STOCK,
        tags: (c.amenities ?? []).map((a: any) => ({ key: a.amenity.key, name: a.amenity.name })),
        googleRating: c.googleRating,
        memberRating: c.memberRating,
        memberReviewCount: c.memberReviewCount ?? 0,
        googleReviews: c.googleSnapshots ?? [],
      };
    } catch {
      /* fall through to mock */
    }
  }
  const m = MOCK_CAMPSITES.find((c) => c.slug === slug);
  if (!m) return null;
  return {
    id: m.id,
    name: m.name,
    slug: m.slug,
    description: (m as any).description ?? null,
    province: m.province,
    district: m.district,
    latitude: m.latitude,
    longitude: m.longitude,
    priceMin: m.priceMin,
    isVerified: m.isVerified,
    coverImageUrl: m.coverImageUrl,
    gallery: [m.coverImageUrl, ...STOCK].filter(Boolean) as string[],
    tags: m.tags,
    googleRating: m.googleRating,
    memberRating: m.memberRating,
    memberReviewCount: 0,
    googleReviews: [],
  };
}

export async function getProvinces(): Promise<ProvinceStat[]> {
  if (USE_API && API) {
    try {
      return (await fetch(`${API}/api/provinces`, { cache: "no-store" }).then((r) => r.json())) as ProvinceStat[];
    } catch {
      return mockProvinces(); // ponytail: API down (e.g. build time) → mock fallback
    }
  }
  return mockProvinces();
}

export async function getAmenities(): Promise<Amenity[]> {
  if (USE_API && API) {
    try {
      return await fetch(`${API}/api/amenities`, { cache: "no-store" }).then((r) => r.json());
    } catch {
      return MOCK_AMENITIES;
    }
  }
  return MOCK_AMENITIES;
}

// ---- site settings (SEO / AIO / analytics) ----
export type SiteSettings = {
  siteName?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  ogImage?: string | null;
  ga4Id?: string | null;
  gtmId?: string | null;
  organizationName?: string | null;
  twitterHandle?: string | null;
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (USE_API && API) {
    try {
      return await fetch(`${API}/api/site-settings`, { next: { revalidate: 300 } }).then((r) => r.json());
    } catch {
      return null;
    }
  }
  return null;
}

// ---- content (banners + articles) ----
export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaHref: string | null;
};
export type ArticleCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  tags: string[];
  publishedAt: string | null;
};

export async function getActiveBanner(): Promise<Banner | null> {
  if (USE_API && API) {
    try {
      const r = await fetch(`${API}/api/banners`, { cache: "no-store" }).then((x) => x.json());
      return r[0] ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function getArticles(limit = 20): Promise<ArticleCard[]> {
  if (USE_API && API) {
    try {
      return await fetch(`${API}/api/articles?limit=${limit}`, { cache: "no-store" }).then((x) => x.json());
    } catch {
      return [];
    }
  }
  return [];
}

export async function getArticle(slug: string): Promise<any | null> {
  if (USE_API && API) {
    try {
      const r = await fetch(`${API}/api/articles/${slug}`, { cache: "no-store" });
      return r.ok ? r.json() : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function topRated(n = 6) {
  return [...MOCK_CAMPSITES].sort((a, b) => (b.memberRating ?? 0) - (a.memberRating ?? 0)).slice(0, n);
}
export function popular(n = 6) {
  return [...MOCK_CAMPSITES].sort((a, b) => (b.googleRating ?? 0) - (a.googleRating ?? 0)).slice(0, n);
}
