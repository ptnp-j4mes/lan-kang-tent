---
tags: [area/frontend, area/seo]
---

# Pages & Routes

Next.js App Router (`apps/web/app`). Server components by default; `"use client"` only where needed. `useSearchParams` pages wrap in `<Suspense>`.

| Route | File | Type | Notes |
|---|---|---|---|
| `/` | `app/page.tsx` | server | [[#Homepage]] |
| `/map` | `app/map/page.tsx` | client | the centerpiece → [[Map Feature]] |
| `/campsites` | `app/campsites/page.tsx` | client | listing + [[Components|FilterPanel]] + sort |
| `/campsites/[slug]` | `.../[slug]/page.tsx` | server | detail + `generateMetadata` |
| `/province` | `app/province/page.tsx` | server | provinces grouped by region |
| `/province/[province]` | dynamic | server | **SEO landing** per province |
| `/reviews` | `app/reviews/page.tsx` | server | community reviews |
| `/owners` | `app/owners/page.tsx` | server | claim funnel → [[Roadmap|owner]] |
| `/login`, `/register` | auth | server | visual (submit wiring pending) |
| `/robots.txt`, `/sitemap.xml` | `robots.ts`, `sitemap.ts` | generated | [[#SEO]] |

## Homepage
Hero (image + search + 8 quick filters) → popular rail → by-province grid → top-rated rail → map teaser → recent reviews. All map to [[MVP Scope]] homepage requirements.

## Detail page sections
Gallery · ratings/price · about · amenities · "เหมาะกับใคร" · "ข้อควรรู้" · rules · single-marker map ([[Components|DetailMap]]) · Google reviews · member reviews · write-review CTA · claim CTA · report. Matches [[Acceptance Criteria]].

## SEO
Per-page `metadata` + `generateMetadata`; OpenGraph; `sitemap.ts` enumerates static + province + campsite URLs; `robots.ts` disallows `/admin`,`/api`. Province landings are the SEO play. Structured data (LocalBusiness/TouristAttraction) = near-term TODO ([[Roadmap]]).

## Not yet built
Admin dashboard UI, owner dashboard UI, auth form actions (APIs exist → [[Endpoints]]).

## Related
[[Components]] · [[Map Feature]]
