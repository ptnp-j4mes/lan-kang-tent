---
tags: [area/frontend, area/map]
---

# Map Feature

The product's centerpiece (`/map`). Orchestrator: `app/map/page.tsx`. Renders [[Components|MapCanvas]] + [[Components|FilterPanel]] + [[Components|PreviewCard]] + list, all bound to one filtered result set.

## Layout
- **Desktop**: left = filters + scrollable list; right = map. Top bar = search, "ใกล้ฉัน", view toggle (Split / Map / List).
- **Mobile**: full-screen map + draggable **bottom sheet** list + floating buttons (Filter / List / Nearby) + filter **drawer**.

## Markers
- Custom **tent pin** (brand pine, ember when selected). Verified → moss dot badge. High rating (≥4.5) → score badge.
- Real map uses Google **AdvancedMarkerElement** + **MarkerClusterer** (cluster on zoom-out, click cluster → zoom in).
- See [[Google Places Integration]] for the browser key.

## Behavior (spec-driven)
- Filter change → markers **and** list update together (single `results` array from `filterCampsites`).
- Click marker → highlight matching card + open [[Components|PreviewCard]]; hover card → highlight marker (`selectedId`/`hoverId`).
- "ค้นหาในพื้นที่นี้" → load campsites for current viewport (bounds query).
- Empty result → empty state + reset button.
- Select province → map zooms to it.

## Nearby mode
Browser Geolocation (consent required). Radius 10/25/50/100 km, distance shown per card. Denied → message + "choose province instead". **Location not persisted** without consent. See [[Auth & Security]].

## Fallback (no Google key)
`MapCanvas` renders a **projected static Thailand map** (lat/lng → % over a TH bounding box) with clickable tent pins + contour backdrop. Lets the whole feature demo with zero API key. Rationale: [[ADR-002 Map Fallback]].

## Performance
Lightweight marker endpoint ([[Endpoints]]), lazy preview, clustering, bounds queries, debounced search, handles ~thousands of markers.

## Related
[[Data Flow]] · [[Design System]] · [[Acceptance Criteria]]
