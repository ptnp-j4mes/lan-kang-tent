import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { mapRoutes } from "./routes/map";
import { campsiteRoutes } from "./routes/campsites";
import { metaRoutes } from "./routes/meta";
import { authRoutes } from "./routes/auth";
import { oauthRoutes } from "./routes/oauth";
import { memberRoutes } from "./routes/member";
import { ownerRoutes } from "./routes/owner";
import { adminRoutes } from "./routes/admin";
import { contentPublicRoutes, contentAdminRoutes } from "./routes/content";
import {
  calendarPublicRoutes,
  meRoutes,
  inquiryCreateRoutes,
  ownerPhase2Routes,
  adminPhase2Routes,
} from "./routes/phase2";

const PORT = Number(process.env.API_PORT ?? 4000);

// WEB_ORIGIN may be a comma-separated list (public web + webmange backoffice).
// Unset = allow any origin (dev).
const corsOrigin = process.env.WEB_ORIGIN
  ? process.env.WEB_ORIGIN.split(",").map((o) => o.trim())
  : true;

const app = new Elysia()
  .use(
    cors({
      origin: corsOrigin,
      credentials: true,
    }),
  )
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: { title: "Larn kang tent API", version: "0.1.0" },
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
  .get("/", () => ({ name: "Larn kang tent API", status: "ok" }))
  .get("/health", () => ({ status: "ok", time: new Date().toISOString() }))
  .use(mapRoutes)
  .use(campsiteRoutes)
  .use(metaRoutes)
  .use(authRoutes)
  .use(oauthRoutes)
  .use(memberRoutes)
  .use(ownerRoutes)
  .use(adminRoutes)
  // Phase 2
  .use(calendarPublicRoutes)
  .use(meRoutes)
  .use(inquiryCreateRoutes)
  .use(ownerPhase2Routes)
  .use(adminPhase2Routes)
  .use(contentPublicRoutes)
  .use(contentAdminRoutes)
  .listen(PORT);

console.log(`🏕️  Larn kang tent API → http://localhost:${PORT}  (docs: /docs)`);

export type App = typeof app;
