---
tags: [moc, campthai]
aliases: [MOC, Index, CampThai Map]
---

# 🏕️ CampThai Map — Knowledge Base

แพลตฟอร์มค้นหาและรีวิว **ลานกางเต็นท์** ในประเทศไทย · map-first · mobile-first.
Repo: `lan-kang-tent`. Core loop: เปิดแผนที่ → เลือกพื้นที่ → ดูลาน → อ่านรีวิว → เดินทาง → กลับมารีวิว.

> [!tip] How to use this vault
> Open in Obsidian. Notes link via `[[wikilinks]]`; open **Graph view** to see structure. Filter by `#tag`.

## 🧭 Maps of Content

### Product
- [[Positioning]] — what & for whom
- [[MVP Scope]] — what's in v1 (camping only)
- [[Acceptance Criteria]] — definition of done
- [[Roadmap]] — phase 2+

### Architecture
- [[Overview]] — system at a glance
- [[Monorepo Layout]] — apps/web · apps/api · packages/db
- [[Data Flow]] — request → DB → UI

### Backend
- [[Endpoints]] — full API surface
- [[Auth & Security]] — JWT, roles, hardening
- [[Google Places Integration]] — Places v1 + FieldMask
- [[Schema]] · [[Models]] — Prisma / PostgreSQL

### Frontend
- [[Design System]] — tokens, fonts, aesthetic
- [[Components]] — reusable UI
- [[Pages & Routes]] — every route
- [[Map Feature]] — the centerpiece

### Decisions
- [[ADR-001 Stack Choice]]
- [[ADR-002 Map Fallback]]
- [[ADR-003 Route Param Naming]]

## ⚡ Quick facts

| | |
|---|---|
| Frontend | Next.js 15 · TS · Tailwind · shadcn-style · `@vis.gl/react-google-maps` |
| Backend | Elysia + Bun · REST · Swagger `/docs` |
| DB | PostgreSQL · Prisma (`@ckt/db`) · Redis |
| Aesthetic | "Field guide" — kraft + pine + ember · Chonburi/Anuphan |
| Run | `bun run db:up && bun run dev` |

## 🔗 See also
- [[Glossary]]
- `README.md` (repo root) · `.claude/skills/campthai-conventions/SKILL.md`
