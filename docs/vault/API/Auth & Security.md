---
tags: [area/api, area/security]
---

# Auth & Security

## Auth model
- **JWT**, 7-day expiry, `@elysiajs/jwt`. Token carries `sub = userId`.
- `authPlugin` (`src/lib/auth.ts`) `.derive`s `user` from `Authorization: Bearer <token>` on every request (scoped). `user` is `null` when absent/invalid.
- Passwords: `Bun.password.hash(pw, { algorithm: "argon2id" })` + `.verify`. Never plaintext, never bcrypt-by-hand.
- Google OAuth: env wired (`GOOGLE_CLIENT_ID/SECRET`), provider hookup is Phase-near work.

## Guards
```ts
requireUser(user)              // 401 if no user, 403 if not active
requireRole(user, "admin")     // + 403 if role mismatch
```
- Admin routes: `requireRole(user, "admin")` in `.onBeforeHandle`.
- Owner routes: `requireRole(user, "owner", "admin")` **and** per-record `ownerUserId === user.id || role==="admin"`. Ownership is checked server-side from the DB, never trusted from the client.

## RBAC summary
| Role | Can |
|---|---|
| member | review, favorite, report, claim |
| owner | + edit own campsite (safe fields), reply reviews, manage own photos |
| admin | everything: CRUD, location, Google sync, moderation, claim approval, roles |

## Hardening checklist
- [x] Validate every input (`t.Object`) — no raw body trust
- [x] Argon2id password hashing
- [x] Server-side authz on owner/admin actions
- [ ] **Rate limit** login / review / report (planned — flag on these routes)
- [x] Google **server key** server-only; **browser key** referrer-restricted ([[Google Places Integration]])
- [x] Review text rendered as text (no `dangerouslySetInnerHTML`) → XSS-safe
- [ ] Image size/type limits on upload (planned)
- [x] User location not persisted without consent ([[Map Feature|Nearby mode]])

## Secrets
All keys in env (`.env`, gitignored). `NEXT_PUBLIC_*` ships to the browser — only the **referrer-restricted** Maps browser key goes there; the Places server key must never be `NEXT_PUBLIC_`.

## Related
[[Endpoints]] · [[ADR-001 Stack Choice]]
