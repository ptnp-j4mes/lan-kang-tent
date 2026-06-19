import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { prisma } from "@ckt/db";

export const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-in-production";

// JWT plugin (shared)
export const authPlugin = new Elysia({ name: "auth" })
  .use(jwt({ name: "jwt", secret: JWT_SECRET, exp: "7d" }))
  // resolve current user from Authorization: Bearer <token>
  .derive({ as: "scoped" }, async ({ jwt, headers }) => {
    const header = headers.authorization;
    if (!header?.startsWith("Bearer ")) return { user: null };
    const payload = await jwt.verify(header.slice(7));
    if (!payload || typeof payload.sub !== "string") return { user: null };
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, status: true, avatarUrl: true },
    });
    return { user };
  });

// guards — throw 401/403 via status
export function requireUser(user: any) {
  if (!user) throw { status: 401, message: "Unauthorized" };
  if (user.status !== "active") throw { status: 403, message: "Account not active" };
  return user;
}

export function requireRole(user: any, ...roles: string[]) {
  requireUser(user);
  if (!roles.includes(user.role)) throw { status: 403, message: "Forbidden" };
  return user;
}
