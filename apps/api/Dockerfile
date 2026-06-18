# API — Elysia on Bun. Build context = repo root (monorepo + @ckt/db).
FROM oven/bun:1
WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile || bun install
RUN cd packages/db && bunx prisma generate

EXPOSE 4000
# apply migrations then start (migrate deploy is idempotent)
CMD ["sh", "-c", "cd /app/packages/db && bunx prisma migrate deploy && cd /app/apps/api && bun run src/index.ts"]
