---
tags: [area/database]
---

# Models

Field-level reference for the two central models. Full list in [[Schema]] / `schema.prisma`.

## Campsite

| Field | Type | Notes |
|---|---|---|
| `id` | cuid | |
| `name`, `slug` | string | slug unique, used in URL `/campsites/[slug]` |
| `description` | string? | |
| `province`, `district`, `subdistrict`, `address` | string | `province` + `region` drive filters |
| `region` | string? | north/northeast/central/east/west/south |
| `latitude`, `longitude` | Float? | required to publish |
| `priceMin`, `priceMax` | Int? | THB |
| `phone`, `websiteUrl`, `facebookUrl`, `lineId` | string? | contact |
| `googlePlaceId` | string? unique | link to Google |
| `googleRating`, `googleUserRatingCount` | from Google sync | **never** blended with member |
| `memberRating`, `memberReviewCount` | derived | via `recomputeRating` |
| `status` | enum | draft/published/hidden |
| `ownerUserId` | FK? | set on claim approval |
| `locationAccuracyStatus` | enum | provenance of coords |
| `isVerified` | bool | verified badge on marker/card |
| `createdBy` | FK? | admin/creator |

Relations: `photos`, `amenities` (via join), `reviews`, `googleSnapshots`, `favorites`, `ownerClaims`, `syncLogs`.

## Review

Overall + 6 sub-ratings (1–5): `ratingOverall`, `cleanliness`, `facility`, `view`, `accessibility`, `safety`, `value`. Plus `tripType`, `visitDate`, `comment`, `ownerReply`/`ownerReplyAt`, `status` (moderation), `photos`.

> [!warning] Moderation
> New reviews start `status: pending`. Only `approved` reviews appear publicly and count toward `memberRating`. Editing a review resets it to `pending`.

## google_review_snapshots
Cached copy of Google reviews so the UI never live-calls Google. Carries Google's own `authorName`/`authorUrl`/`relativeTimeDescription` for **attribution**. See [[Google Places Integration]].

## Related
[[Schema]] · [[Auth & Security]] · [[Map Feature]]
