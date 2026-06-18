import { Elysia, t } from "elysia";
import { prisma } from "@ckt/db";
import { authPlugin } from "../lib/auth";
import { requireUser, requireRole, requireCampAccess } from "../lib/rbac";
import { buildIcs, googleCalUrl, checkCalendar, mergeFavorites, completenessScore, type PlanExport } from "../lib/phase2";

const WEB = process.env.WEB_ORIGIN ?? "http://localhost:3000";

const notify = (userId: string, type: string, title: string, message?: string, targetType?: string, targetId?: string) =>
  prisma.notification.create({ data: { userId, type, title, message, targetType, targetId } });

// ponytail: in-memory throttle, single-instance only. Move to Redis if you scale out.
const inquiryHits = new Map<string, number[]>();
function rateLimitInquiry(userId: string) {
  const now = Date.now();
  const arr = (inquiryHits.get(userId) ?? []).filter((t) => now - t < 60_000);
  if (arr.length >= 3) throw { status: 429, message: "ส่งคำขอบ่อยเกินไป ลองใหม่ใน 1 นาที" };
  arr.push(now);
  inquiryHits.set(userId, arr);
}

async function planExport(planId: string, userId: string): Promise<PlanExport> {
  const p = await prisma.userCampingPlan.findFirst({
    where: { id: planId, userId },
    include: { campsite: { select: { name: true, slug: true, latitude: true, longitude: true, phone: true } } },
  });
  if (!p) throw { status: 404, message: "Not found" };
  return {
    id: p.id,
    campName: p.campsite.name,
    startDate: p.startDate,
    endDate: p.endDate,
    latitude: p.campsite.latitude,
    longitude: p.campsite.longitude,
    campPhone: p.campsite.phone,
    note: p.note,
    detailUrl: `${WEB}/campsites/${p.campsite.slug}`,
  };
}

// ---------- public: camp calendar ----------
export const calendarPublicRoutes = new Elysia({ prefix: "/api/campsites" })
  .get(
    "/:id/calendar",
    async ({ params, query }) => {
      const where: any = { campsiteId: params.id, isPublic: true, isHidden: false };
      if (query.from && query.to) {
        where.startDate = { lte: new Date(query.to) };
        where.endDate = { gte: new Date(query.from) };
      }
      return prisma.campCalendarEvent.findMany({ where, orderBy: { startDate: "asc" } });
    },
    { query: t.Object({ from: t.Optional(t.String()), to: t.Optional(t.String()) }) },
  )
  .get(
    "/:id/calendar/check",
    async ({ params, query }) => {
      const events = await prisma.campCalendarEvent.findMany({
        where: { campsiteId: params.id, isPublic: true, isHidden: false },
      });
      return checkCalendar(events as any, query.startDate, query.endDate);
    },
    { query: t.Object({ startDate: t.String(), endDate: t.String() }) },
  );

