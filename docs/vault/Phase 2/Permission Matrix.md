---
tags: [area/security, phase/2]
---

# Permission Matrix

✅ allowed · 🟡 own records only · 🔶 if owner grants (staff) · ❌ no. Enforced server-side in `apps/api/src/routes/phase2.ts` (`campAccess`, `requireRole`). See [[Auth & Security]].

| Action | Guest | Member | Staff | Owner | Admin |
|---|---|---|---|---|---|
| View map / camp detail / public calendar | ✅ | ✅ | ✅ | ✅ | ✅ |
| Favorite (localStorage) | ✅ | – | – | – | – |
| Favorite (account) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Write/edit review | ❌ | 🟡 | 🟡 | 🟡 | ✅ |
| Camping plan + .ics/gcal | ❌ | 🟡 | 🟡 | 🟡 | ✅ |
| Send inquiry | ❌ | ✅ | ✅ | ✅ | ✅ |
| Edit camp profile | ❌ | ❌ | 🔶 | 🟡(claimed) | ✅ |
| Manage camp calendar | ❌ | ❌ | 🔶 | 🟡 | ✅ |
| Reply / status inquiry | ❌ | ❌ | 🔶 | 🟡 | ✅ |
| View inquiry contact phone | ❌ | 🟡(own) | 🔶 | 🟡(their camp) | ✅ |
| Add camp staff | ❌ | ❌ | ❌ | 🟡 | ✅ |
| Approve claim / suspend owner | ❌ | ❌ | ❌ | ❌ | ✅ |
| Hide calendar event / moderate profile | ❌ | ❌ | ❌ | ❌ | ✅ |
| View activity logs | ❌ | ❌ | ❌ | 🟡(own camp)* | ✅ |

\* owner-facing activity log = near-term; admin has it now.

## Hard rules
- Private inquiry `ownerNote` + private calendar events (`isPublic=false`) never in public responses.
- User phone exposed only to: that user, the camp's owner/granted staff, admin.
- Every owner/staff write re-checks `campAccess` against the DB — never trusts client role.
- Inquiry create rate-limited (3/min/user). XSS: all text stored raw, escaped at render (React).

## Related
[[Phase 2 PRD]] · [[Phase 2 API & Schema]]
