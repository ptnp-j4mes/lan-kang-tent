---
tags: [decision, adr, area/api]
---

# ADR-003 Route Param Naming

**Status:** accepted · **Date:** 2026-06-17

## Context
Spec mixes param names on the same path: `GET /api/campsites/:slug` (detail) vs `POST /api/campsites/:id/favorite` (member). Elysia's router (**memoirist**) throws **at boot** if two routes use *different* dynamic param names at the same path depth:

```
Cannot create route ".../:id/reviews" ... a route already exists
with a different parameter name ("slug") in the same location
```

## Decision
Standardize on **`:id`** for the entire `/api/campsites/:id/*` tree. Lookups that semantically take a slug resolve by **slug-or-id**:

```ts
where: { OR: [{ slug: params.id }, { id: params.id }] }
```

So `/api/campsites/:id` and `/api/campsites/:id/reviews` accept either a slug or a cuid.

## Consequences
- No boot-time router crash; routes from different domain files (`campsites`, `member`) coexist.
- URLs stay clean/slug-friendly for SEO while id access still works.
- **Rule for contributors:** keep param names identical at the same depth. Captured in `.claude/skills/campthai-conventions/SKILL.md` and enforced by the `campthai-reviewer` agent.
- Route conflicts surface only when the API **boots** — always smoke-boot after route edits ([[Endpoints]]). Note port-4000 collision ([[Monorepo Layout]]).

## Related
[[Endpoints]]
