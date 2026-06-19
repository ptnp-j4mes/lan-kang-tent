---
tags: [area/api, area/integration]
---

# Google Places Integration

Implemented in `apps/api/src/lib/google-places.ts` using **Places API (New) v1**. Two keys, two purposes — see [[Auth & Security]].

| Key | Where | Use |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` | browser | Maps JS — AdvancedMarker + clustering ([[Map Feature]]). Restrict by HTTP referrer. |
| `GOOGLE_MAPS_SERVER_KEY` | server only | Places Text Search + Place Details |

## FieldMask is mandatory
Every Places request sends `X-Goog-FieldMask`. Without it the API errors.

- **Text Search** (`places:searchText`): `places.id, places.displayName, places.formattedAddress, places.location`
- **Place Details** (`places/{id}`): `id, displayName, formattedAddress, location, rating, userRatingCount, reviews, nationalPhoneNumber, websiteUri, regularOpeningHours`

## Admin flow
1. `POST /api/admin/google/search-place` `{ query }` → candidates with `placeId` + coords (map picker autofill).
2. Admin binds `googlePlaceId` to the campsite.
3. `POST /api/admin/google/sync-place/:campsiteId` →
   - updates `googleRating`, `googleUserRatingCount`, `phone`, `websiteUri`
   - **upserts** `google_review_snapshots` (cache)
   - writes `google_sync_logs` (success/failed)

## Caching rule
> [!important]
> Never call Google on a public page render. The detail page reads cached `google_review_snapshots`. Sync is admin-triggered (later: scheduled). See [[Data Flow]].

## Attribution & separation
Google reviews render in their own "รีวิวจาก Google" section with Google's author/time attribution, **separate** from "รีวิวจากสมาชิก CampThai". Scores are never merged without labeling source. See [[Models]] · [[ADR-001 Stack Choice]].

## Related
[[Map Feature]] · [[Endpoints]]
