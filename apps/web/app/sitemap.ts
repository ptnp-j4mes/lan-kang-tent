import type { MetadataRoute } from "next";
import { MOCK_CAMPSITES, mockProvinces } from "@/lib/mock";

const BASE = "https://campthai.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/map", "/campsites", "/province", "/reviews", "/owners"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  const provincePages = mockProvinces().map((p) => ({
    url: `${BASE}/province/${encodeURIComponent(p.province)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const campsitePages = MOCK_CAMPSITES.map((c) => ({
    url: `${BASE}/campsites/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...provincePages, ...campsitePages];
}
