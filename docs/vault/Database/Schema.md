---
tags: [area/database]
---

# Schema

Prisma + PostgreSQL (`packages/db/prisma/schema.prisma`). Convention: camelCase fields in TS, `snake_case` columns/tables via `@map`/`@@map`. Money = `Int` (THB), coords = `Float`, statuses = enums. See [[Models]] for field-level detail.

## Tables (14)

| Table | Purpose | Key relations |
|---|---|---|
| `users` | members / owners / admins | → campsites, reviews, claims |
| `campsites` | the core entity | → photos, amenities, reviews, snapshots |
| `campsite_photos` | gallery images | source: admin/owner/member/google |
| `amenities` | facility catalog (keyed) | ↔ campsites (M:N) |
| `campsite_amenities` | join table | unique(campsite, amenity) |
| `reviews` | member reviews (7 sub-ratings) | status: pending/approved/rejected |
| `review_photos` | review images | → review |
| `google_review_snapshots` | **cached** Google reviews | unique(campsite, googleReviewId) |
| `favorite_campsites` | saved campsites | unique(user, campsite) |
| `owner_claims` | "I own this" requests | status + reviewer |
| `reports` | abuse reports | targetType: campsite/review |
| `google_sync_logs` | sync audit trail | success/failed |

## Enums

`UserRole` member·owner·admin · `UserStatus` active·suspended·banned · `CampsiteStatus` draft·published·hidden · `LocationAccuracy` unverified·google_verified·owner_confirmed·admin_verified · `PhotoSource` · `ReviewStatus` · `TripType` solo·couple·family·friends · `ClaimStatus` · `ReportTargetType` · `ReportStatus` · `SyncStatus`.

## Indexes that matter
`campsites`: `province`, `region`, `status`, `[latitude, longitude]` — drive [[Map Feature|map]] + filter queries. Reviews indexed by `campsiteId`, `status`.

## Invariants
- `status = published` ⟹ `latitude` AND `longitude` not null. See [[Acceptance Criteria]].
- `member_rating` / `member_review_count` are **derived** — recomputed on review approve/reject/delete (`recomputeRating`).
- Google fields (`google_rating`, snapshots) never mixed into member fields. See [[ADR-001 Stack Choice]].

## Workflow
Edit schema → `bun run db:generate` → `bun run db:migrate`. Update `seed.ts` + `apps/web/lib/mock.ts` to match.

## Related
[[Models]] · [[Endpoints]]
