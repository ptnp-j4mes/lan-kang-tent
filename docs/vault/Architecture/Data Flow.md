---
tags: [area/architecture]
---

# Data Flow

## The mock/API contract

The web app talks to **`lib/api.ts`**, never `fetch` directly. That module has a `USE_API` flag:

- `USE_API = false` (default) → filters `lib/mock.ts` in-browser. App is fully demoable with no backend/DB.
- `USE_API = true` → calls the Elysia API.

> [!important] The contract
> Mock data and API responses share the **same shape** (`CampsiteLight` in [[Components|lib/types.ts]]). Flipping `USE_API` must require zero component changes. When you add a field, add it to the Prisma `toLightDTO`, the API, AND `mock.ts`.

## Map request path (real API)

```
MapCanvas / map page
  → lib/api.ts getMapCampsites(filters)
    → GET /api/map/campsites?bounds&province&amenities&rating&nearbyLat...
      → buildWhere(filters)  (Prisma where)         [[Endpoints]]
      → prisma.campsite.findMany({ select: lightMarkerSelect })
      → toLightDTO(rows)  → tiny marker objects      [[Map Feature]]
  → markers + list render together (single result set)
```

Filter change → one query → markers **and** list update from the same array. Hover/click sync via shared `selectedId`/`hoverId` state.

## Google data path

Admin triggers sync (not per page view):

```
Admin → POST /api/admin/google/sync-place/:campsiteId
  → fetchPlaceDetails(placeId)  [FieldMask]          [[Google Places Integration]]
  → update campsite.googleRating / phone / website
  → upsert google_review_snapshots (cached)          [[Models]]
  → write google_sync_logs
```

Detail page reads cached snapshots — **no live Google call on render**.

## Related
[[Overview]] · [[Auth & Security]]
