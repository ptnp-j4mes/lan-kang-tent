# Web — Next.js on Bun. NEXT_PUBLIC_API_URL baked at build (browser uses it).
FROM oven/bun:1
WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile || bun install
RUN cd packages/db && bunx prisma generate

ARG NEXT_PUBLIC_API_URL=http://localhost:4100
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN cd apps/web && bun run build

WORKDIR /app/apps/web
EXPOSE 3100
CMD ["bun", "run", "start"]
