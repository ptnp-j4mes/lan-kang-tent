// Heuristic SEO generator — turns GA4 signals (top pages + search terms) into
// meta title/description/keywords + an AIO summary. No LLM. ponytail: template,
// swap in an LLM later if quality matters.
import type { TopPage, SearchTerm } from "./ga4";

const SEP = /[\s·•|—\-–/,]+/;
const truncate = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…");

// rank distinctive keyword phrases from page titles + search terms
function deriveKeywords(siteName: string, pages: TopPage[], terms: SearchTerm[], max = 12): string[] {
  const freq = new Map<string, number>();
  const bump = (raw: string, weight: number) => {
    const k = raw.trim();
    if (k.length < 2) return;
    if (siteName && k.includes(siteName)) return;
    freq.set(k, (freq.get(k) ?? 0) + weight);
  };
  // search terms are the strongest intent signal
  for (const t of terms) bump(t.term, 5 + Math.min(t.views, 10));
  // page titles: whole title (cleaned) + tokens
  for (const p of pages) {
    const title = p.title.replace(siteName, "").replace(SEP, " ").trim();
    if (title) bump(title, 2);
    for (const tok of p.title.split(SEP)) bump(tok, 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k)
    .filter((k) => !["", "หน้าแรก", "home", "index"].includes(k.toLowerCase()))
    .slice(0, max);
}

export type SeoSuggestion = {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  aioSummary: string;
};

export function generateSeo(
  siteName: string,
  pages: TopPage[],
  terms: SearchTerm[],
): SeoSuggestion {
  const name = siteName || "เว็บไซต์";
  const keywords = deriveKeywords(name, pages, terms);
  const topPhrases = keywords.slice(0, 3).join(" ");
  const topTitles = pages
    .slice(0, 5)
    .map((p) => p.title.replace(name, "").replace(SEP, " ").trim())
    .filter(Boolean);

  const metaTitle = truncate(topPhrases ? `${name} — ${topPhrases}` : name, 60);
  const metaDescription = truncate(
    `${name} ${topTitles.length ? `· เนื้อหายอดนิยม: ${topTitles.join(", ")}` : ""}`.trim() ||
      `${name} — ค้นหาและรีวิวลานกางเต็นท์ทั่วไทย`,
    155,
  );
  const aioSummary = truncate(
    `${name} เป็นแพลตฟอร์มค้นหาและรีวิวลานกางเต็นท์ในประเทศไทย` +
      (keywords.length ? ` หัวข้อที่ผู้ใช้สนใจมากที่สุด: ${keywords.slice(0, 6).join(", ")}` : ""),
    300,
  );

  return { metaTitle, metaDescription, keywords, aioSummary };
}
