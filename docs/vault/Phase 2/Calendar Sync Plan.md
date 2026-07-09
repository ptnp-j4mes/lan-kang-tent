---
tags: [phase/2, area/integration]
---

# Calendar Sync Plan

> ponytail: **no Google OAuth in Phase 2.** Export covers the need with zero token storage.

## Two mechanisms (both 1-way, client-triggered)
1. **`.ics` download** — `GET /api/me/camping-plans/:planId/calendar-export?format=ics` → `text/calendar` file. Imports into Apple/Google/Outlook. Built by `buildIcs` (`lib/phase2.ts`).
2. **Add to Google Calendar** — a `calendar.google.com/render?...` URL (`googleCalUrl`). One click, no auth, no scopes. Returned in the default JSON of the same endpoint alongside the `.ics` string.

Default `GET .../calendar-export` (no `format`) → `{ filename, ics, googleCalendarUrl }` so the UI can both offer download and the Google link from one call.

## Event payload
all-day VEVENT · `SUMMARY: Camping at <camp>` · DTSTART/DTEND (**end exclusive, +1 day** — RFC 5545) · LOCATION + GEO · DESCRIPTION = note + detail-page link + phone + Maps link · VALARM reminders **7d & 1d** before. Text escaped (`,;\` + newlines).

## Sync status
`user_camping_plans.calendar_sync_status` ∈ `none | exported | google_added` — set when the user uses an export action. `external_calendar_event_id` reserved for a future 2-way sync.

## When to add real OAuth 2-way sync
Only if users need edits in CampThai to **propagate** to their Google Calendar automatically. Then: Google OAuth + Calendar API insert/update, store refresh token encrypted, handle revocation. Until a user actually asks, the URL + .ics is the whole feature.

## Self-check
`buildIcs`/`googleCalUrl` covered by asserts in `apps/api/src/lib/phase2.ts` (run: `bun run apps/api/src/lib/phase2.ts`) — verifies exclusive end date + encoding.

## Related
[[Phase 2 PRD]] · [[Notification Matrix]]
