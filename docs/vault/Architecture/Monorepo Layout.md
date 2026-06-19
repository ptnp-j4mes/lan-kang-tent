---
tags: [area/architecture]
---

# Monorepo Layout

Bun workspaces. Root `package.json` defines `workspaces: ["apps/*", "packages/*"]`.

```
lan-kang-tent/
├── apps/
│   ├── web/          Next.js 15 frontend        → :3000
│   │   ├── app/      App Router pages           → [[Pages & Routes]]
│   │   ├── components/  UI + domain comps       → [[Components]]
│   │   └── lib/      api.ts · mock.ts · types.ts · utils.ts
│   └── api/          Elysia + Bun API           → :4000  → [[Endpoints]]
│       └── src/
│           ├── index.ts      app wiring + onError + swagger
│           ├── routes/       map · campsites · auth · member · owner · admin
│           └── lib/          auth · geo · campsite-query · google-places
├── packages/
│   └── db/           @ckt/db — Prisma           → [[Schema]]
│       ├── prisma/schema.prisma · seed.ts
│       └── src/index.ts  (prisma singleton)
├── docker-compose.yml   postgres(+PostGIS) + redis
└── .claude/         skills/ + agents/ (project tooling)
```

## Workspace scripts (root)

| Command | Does |
|---|---|
| `bun run dev` | web + api together |
| `bun run dev:web` / `dev:api` | one app |
| `bun run db:up` | docker postgres + redis |
| `bun run db:generate` / `db:migrate` / `db:seed` | Prisma lifecycle |

## Package names
- `web`, `api` — apps
- `@ckt/db` — shared Prisma client + schema, imported as `import { prisma } from "@ckt/db"`

## Gotcha
API default port **4000 collides** with another local app on this machine. Set `API_PORT` in `.env`. See [[ADR-003 Route Param Naming]] for the other boot-time trap.

## Related
[[Overview]] · [[Data Flow]]
