---
tags: [area/frontend]
---

# Components

shadcn-style: primitives in `components/ui/*` (cva variants + `cn()` + `forwardRef`), domain components in `components/*`. **Reuse these — don't re-implement.** Tokens from [[Design System]].

## UI primitives (`components/ui/`)
- `Button` — variants: default·ember·outline·ghost·secondary·link; sizes sm·default·lg·icon. `asChild` via Radix Slot.
- `Badge` — default·moss·ember·outline·verified.
- `Input` — themed text field.

## Domain components
| Component | Role |
|---|---|
| `CampsiteCard` | the canonical card (list, rails, sheet). Cover, verified badge, price, dual [[#Rating]], amenity tags, hover lift. Props: `compact`, `active`, `onHover`. |
| `Rating` | star + value + count + source label (Google/สมาชิก). |
| `AmenityIcon` | maps amenity `key` → lucide icon. **Always** go through this, not raw imports. |
| `Logo` | tent SVG + wordmark (`light` variant for dark bg). |
| `SiteHeader` / `SiteFooter` | global chrome; mobile drawer in header. |
| `Hero` | homepage hero — bg image, search, quick filters. |
| `SectionRail` | horizontal-scroll card rail (homepage sections). |

## Map components (`components/map/`) → [[Map Feature]]
- `MapCanvas` — Google map (AdvancedMarker + clustering) **or** fallback projection. See [[ADR-002 Map Fallback]].
- `DetailMap` — single-marker map for detail page.
- `FilterPanel` — all map filters (region, province, rating, price, amenities, verified). Reused on [[Pages & Routes|/campsites]].
- `PreviewCard` — marker-click card (cover, ratings, tags, actions).

## The shared type
`CampsiteLight` (`lib/types.ts`) is the contract between mock, API, and every card/marker. Adding a display field = update type + `toLightDTO` + `mock.ts`. See [[Data Flow]].

## Related
[[Pages & Routes]] · [[Design System]]
