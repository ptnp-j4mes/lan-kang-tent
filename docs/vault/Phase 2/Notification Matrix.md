---
tags: [phase/2]
---

# Notification Matrix

In-app first (rows in `notifications` table). Email = best-effort later. **Push = not Phase 2.** Helper: `notify()` in `routes/phase2.ts`.

| `type` | To | Trigger | Wired |
|---|---|---|---|
| `new_inquiry` | owner | member sends inquiry | ✅ |
| `inquiry_replied` | member | owner replies | ✅ |
| `camp_calendar_changed` | members w/ overlapping plan | owner adds/edits event on a marked date | ✅ (`notifyAffectedPlans`) |
| `favorite_camp_update` | member | favorited camp posts notice | ⏳ hook when notices ship |
| `trip_reminder` | member | N days before plan start | ⏳ cron (`reminders` already in .ics) |
| `write_review_prompt` | member | day after trip end | ⏳ cron |
| `new_review` | owner | member review posted | ⏳ hook in review create |
| `claim_status` | member | claim approved/rejected | ⏳ hook in admin claim route |
| `profile_completeness` | owner | score < 100, periodic | ⏳ cron |
| `info_report` | owner | user reports bad data | ⏳ hook in report route |

✅ live · ⏳ one `notify(...)` call at the named site (cron ones need a scheduler).

> ponytail: the ⏳ rows are one-liners dropped at existing mutation points; cron-driven ones wait for any scheduler. No notification service/queue until volume needs it — a table + poll covers in-app.

## Read model
`GET /api/me/notifications` → `{ unread, items[50] }`. Mark read: `/:id/read`, `/read-all`. Count kept cheap via `[userId, readAt]` index.

## Related
[[Phase 2 PRD]] · [[Calendar Sync Plan]]
