# CampThai Map · ลานกางเต็นท์

แพลตฟอร์มค้นหาและรีวิวลานกางเต็นท์ในประเทศไทย — แผนที่ interactive เป็นหัวใจหลัก
เปิดแผนที่ → เลือกพื้นที่ → ดูลานกางเต็นท์ → อ่านรีวิว → ตัดสินใจเดินทาง → กลับมารีวิว

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn-style UI · `@vis.gl/react-google-maps` |
| Backend  | Elysia + Bun · REST API · Swagger (`/docs`) |
| Database | PostgreSQL (PostGIS image) · Prisma ORM |
| Cache    | Redis (docker) |
| Auth     | JWT + `Bun.password` (argon2id) · Google OAuth (ready) |

## Monorepo

```
apps/
  web/        Next.js frontend  (port 3000)
  api/        Elysia API        (port 4000)
packages/
  db/         Prisma schema + client (@ckt/db) + seed
docker-compose.yml   postgres + redis
```

## Quickstart

```bash
bun install
cp .env.example .env

# 1) database
bun run db:up           # docker postgres + redis
bun run db:generate     # prisma client
bun run db:migrate      # create tables
bun run db:seed         # 12 ลานกางเต็นท์ + amenities + admin

# 2) dev (web + api together)
bun run dev
# web → http://localhost:3000   api → http://localhost:4000/docs
```

> หากพอร์ต 4000 ชนกับแอปอื่น ตั้ง `API_PORT` ใน `.env`

### Demo without backend
`apps/web` ทำงานได้ทันทีบน mock data (`lib/mock.ts`) — แค่ `bun run dev:web`
แผนที่มี **fallback** เป็น Thailand map projection เมื่อยังไม่ใส่ Google Maps key

## Google Maps / Places

- Browser key (Maps JS, AdvancedMarkerElement + clustering): `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` — restrict by HTTP referrer
- Server key (Places API New, Place Details + Text Search): `GOOGLE_MAPS_SERVER_KEY` — server-only
- ทุก Places request ส่ง **FieldMask** (ดู `apps/api/src/lib/google-places.ts`)
- Google reviews ถูก cache เป็น `google_review_snapshots` แยกจากรีวิวสมาชิกเสมอ

## Key routes (web)

`/` · `/map` · `/campsites` · `/campsites/[slug]` · `/province` · `/province/[province]` · `/reviews` · `/owners` · `/login`

SEO: `app/sitemap.ts`, `app/robots.ts`, per-page metadata, province landing pages.

## API surface

`/api/map/campsites` (light markers · bounds/nearby/filter) · `/api/campsites` · `/api/auth/*`
· member (reviews/favorites/reports/owner-claims) · `/api/owner/*` · `/api/admin/*` (campsites, Google sync, moderation, claims, users)
Full list in Swagger `/docs`.

## MVP status

✅ Homepage · Map (filter/marker/cluster/preview/nearby) · Listing · Detail · Province landing
· Auth · Member review · Favorite · Owner claim · Admin (campsite CRUD, map picker location, Google sync, moderation)
· Google rating/review snapshot separation · SEO pages

Phase 2: จุดเที่ยว/คาเฟ่ใกล้ลาน · trip planner · booking · owner dashboard · blog · AI recommend
