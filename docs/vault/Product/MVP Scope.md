---
tags: [area/product, status/mvp]
---

# MVP Scope

Camping only. Status as of current build.

| # | Feature | Status |
|---|---|---|
| 1 | Homepage | ✅ [[Pages & Routes#Homepage]] |
| 2 | Thailand Camping Map | ✅ [[Map Feature]] |
| 3 | Campsite listing | ✅ `/campsites` |
| 4 | Campsite detail | ✅ `/campsites/[slug]` |
| 5 | Google Place ID integration | ✅ API ([[Google Places Integration]]) |
| 6 | Google rating/review snapshot | ✅ schema + sync ([[Models]]) |
| 7 | Member register/login | ⚙️ API ✅, web form visual only |
| 8 | Member review | ✅ API ([[Endpoints]]) |
| 9 | Favorite campsite | ✅ API |
| 10 | Admin campsite mgmt | ⚙️ API ✅, **UI pending** |
| 11 | Admin map picker | ⚙️ `PATCH /location` ✅, UI pending |
| 12 | Admin review moderation | ⚙️ API ✅, UI pending |
| 13 | Owner claim request | ⚙️ API ✅, funnel page ✅ |
| 14 | Province landing pages | ✅ `/province/[province]` |
| 15 | SEO-ready pages | ✅ sitemap/robots/metadata |

Legend: ✅ done · ⚙️ partial (backend ready, UI to build).

## Next to close MVP
1. Wire web → API (flip `USE_API`, see [[Data Flow]]).
2. Auth form actions (register/login submit).
3. Admin dashboard UI: campsite CRUD + **map picker** + moderation queue.

## Explicitly NOT in MVP
cafe/restaurant/waterfall/viewpoint POIs · route planning · itinerary · booking — see [[Roadmap]].

## Related
[[Acceptance Criteria]] · [[Positioning]]
