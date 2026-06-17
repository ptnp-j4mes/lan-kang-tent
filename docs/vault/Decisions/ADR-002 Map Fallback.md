---
tags: [decision, adr, area/map]
---

# ADR-002 Map Fallback

**Status:** accepted · **Date:** 2026-06-17

## Context
The map is the centerpiece ([[Map Feature]]), but Google Maps needs a billing-enabled API key. During dev, demos, and onboarding, no key is often present — a blank/broken map would make the whole product undemoable.

## Decision
`MapCanvas` detects `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY`:
- **Key present** → real Google map: AdvancedMarkerElement + MarkerClusterer.
- **Key absent** → **fallback**: a projected static Thailand map. Lat/lng projected as `%` over a TH bounding box (lat 5.6–20.5, lng 97.3–105.7) onto a contour-textured panel, with the same clickable tent pins + selection/verified states.

Same for `DetailMap` (single marker).

## Consequences
- Whole app demoable with **zero** external dependency (pairs with mock data, [[Data Flow]]).
- Fallback is approximate (linear projection, no real basemap, no clustering) — acceptable for demo, not production.
- A small banner tells devs to add the key for the real map.
- Slight extra code path to maintain in `MapCanvas`.

## Related
[[Map Feature]] · [[Google Places Integration]]
