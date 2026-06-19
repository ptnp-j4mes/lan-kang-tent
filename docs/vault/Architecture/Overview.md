---
tags: [area/architecture]
---

# Overview

CampThai Map is a **map-first** Thai campsite directory. The interactive map is the product's heart; everything else (listing, detail, reviews) supports the "find → decide → travel → review" loop. See [[Positioning]].

## System shape

```
Browser ── Next.js (apps/web) ── REST ──> Elysia API (apps/api) ── Prisma ──> PostgreSQL
                  │                              │
            Google Maps JS                 Google Places (New)  +  Redis cache
            (browser key)                  (server key, FieldMask)
```

- **Web** renders UI + calls the API. Runs standalone on mock data when `USE_API=false`. See [[Data Flow]].
- **API** owns business rules, auth, Google sync, moderation. See [[Endpoints]].
- **DB** is the source of truth. Google data is **cached snapshots**, never live-fetched per page view. See [[Google Places Integration]].

## Design principles

1. **Lightweight map.** Marker endpoint returns a tiny DTO; detail loads lazily. See [[Map Feature]].
2. **Two rating systems, never blended.** Google vs member ratings stay labeled + separate. See [[Models]].
3. **Publish requires coordinates.** No campsite goes live without lat/lng. See [[Acceptance Criteria]].
4. **Mobile-first.** Full-screen map + bottom sheet on phones.
5. **Security by default.** Validate all input, hash with argon2id, scope owner edits. See [[Auth & Security]].

## Related
[[Monorepo Layout]] · [[ADR-001 Stack Choice]]
