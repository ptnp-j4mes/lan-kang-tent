---
tags: [area/api]
---

# Endpoints

Elysia, mounted in `apps/api/src/index.ts`. Swagger UI at `/docs`. All input validated with `t.Object`. See [[Auth & Security]] for guards.

## Public
| Method | Path | Notes |
|---|---|---|
| GET | `/api/campsites` | paginated listing (page/limit/sort + filters) |
| GET | `/api/campsites/:id` | full detail (slug **or** id) |
| GET | `/api/campsites/:id/reviews` | approved member reviews |
| GET | `/api/provinces` | province + counts (filter/landing) |
| GET | `/api/amenities` | facility catalog |

## Map (lightweight) → [[Map Feature]]
| GET | `/api/map/campsites` | marker DTO; params: `bounds, province, region, keyword, rating, priceMin, priceMax, amenities, nearbyLat, nearbyLng, radius, verified` |
| GET | `/api/map/campsites/:id` | preview card |
| GET | `/api/map/nearby` | haversine radius search |

Marker DTO: `id, name, slug, latitude, longitude, province, district, coverImageUrl, googleRating, memberRating, priceMin, tags, isVerified`. Built by `toLightDTO` — **never** heavier. See [[Data Flow]].

## Auth
`POST /api/auth/register` · `/login` · `/logout` · `GET /api/me`. JWT + argon2id.

## Member (auth required)
`POST /api/reviews` · `PATCH/DELETE /api/reviews/:id` · `POST/DELETE /api/campsites/:id/favorite` · `POST /api/campsites/:id/report` · `POST /api/owner-claims`.

## Owner (role: owner/admin, own campsite only)
`GET /api/owner/campsites` · `PATCH /api/owner/campsites/:id` · `POST /api/owner/campsites/:id/photos` · `DELETE /api/owner/photos/:id` · `POST /api/owner/reviews/:id/reply`.

## Admin (role: admin)
Dashboard · campsites CRUD · `PATCH /campsites/:id/location` (map picker) · `POST /google/search-place` · `POST /google/sync-place/:id` → [[Google Places Integration]] · review moderation (`approve`/`reject`) · owner-claims (`approve`/`reject`) · users + role.

## Conventions
- Param names consistent at same depth — all `/api/campsites/:id/*` use `:id`. See [[ADR-003 Route Param Naming]].
- Errors normalized by global `onError`; throw `{ status, message }` or `status(code, {...})`.

## Related
[[Auth & Security]] · [[Schema]]
