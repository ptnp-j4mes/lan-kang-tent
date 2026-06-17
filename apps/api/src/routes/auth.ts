import { Elysia, t } from "elysia";
import { prisma } from "@ckt/db";
import { authPlugin } from "../lib/auth";

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .use(authPlugin)
  .post(
    "/register",
    async ({ body, jwt, status }) => {
      const existing = await prisma.user.findUnique({ where: { email: body.email } });
      if (existing) return status(409, { message: "อีเมลนี้ถูกใช้แล้ว" });

      const passwordHash = await Bun.password.hash(body.password, {
        algorithm: "argon2id",
      });
      const user = await prisma.user.create({
        data: { name: body.name, email: body.email, passwordHash },
        select: { id: true, name: true, email: true, role: true },
      });
      const token = await jwt.sign({ sub: user.id });
      return { token, user };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2, maxLength: 80 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8, maxLength: 100 }),
      }),
    },
  )
  .post(
    "/login",
    async ({ body, jwt, status }) => {
      const user = await prisma.user.findUnique({ where: { email: body.email } });
      if (!user || !user.passwordHash)
        return status(401, { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
      const ok = await Bun.password.verify(body.password, user.passwordHash);
      if (!ok) return status(401, { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
      if (user.status !== "active") return status(403, { message: "บัญชีถูกระงับ" });

      const token = await jwt.sign({ sub: user.id });
      return {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    },
  )
  .post("/logout", () => ({ ok: true })) // stateless JWT — client drops token
  .get("/me", ({ user, status }) => {
    if (!user) return status(401, { message: "Unauthorized" });
    return user;
  });
