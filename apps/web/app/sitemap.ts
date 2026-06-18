import type { MetadataRoute } from "next";
import { MOCK_CAMPSITES, mockProvinces } from "@/lib/mock";
import { getArticles } from "@/lib/api";

const BASE = "https://campthai.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "/map", "/campsites", "/province", "/reviews", "/owners", "/articles"].map((p) => ({
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

  const articles = await getArticles(100).catch(() => []);
  const articlePages = articles.map((a) => ({
    url: `${BASE}/articles/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...provincePages, ...campsitePages, ...articlePages];
}