// ---------- member (auth) ----------
export const meRoutes = new Elysia({ prefix: "/api/me" })
  .use(authPlugin)
  .onBeforeHandle(({ user }) => {
    requireUser(user);
  })
  // who am I (bare /api/me)
  .get("/", ({ user }) => user)
  // profile
  .get("/profile", async ({ user }) =>
    prisma.userProfile.upsert({
      where: { userId: user!.id },
      update: {},
      create: { userId: user!.id, displayName: user!.name },
    }),
  )
  .patch(
    "/profile",
    async ({ user, body }) =>
      prisma.userProfile.upsert({
        where: { userId: user!.id },
        update: body as any,
        create: { userId: user!.id, ...(body as any) },
      }),
    {
      body: t.Object({
        displayName: t.Optional(t.String({ maxLength: 80 })),
        avatarUrl: t.Optional(t.String()),
        bio: t.Optional(t.String({ maxLength: 500 })),
        homeProvince: t.Optional(t.String()),
        campingStyle: t.Optional(t.Array(t.String())),
        phone: t.Optional(t.String({ maxLength: 30 })),
        website: t.Optional(t.String({ maxLength: 200 })),
        socialFacebook: t.Optional(t.String({ maxLength: 200 })),
        socialInstagram: t.Optional(t.String({ maxLength: 200 })),
        socialLine: t.Optional(t.String({ maxLength: 100 })),
        notificationSettings: t.Optional(t.Any()),
      }),
    },
  )
  // favorites
  .get("/favorites", async ({ user }) =>
    prisma.favoriteCampsite.findMany({
      where: { userId: user!.id },
      include: {
        campsite: {
          select: {
            name: true, slug: true, province: true, district: true,
            priceMin: true, priceMax: true, isVerified: true,
            memberRating: true, googleRating: true, memberReviewCount: true,
            photos: { take: 1, orderBy: { sortOrder: "asc" }, select: { imageUrl: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  )
  .post(
    "/favorites/:campId",
    async ({ user, params, body, status }) => {
      await prisma.favoriteCampsite.upsert({
        where: { userId_campsiteId: { userId: user!.id, campsiteId: params.campId } },
        update: {},
        create: { userId: user!.id, campsiteId: params.campId, source: body?.source ?? "detail" },
      });
      return status(201, { ok: true });
    },
    { body: t.Optional(t.Object({ source: t.Optional(t.String()) })) },
  )
  .delete("/favorites/:campId", async ({ user, params }) => {
    await prisma.favoriteCampsite.deleteMany({ where: { userId: user!.id, campsiteId: params.campId } });
    return { ok: true };
  })
  .post(
    "/favorites/merge-guest",
    async ({ user, body }) => {
      const existing = (await prisma.favoriteCampsite.findMany({ where: { userId: user!.id }, select: { campsiteId: true } })).map((f) => f.campsiteId);
      const { toAdd, mergedCount, duplicateCount } = mergeFavorites(existing, body.campsiteIds);
      if (toAdd.length)
        await prisma.favoriteCampsite.createMany({
          data: toAdd.map((campsiteId) => ({ userId: user!.id, campsiteId, source: "guest_merge" })),
          skipDuplicates: true,
        });
      await prisma.favoriteMergeLog.create({ data: { userId: user!.id, guestSessionId: body.guestSessionId, mergedCount, duplicateCount } });
      return { mergedCount, duplicateCount };
    },
    { body: t.Object({ campsiteIds: t.Array(t.String()), guestSessionId: t.Optional(t.String()) }) },
  )
  // camping plans
  .get("/camping-plans", async ({ user }) =>
    prisma.userCampingPlan.findMany({
      where: { userId: user!.id },
      include: {
        campsite: {
          select: {
            name: true, slug: true, province: true, district: true,
            photos: { take: 1, orderBy: { sortOrder: "asc" }, select: { imageUrl: true } },
          },
        },
      },
      orderBy: { startDate: "asc" },
    }),
  )
  .post(
    "/camping-plans",
    async ({ user, body, status }) => {
      const plan = await prisma.userCampingPlan.create({
        data: {
          userId: user!.id,
          campsiteId: body.campsiteId,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          status: (body.status as any) ?? "interested",
          partySize: body.partySize,
          note: body.note,
          checklistJson: body.checklist,
        },
      });
      return status(201, plan);
    },
    {
      body: t.Object({
        campsiteId: t.String(),
        startDate: t.String(),
        endDate: t.String(),
        status: t.Optional(t.String()),
        partySize: t.Optional(t.Integer()),
        note: t.Optional(t.String({ maxLength: 2000 })),
        checklist: t.Optional(t.Any()),
      }),
    },
  )
  .patch("/camping-plans/:planId", async ({ user, params, body, status }) => {
    const owned = await prisma.userCampingPlan.findFirst({ where: { id: params.planId, userId: user!.id } });
    if (!owned) return status(404, { message: "Not found" });
    const d: any = { ...body };
    if (d.startDate) d.startDate = new Date(d.startDate);
    if (d.endDate) d.endDate = new Date(d.endDate);
    return prisma.userCampingPlan.update({ where: { id: params.planId }, data: d });
  })
  .delete("/camping-plans/:planId", async ({ user, params }) => {
    await prisma.userCampingPlan.deleteMany({ where: { id: params.planId, userId: user!.id } });
    return { ok: true };
  })
  // export: .ics download OR JSON with both ics + google link (no OAuth needed)
  .get(
    "/camping-plans/:planId/calendar-export",
    async ({ user, params, query, set }) => {
      const p = await planExport(params.planId, user!.id);
      const ics = buildIcs(p);
      if (query.format === "ics") {
        set.headers["content-type"] = "text/calendar; charset=utf-8";
        set.headers["content-disposition"] = `attachment; filename="camping-${p.id}.ics"`;
        return ics;
      }
      return { filename: `camping-${p.id}.ics`, ics, googleCalendarUrl: googleCalUrl(p) };
    },
    { query: t.Object({ format: t.Optional(t.String()) }) },
  )
  // notifications
  .get("/notifications", async ({ user }) => {
    const [items, unread] = await Promise.all([
      prisma.notification.findMany({ where: { userId: user!.id }, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.notification.count({ where: { userId: user!.id, readAt: null } }),
    ]);
    return { unread, items };
  })
  .patch("/notifications/:id/read", async ({ user, params }) => {
    await prisma.notification.updateMany({ where: { id: params.id, userId: user!.id }, data: { readAt: new Date() } });
    return { ok: true };
  })
  .patch("/notifications/read-all", async ({ user }) => {
    await prisma.notification.updateMany({ where: { userId: user!.id, readAt: null }, data: { readAt: new Date() } });
    return { ok: true };
  })
  // my inquiries
  .get("/inquiries", async ({ user }) =>
    prisma.bookingInquiry.findMany({
      where: { userId: user!.id },
      include: {
        campsite: {
          select: {
            name: true, slug: true, province: true, phone: true, lineId: true,
            photos: { take: 1, orderBy: { sortOrder: "asc" }, select: { imageUrl: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  )
  .patch("/inquiries/:id/cancel", async ({ user, params }) => {
    await prisma.bookingInquiry.updateMany({ where: { id: params.id, userId: user!.id }, data: { status: "cancelled" } });
    return { ok: true };
  })
  .patch("/inquiries/:id/confirm", async ({ user, params }) => {
    await prisma.bookingInquiry.updateMany({ where: { id: params.id, userId: user!.id }, data: { status: "user_confirmed" } });
    return { ok: true };
  });

// ---------- create inquiry (auth, rate-limited) ----------
export const inquiryCreateRoutes = new Elysia({ prefix: "/api/campsites" })
  .use(authPlugin)
  .post(
    "/:id/inquiries",
    async ({ user, params, body, status }) => {
      requireUser(user);
      rateLimitInquiry(user!.id);
      const inq = await prisma.bookingInquiry.create({
        data: {
          userId: user!.id,
          campsiteId: params.id,
          campingPlanId: body.campingPlanId,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          partySize: body.partySize,
          tentCount: body.tentCount,
          carCount: body.carCount,
          hasPet: body.hasPet ?? false,
          contactPhone: body.contactPhone,
          message: body.message,
          status: "sent",
        },
      });
      const camp = await prisma.campsite.findUnique({ where: { id: params.id }, select: { name: true, ownerUserId: true } });
      if (camp?.ownerUserId) await notify(camp.ownerUserId, "new_inquiry", `มีคำขอใหม่ที่ ${camp.name}`, undefined, "inquiry", inq.id);
      return status(201, inq);
    },
    {
      body: t.Object({
        startDate: t.String(),
        endDate: t.String(),
        partySize: t.Optional(t.Integer()),
        tentCount: t.Optional(t.Integer()),
        carCount: t.Optional(t.Integer()),
        hasPet: t.Optional(t.Boolean()),
        contactPhone: t.Optional(t.String({ maxLength: 20 })),
        message: t.Optional(t.String({ maxLength: 1000 })),
        campingPlanId: t.Optional(t.String()),
      }),
    },
  );

// ---------- owner / staff ----------
export const ownerPhase2Routes = new Elysia({ prefix: "/api/owner" })
  .use(authPlugin)
  .onBeforeHandle(({ user }) => {
    requireRole(user, "owner", "camp_staff", "admin");
  })
  // camp profile
  .get("/camp-profiles", async ({ user }) => {
    if (user!.role === "admin") return prisma.campProfile.findMany({ take: 100 });
    const camps = await prisma.campsite.findMany({ where: { ownerUserId: user!.id }, select: { id: true } });
    return prisma.campProfile.findMany({ where: { campsiteId: { in: camps.map((c) => c.id) } } });
  })
  .patch(
    "/camp-profiles/:campId",
    async ({ user, params, body }) => {
      await requireCampAccess(user, params.campId);
      const profile = await prisma.campProfile.upsert({
        where: { campsiteId: params.campId },
        update: body as any,
        create: { campsiteId: params.campId, ownerUserId: user!.id, ...(body as any) },
      });
      await prisma.campProfileActivityLog.create({
        data: { campsiteId: params.campId, actorUserId: user!.id, action: "update_profile", newValueJson: body as any },
      });
      return profile;
    },
    {
      body: t.Object({
        displayName: t.Optional(t.String({ maxLength: 120 })),
        bio: t.Optional(t.String({ maxLength: 2000 })),
        contactPhone: t.Optional(t.String()),
        contactLine: t.Optional(t.String()),
        contactFacebook: t.Optional(t.String()),
        contactWebsite: t.Optional(t.String()),
      }),
    },
  )
  // calendar events
  .post(
    "/campsites/:id/calendar-events",
    async ({ user, params, body, status }) => {
      await requireCampAccess(user, params.id);
      const ev = await prisma.campCalendarEvent.create({
        data: {
          campsiteId: params.id,
          title: body.title,
          eventType: body.eventType as any,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          note: body.note,
          isPublic: body.isPublic ?? true,
          recurrenceRule: body.recurrenceRule,
          createdBy: user!.id,
        },
      });
      // notify users who planned across this range that the camp status changed
      await notifyAffectedPlans(params.campId, ev.startDate, ev.endDate);
      return status(201, ev);
    },
    {
      body: t.Object({
        eventType: t.String(),
        startDate: t.String(),
        endDate: t.String(),
        title: t.Optional(t.String()),
        note: t.Optional(t.String({ maxLength: 500 })),
        isPublic: t.Optional(t.Boolean()),
        recurrenceRule: t.Optional(t.String()),
      }),
    },
  )
  .patch("/calendar-events/:eventId", async ({ user, params, body, status }) => {
    const ev = await prisma.campCalendarEvent.findUnique({ where: { id: params.eventId } });
    if (!ev) return status(404, { message: "Not found" });
    await requireCampAccess(user, ev.campsiteId);
    const d: any = { ...body };
    if (d.startDate) d.startDate = new Date(d.startDate);
    if (d.endDate) d.endDate = new Date(d.endDate);
    return prisma.campCalendarEvent.update({ where: { id: params.eventId }, data: d });
  })
  .delete("/calendar-events/:eventId", async ({ user, params, status }) => {
    const ev = await prisma.campCalendarEvent.findUnique({ where: { id: params.eventId } });
    if (!ev) return status(404, { message: "Not found" });
    await requireCampAccess(user, ev.campsiteId);
    await prisma.campCalendarEvent.delete({ where: { id: params.eventId } });
    return { ok: true };
  })
  // inquiries (owner side)
  .get("/inquiries", async ({ user, query }) => {
    const camps = user!.role === "admin"
      ? undefined
      : (await prisma.campsite.findMany({ where: { ownerUserId: user!.id }, select: { id: true } })).map((c) => c.id);
    return prisma.bookingInquiry.findMany({
      where: { ...(camps ? { campsiteId: { in: camps } } : {}), ...(query.status ? { status: query.status as any } : {}) },
      include: { campsite: { select: { name: true } }, user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  })
  .patch(
    "/inquiries/:id/reply",
    async ({ user, params, body, status }) => {
      const inq = await prisma.bookingInquiry.findUnique({ where: { id: params.id } });
      if (!inq) return status(404, { message: "Not found" });
      await requireCampAccess(user, inq.campsiteId);
      const updated = await prisma.bookingInquiry.update({
        where: { id: params.id },
        data: { ownerReply: body.reply, ownerNote: body.note, status: "owner_replied", repliedBy: user!.id, repliedAt: new Date() },
      });
      await notify(inq.userId, "inquiry_replied", "เจ้าของแคมป์ตอบคำขอของคุณแล้ว", undefined, "inquiry", inq.id);
      return updated;
    },
    { body: t.Object({ reply: t.String({ minLength: 1, maxLength: 2000 }), note: t.Optional(t.String({ maxLength: 1000 })) }) },
  )
  .patch(
    "/inquiries/:id/status",
    async ({ user, params, body, status }) => {
      const inq = await prisma.bookingInquiry.findUnique({ where: { id: params.id } });
      if (!inq) return status(404, { message: "Not found" });
      await requireCampAccess(user, inq.campsiteId);
      return prisma.bookingInquiry.update({ where: { id: params.id }, data: { status: body.status as any } });
    },
    { body: t.Object({ status: t.String() }) },
  );

async function notifyAffectedPlans(campsiteId: string, start: Date, end: Date) {
  const plans = await prisma.userCampingPlan.findMany({
    where: { campsiteId, startDate: { lte: end }, endDate: { gte: start }, status: { notIn: ["cancelled", "visited"] } },
    select: { userId: true },
  });
  await Promise.all(
    plans.map((p) => notify(p.userId, "camp_calendar_changed", "แคมป์ที่คุณวางแผนไว้มีประกาศใหม่", undefined, "campsite", campsiteId)),
  );
}

// ---------- admin ----------
export const adminPhase2Routes = new Elysia({ prefix: "/api/admin" })
  .use(authPlugin)
  .onBeforeHandle(({ user }) => {
    requireRole(user, "admin");
  })
  .get("/camp-profiles", async ({ query }) =>
    prisma.campProfile.findMany({ where: query.status ? { profileStatus: query.status as any } : {}, take: 100 }),
  )
  .patch("/camp-profiles/:campId", async ({ params, body }) =>
    prisma.campProfile.update({ where: { campsiteId: params.campId }, data: body as any }),
  )
  .get("/calendar-events", async () => prisma.campCalendarEvent.findMany({ orderBy: { createdAt: "desc" }, take: 100 }))
  .patch("/calendar-events/:eventId/hide", async ({ params }) =>
    prisma.campCalendarEvent.update({ where: { id: params.eventId }, data: { isHidden: true } }),
  )
  .get("/inquiries", async () => prisma.bookingInquiry.findMany({ orderBy: { createdAt: "desc" }, take: 100 }))
  .get("/activity-logs", async ({ query }) =>
    prisma.campProfileActivityLog.findMany({
      where: query.campId ? { campsiteId: query.campId } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  );

export { completenessScore };
