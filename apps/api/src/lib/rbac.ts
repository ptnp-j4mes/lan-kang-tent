// RBAC — all access control in one place. Roles, guards, and resource ownership.
// Permission matrix lives in docs/vault/Phase 2/Permission Matrix.md.
import { prisma } from "@ckt/db";

export const ROLES = ["member", "owner", "camp_staff", "admin"] as const;
export type Role = (typeof ROLES)[number];

export type AuthUser = {
  id: string;
  role: Role;
  status: string;
} | null;

type Guarded = { status: number; message: string };
const deny = (status: number, message: string): never => {
  throw { status, message } as Guarded;
};

// must be a signed-in, active account
export function requireUser<T extends AuthUser>(user: T): NonNullable<T> {
  if (!user) deny(401, "Unauthorized");
  if (user!.status !== "active") deny(403, "Account not active");
  return user as NonNullable<T>;
}

// must hold one of the given roles
export function requireRole<T extends AuthUser>(user: T, ...roles: Role[]): NonNullable<T> {
  requireUser(user);
  if (!roles.includes(user!.role)) deny(403, "Forbidden");
  return user as NonNullable<T>;
}

// may this user manage this campsite? owner, active staff member, or admin.
// throws 403 otherwise. The single source of truth for camp-scoped writes
// (camp profile, calendar, photos, inquiry reply).
export async function requireCampAccess(user: AuthUser, campsiteId: string): Promise<void> {
  requireUser(user);
  if (user!.role === "admin") return;
  const camp = await prisma.campsite.findUnique({ where: { id: campsiteId }, select: { ownerUserId: true } });
  if (camp?.ownerUserId === user!.id) return;
  const member = await prisma.campOwnerMember.findUnique({
    where: { campsiteId_userId: { campsiteId, userId: user!.id } },
  });
  if (member?.status === "active") return;
  deny(403, "Forbidden");
}
