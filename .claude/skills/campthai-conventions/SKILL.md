---
name: campthai-conventions
description: Coding conventions for the CampThai Map (lan-kang-tent) monorepo — Elysia API routes, Prisma schema/queries, shadcn-style React components, Tailwind design tokens, the mock/API data pattern, and auth/security rules. Use when adding or editing code anywhere in apps/web, apps/api, or packages/db so changes match existing patterns.
---

# CampThai Map — Conventions

Monorepo (bun workspaces): `apps/web` (Next.js 15), `apps/api` (Elysia+Bun), `packages/db` (`@ckt/db`, Prisma+pgsql). Read [README.md](../../../README.md) and `docs/vault/` for full context.

## Golden rules

1. **Map endpoints stay light.** `/api/map/*` returns the light marker DTO only (`toLightDTO`). Never join full campsite detail into marker queries.
2. **Publish needs coordinates.** Any campsite with `status: published` MUST have `latitude` + `longitude`. Enforce in admin create/patch (return 422 otherwise).
3. **Google ≠ member.** Keep `googleRating`/`google_review_snapshots` separate from `memberRating`/`reviews`. Never blend the two scores without labeling source.
4. **FieldMask always.** Every Google Places (New) request sends `X-Goog-FieldMask`. See `apps/api/src/lib/google-places.ts`.
5. **Mobile-first.** Every web view works on mobile. Map = full screen + bottom sheet + floating buttons on small screens.

## API (Elysia) — `apps/api/src/routes/*`

- One `Elysia({ prefix })` instance per domain file, mounted in `src/index.ts` via `.use()`.
- Validate every input with `t.Object({...})` in the route's `{ body }` / `{ query }` schema. No unvalidated input.
- Errors: throw `{ status, message }` (guards in `lib/auth.ts`) — normalized by the global `onError` in `index.ts`. For inline cases use `status(code, { message })`.
- **Route param names must be identical at the same path depth** (memoirist limit). All `/api/campsites/:id/*` use `:id`; detail/reviews look up by slug-or-id (`OR: [{ slug }, { id }]`).
- Auth: `authPlugin` `.derive`s `user` from `Bearer` token. Use `requireUser(user)` / `requireRole(user, "admin")`. Admin routes call `requireRole` in `.onBeforeHandle`.
- Ownership: owner routes edit only own campsite (`ownerUserId === user.id` || admin). Never trust client-supplied ownership.
- Passwords: `Bun.password.hash(pw, { algorithm: "argon2id" })` + `.verify`. Never store plaintext.
- After review approve/reject/delete, call `recomputeRating(campsiteId)`.

## Prisma — `packages/db`

- `snake_case` columns via `@map`, `@@map` table names; camelCase fields in TS.
- Money = `Int` (THB). Coordinates = `Float`. Enums for status/role/type — extend the enum, don't use free strings.
- Import the singleton: `import { prisma } from "@ckt/db"`. Don't `new PrismaClient()` elsewhere.
- After schema edits: `bun run db:generate` then `bun run db:migrate`. Mirror seed-relevant changes in `prisma/seed.ts` AND `apps/web/lib/mock.ts`.

## Web (Next.js) — `apps/web`

- App Router. Server components by default; add `"use client"` only when using state/effects/browser APIs. Pages using `useSearchParams` must wrap in `<Suspense>`.
- Data: components call helpers in `lib/api.ts`. It runs on `lib/mock.ts` when `USE_API=false`. Keep mock shape === API DTO (`CampsiteLight`). When wiring real API, flip `USE_API` and keep the same function signatures.
- Types live in `lib/types.ts`. `CampsiteLight` is the shared marker/card shape.
- Components: shadcn-style in `components/ui/*` (cva variants, `cn()` merge, `forwardRef`). Domain components in `components/*`. Reuse `CampsiteCard`, `Rating`, `AmenityIcon`, `FilterPanel`, `PreviewCard` — don't re-implement.
- Icons: `lucide-react`. Amenity icons go through `AmenityIcon` (keyed map), not raw imports.

## Design tokens (Tailwind) — never hardcode hex

- Colors via CSS vars in `app/globals.css` + `tailwind.config.ts`: `primary` (pine), `ember` (CTA accent), `secondary` (sand), `moss`, `clay`, `muted`, `card`, `background` (kraft). Use `bg-ember`, `text-primary`, `border-border` — not `#xxxxxx`.
- Fonts: `font-display` (Chonburi) for headings, `font-sans` (Anuphan) for body. Both support Thai.
- Radius `rounded-xl`/`2xl`/`full`; shadows `shadow-field` / `shadow-lift`. Hero/panels use `.grain`; section breaks use `.topo-divider`.
- Animation: `animate-fade-up` with staggered `animationDelay` for load reveals.

## Security checklist (every PR)

- [ ] Input validated (`t.Object`) · [ ] Owner/admin authz enforced server-side · [ ] No API key in client bundle (server key server-only; browser key referrer-restricted) · [ ] Review text rendered as text (no `dangerouslySetInnerHTML`) · [ ] Rate-limit-sensitive routes (login/review/report) flagged · [ ] User location not persisted without consent.

## Copy / locale

Thai-first UI. User-facing strings in Thai; code/comments may be English. Currency `฿`, distance `กม.`/`ม.` via `formatPrice` / `formatKm` in `lib/utils.ts`.
