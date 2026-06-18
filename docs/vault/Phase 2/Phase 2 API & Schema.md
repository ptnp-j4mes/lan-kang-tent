---
tags: [area/api, area/database, phase/2]
---

# Phase 2 API & Schema

Extends [[Schema]] / [[Endpoints]]. Code: `packages/db/prisma/schema.prisma`, `apps/api/src/routes/phase2.ts`, logic in `apps/api/src/lib/phase2.ts`.

## New tables
`camp_profiles` (1:1 Campsite, owner-editable layer) · `camp_owner_members` (owner/staff) · `camp_calendar_events` · `user_profiles` · `user_camping_plans` · `booking_inquiries` · `notifications` · `camp_profile_activity_logs` · `favorite_merge_logs`. `favorite_campsites` gained `source`.

**Skipped:** `guest_favorites` table → guests use localStorage; merge POSTs the id list. Add only if pre-signup favorites must survive across devices.

## Enums
`ProfileStatus` · `CampMemberRole` · `CampMemberStatus` · `CalendarEventType` (open/closed/fully_booked/maintenance/private_event/special_event/holiday_notice/weather_notice) · `PlanStatus` · `InquiryStatus`. `UserRole` gained `camp_staff`.

## Endpoints (live)
**Public:** `GET /api/campsites/:id/calendar` · `GET /api/campsites/:id/calendar/check?startDate&endDate`
**Member `/api/me`:** `GET/PATCH /profile` · `GET /favorites` · `POST/DELETE /favorites/:campId` · `POST /favorites/merge-guest` · `GET/POST/PATCH/DELETE /camping-plans[/:id]` · `GET /camping-plans/:id/calendar-export` · `GET /notifications` · `PATCH /notifications/:id/read` · `PATCH /notifications/read-all` · `GET /inquiries` · `PATCH /inquiries/:id/cancel`
**Create inquiry:** `POST /api/campsites/:id/inquiries` (rate-limited 3/min)
**Owner/staff `/api/owner`:** `GET /camp-profiles` · `PATCH /camp-profiles/:campId` · `POST /campsites/:id/calendar-events` · `PATCH/DELETE /calendar-events/:eventId` · `GET /inquiries` · `PATCH /inquiries/:id/reply` · `PATCH /inquiries/:id/status`
**Admin `/api/admin`:** `GET/PATCH /camp-profiles[/:campId]` · `GET /calendar-events` · `PATCH /calendar-events/:eventId/hide` · `GET /inquiries` · `GET /activity-logs`

## Deviations from spec (ponytail)
- `google-calendar-sync` POST → folded into `calendar-export` (returns `googleCalendarUrl`). No OAuth. [[Calendar Sync Plan]]
- Owner-claim endpoints already exist (Phase 1) — not duplicated.
- Param names unified to `:id` under shared prefixes ([[ADR-003 Route Param Naming]]).

## Conventions kept
Every input `t.Object`-validated · owner/staff writes gated by `campAccess` · private notes/events never public · phone exposure limited. [[Permission Matrix]]

## Related
[[Phase 2 PRD]] · [[Schema]] · [[Endpoints]]
