import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { mapRoutes } from "./routes/map";
import { campsiteRoutes } from "./routes/campsites";
import { metaRoutes } from "./routes/meta";
import { authRoutes } from "./routes/auth";
import { memberRoutes } from "./routes/member";
import { ownerRoutes } from "./routes/owner";
import { adminRoutes } from "./routes/admin";

const PORT = Number(process.env.API_PORT ?? 4000);

const app = new Elysia()
  .use(
    cors({
      origin: process.env.WEB_ORIGIN ?? true,
      credentials: true,
    }),
  )
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: { title: "CampThai Map API", version: "0.1.0" },
        tags: [
          { name: "map", description: "แผนที่ลานกางเต็นท์" },
          { name: "campsites", description: "ลานกางเต็นท์" },
          { name: "auth", description: "สมาชิก" },
        ],
      },
    }),
  )
  // normalize thrown {status,message} guard errors
  .onError(({ error, set }) => {
    const e = error as any;
    if (e?.status && e?.message) {
      set.status = e.status;
      return { message: e.message };
    }
    set.status = 500;
    return { message: "Internal error" };
  })
  .get("/", () => ({ name: "CampThai Map API", status: "ok" }))
  .get("/health", () => ({ status: "ok", time: new Date().toISOString() }))
  .use(mapRoutes)
  .use(campsiteRoutes)
  .use(metaRoutes)
  .use(authRoutes)
  .use(memberRoutes)
  .use(ownerRoutes)
  .use(adminRoutes)
  .listen(PORT);

console.log(`🏕️  CampThai API → http://localhost:${PORT}  (docs: /docs)`);

export type App = typeof app;
