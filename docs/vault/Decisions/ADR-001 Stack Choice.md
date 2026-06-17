---
tags: [decision, adr]
---

# ADR-001 Stack Choice

**Status:** accepted · **Date:** 2026-06-17

## Context
Map-first Thai campsite platform, mobile-first, SEO-dependent (province landings), with Google Maps/Places at the core. Solo/small team, want fast iteration + type safety end to end.

## Decision
- **Frontend:** Next.js 15 (App Router) + TS + Tailwind + shadcn-style. SSR/metadata for SEO; React ecosystem for Google Maps wrappers (`@vis.gl/react-google-maps` → AdvancedMarker + clustering).
- **Backend:** Elysia on **Bun** — fast, TS-native, `Bun.password` (argon2id) built in, Swagger plugin.
- **DB:** PostgreSQL + Prisma. Postgres full-text for MVP search; PostGIS image ready for geo later.
- **Cache:** Redis (Google data, hot queries).
- **Monorepo:** bun workspaces, shared `@ckt/db`. See [[Monorepo Layout]].

## Consequences
- One language (TS) across web/api/db. Shared types reduce drift ([[Data Flow]]).
- Bun is young — watch library compatibility (already hit a route-naming quirk, [[ADR-003 Route Param Naming]]).
- Google data **cached**, not live — keeps cost/latency down, requires sync job ([[Google Places Integration]]).
- Two rating systems kept separate by schema design ([[Models]]), preventing accidental blending.

## Related
[[Overview]] · [[Auth & Security]]
