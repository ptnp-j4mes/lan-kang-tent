---
tags: [reference]
---

# Glossary

- **ลานกางเต็นท์ / campsite** — the only entity in MVP scope. [[Positioning]]
- **Light marker DTO** — minimal campsite shape for the map (`toLightDTO`). [[Endpoints]] · [[Map Feature]]
- **`CampsiteLight`** — shared TS type; the mock↔API↔UI contract. [[Data Flow]]
- **Member rating** — derived avg of *approved* member reviews. [[Models]]
- **Google snapshot** — cached Google review row; kept separate from member reviews. [[Google Places Integration]]
- **FieldMask** — required `X-Goog-FieldMask` header on Places requests. [[Google Places Integration]]
- **Owner claim** — member request to own a campsite; admin-approved → role `owner`. [[Auth & Security]]
- **Location accuracy status** — provenance of coords (unverified → admin_verified). [[Schema]]
- **Fallback map** — projected static TH map when no Google key. [[ADR-002 Map Fallback]]
- **`@ckt/db`** — shared Prisma package. [[Monorepo Layout]]
- **Field Guide** — the visual aesthetic (kraft/pine/ember). [[Design System]]

## Related
[[Home]]
