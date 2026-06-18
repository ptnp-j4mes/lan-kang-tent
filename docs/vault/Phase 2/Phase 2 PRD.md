---
tags: [area/product, phase/2]
---

# Phase 2 PRD

From "find & review campsites" → **"plan a camping trip"**. Owners self-manage profile + open/closed/full days; members plan trips, sync calendars, and send light availability inquiries. **No payment / no booking engine.**

## Roles
Guest · Member · Camp Owner · Camp Staff · Admin. Full grid: [[Permission Matrix]].

## Scope
**In:** camp profile mgmt, owner dashboard, camp calendar (lite), user profile, favorites mgmt, guest favorite + merge, user camping calendar, calendar connection, .ics + Add-to-Google-Calendar, booking inquiry (lite), notifications (in-app), admin moderation.
**Out:** payment, deposit, real-time inventory, dynamic pricing, commission, voucher, full booking engine, real-time chat.

## User flows
```
Guest:  map → favorite (localStorage) → detail → signup → "ย้ายรายการโปรด?" → merge
Member: login → favorite → mark trip dates → see camp calendar status → note/checklist
        → export .ics / Add to Google → go camp → review
Owner:  signup → claim → admin approves → edit profile → manage calendar
        → see interest/insight → reply reviews → handle inquiries
Admin:  review claims → moderate profiles/calendar/inquiries → reports → overview
```

## Sitemap (new)
```
/dashboard            (user)  → profile · favorites · calendar · plans · inquiries · reviews · notifications · settings
/owner                (owner) → overview · profile · photos · amenities · calendar · reviews · inquiries · insights · settings
/campsites/[slug]     (+)     → mini camp calendar · Mark trip · Ask availability
/favorites            (guest) → localStorage list + signup CTA
/admin                (+)     → camp-profiles · calendar moderation · inquiries · activity log
```

## Wireframes (lo-fi)
```
USER DASHBOARD                         OWNER DASHBOARD
┌───────────────┬────────────────┐    ┌──────────────┬─────────────────┐
│ ▸ Profile     │  Favorites grid │    │ ▸ Overview   │ completeness 70% │
│ ▸ Favorites   │  [c][c][c][c]   │    │ ▸ Profile    │ ▓▓▓▓▓▓▓░░░       │
│ ▸ Calendar    │  filter: prov▾  │    │ ▸ Calendar   │ views 120 fav 8  │
│ ▸ Plans       │                 │    │ ▸ Inquiries 3│ inquiries 3      │
│ ▸ Inquiries   │                 │    │ ▸ Insights   │ top day: 12 Jul  │
│ ▸ Reviews     │                 │    └──────────────┴─────────────────┘
│ ▸ Notifs (2)  │                 │
└───────────────┴────────────────┘
CAMP CALENDAR (month)                  USER CAMPING CALENDAR / PLAN
┌─────────────────────────────┐       ┌─────────────────────────────┐
│ Jul 2026   ◀  ▶             │       │ Camp: ดอยเสมอดาว ▾          │
│ M  T  W  T  F  S  S          │       │ 11 Jul → 12 Jul             │
│       1  2  3🟢 4🟢 5🟣      │       │ ⚠ closed on 11 Jul          │
│ 6  7🟠 8  9 10 11🔴12🔴      │       │ party 4 · note ____         │
│ 13🔴(every Mon closed)       │       │ [Add to Google] [.ics]      │
└─────────────────────────────┘       │ [Ask availability]          │
🟢open 🔴closed/full 🟠maint 🟣event   └─────────────────────────────┘
INQUIRY (mobile, short)
┌──────────────────────┐
│ Ask availability     │
│ dates ____  people _ │
│ tents _ cars _ pet☐  │
│ phone ____ msg ____  │
│        [ ส่งคำขอ ]    │
└──────────────────────┘
GUEST FAVORITE: ♥ works logged-out → toast "บันทึกแล้ว · สมัครเพื่อเก็บข้ามอุปกรณ์"
```

## Calendar connection logic
On a chosen date range, check camp events → `closed`/`fully_booked` = **blocking** warning, `maintenance` = warning, `special_event`/notices = info, else "no announcement". Owner changes a marked day → notify affected planners. Impl + tests: `apps/api/src/lib/phase2.ts` `checkCalendar`.

## Acceptance criteria (status)
Backend + logic done; UI per sprint.
- [x] guest favorite no-login + merge on signup (`/api/me/favorites/merge-guest`)
- [x] user profile, favorites, camping plan with dates
- [x] camp calendar status visible before marking (`/calendar/check`)
- [x] .ics export + Add-to-Google-Calendar (URL, no OAuth)
- [x] owner claim → admin approve (Phase 1) → manage profile + calendar
- [x] inquiry create + owner reply + status; both sides notified
- [x] admin moderation (profiles, calendar hide, inquiries, activity log)
- [ ] all dashboard **UI** (owner/user) — pending, per roadmap
- [x] no payment / no real booking

## Roadmap → status
S1 user profile/favorites/guest-merge · S2 camp profile + completeness · S3 camp calendar + mini cal + check · S4 user camping calendar + .ics/gcal · S5 inquiry + notifications · S6 admin moderation + activity + QA.
**All backend + shared logic landed this pass; sprints now = frontend + polish.**

## Related
[[Permission Matrix]] · [[Notification Matrix]] · [[Calendar Sync Plan]] · [[Phase 2 API & Schema]] · [[Home]]
