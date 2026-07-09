import { Elysia, t } from "elysia";
import { prisma } from "@ckt/db";
import { authPlugin, requireRole } from "../lib/auth";
import { recomputeRating } from "./member";
import { searchPlace, fetchPlaceDetails } from "../lib/google-places";

export const adminRoutes = new Elysia({ prefix: "/api/admin" })
  .use(authPlugin)
  // every admin route requires admin role
  .onBeforeHandle(({ user }) => {
    requireRole(user, "admin");
  })
  .get("/dashboard", async () => {
    const [campsites, pendingReviews, openClaims, users] = await Promise.all([
      prisma.campsite.count(),
      prisma.review.count({ where: { status: "pending" } }),
      prisma.ownerClaim.count({ where: { status: "pending" } }),
      prisma.user.count(),
    ]);
    return { campsites, pendingReviews, openClaims, users };
  })
  // ---- campsites ----
  .get("/campsites", async ({ query }) => {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = 20;
    const where = query.q
      ? { name: { contains: String(query.q), mode: "insensitive" as const } }
      : {};
    const [total, rows] = await Promise.all([
      prisma.campsite.count({ where }),
      prisma.campsite.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { total, page, campsites: rows };
  })
  .post(
    "/campsites",
    async ({ body, user, status }) => {
      // publish validation: must have lat/lng
      if (body.status === "published" && (body.latitude == null || body.longitude == null)) {
        return status(422, { message: "ลานที่ publish ต้องมี latitude และ longitude" });
      }
      const c = await prisma.campsite.create({
        data: { ...(body as any), createdBy: user!.id },
      });
      return status(201, c);
    },
    {
      body: t.Object({
        name: t.String(),
        slug: t.String(),
        province: t.String(),
        district: t.Optional(t.String()),
        description: t.Optional(t.String()),
        latitude: t.Optional(t.Number()),
        longitude: t.Optional(t.Number()),
        priceMin: t.Optional(t.Integer()),
        priceMax: t.Optional(t.Integer()),
        region: t.Optional(t.String()),
        googlePlaceId: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
    },
  )
  .patch("/campsites/:id", async ({ params, body, status }) => {
    const next = body as any;
    if (next.status === "published") {
      const cur = await prisma.campsite.findUnique({ where: { id: params.id } });
      const lat = next.latitude ?? cur?.latitude;
      const lng = next.longitude ?? cur?.longitude;
      if (lat == null || lng == null)
        return status(422, { message: "ลานที่ publish ต้องมี latitude และ longitude" });
    }
    return prisma.campsite.update({ where: { id: params.id }, data: next });
  })
  .delete("/campsites/:id", async ({ params }) => {
    await prisma.campsite.delete({ where: { id: params.id } });
    return { ok: true };
  })
  .patch(
    "/campsites/:id/location",
    async ({ params, body }) => {
      return prisma.campsite.update({
        where: { id: params.id },
        data: {
          latitude: body.latitude,
          longitude: body.longitude,
          locationAccuracyStatus: "admin_verified",
        },
      });
    },
    { body: t.Object({ latitude: t.Number(), longitude: t.Number() }) },
  )
  // ---- google places ----
  .post(
    "/google/search-place",
    async ({ body }) => searchPlace(body.query),
    { body: t.Object({ query: t.String() }) },
  )
  .post("/google/sync-place/:campsiteId", async ({ params, status }) => {
    const c = await prisma.campsite.findUnique({ where: { id: params.campsiteId } });
    if (!c?.googlePlaceId) return status(422, { message: "ยังไม่ได้ผูก google_place_id" });
    try {
      const details = await fetchPlaceDetails(c.googlePlaceId);
      const updated = await prisma.campsite.update({
        where: { id: c.id },
        data: {
          googleRating: details.rating ?? c.googleRating,
          googleUserRatingCount: details.userRatingCount ?? c.googleUserRatingCount,
          phone: details.nationalPhoneNumber ?? c.phone,
          websiteUrl: details.websiteUri ?? c.websiteUrl,
        },
      });
      // cache google review snapshots
      for (const r of details.reviews ?? []) {
        await prisma.googleReviewSnapshot.upsert({
          where: { campsiteId_googleReviewId: { campsiteId: c.id, googleReviewId: r.id } },
          update: { rating: r.rating, text: r.text, fetchedAt: new Date() },
          create: {
            campsiteId: c.id,
            googleReviewId: r.id,
            authorName: r.authorName,
            authorPhotoUrl: r.authorPhotoUrl,
            rating: r.rating,
            text: r.text,
            relativeTimeDescription: r.relativeTime,
            publishTime: r.publishTime ? new Date(r.publishTime) : null,
          },
        });
      }
      await prisma.googleSyncLog.create({
        data: { campsiteId: c.id, status: "success", message: "synced" },
      });
      return updated;
    } catch (e: any) {
      await prisma.googleSyncLog.create({
        data: { campsiteId: c.id, status: "failed", message: String(e?.message ?? e) },
      });
      return status(502, { message: "Google sync failed" });
    }
  })
  // ---- review moderation ----
  .get("/reviews", async ({ query }) => {
    const s = (query.status as any) ?? "pending";
    return prisma.review.findMany({
      where: { status: s },
      include: { user: { select: { name: true } }, campsite: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  })
  .patch("/reviews/:id/approve", async ({ params }) => {
    const r = await prisma.review.update({
      where: { id: params.id },
      data: { status: "approved" },
    });
    await recomputeRating(r.campsiteId);
    return r;
  })
  .patch("/reviews/:id/reject", async ({ params }) => {
    const r = await prisma.review.update({
      where: { id: params.id },
      data: { status: "rejected" },
    });
    await recomputeRating(r.campsiteId);
    return r;
  })
  // ---- owner claims ----
  .get("/owner-claims", async () =>
    prisma.ownerClaim.findMany({
      where: { status: "pending" },
      include: {
        user: { select: { name: true, email: true } },
        campsite: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  )
  .patch("/owner-claims/:id/approve", async ({ params, user }) => {
    const claim = await prisma.ownerClaim.update({
      where: { id: params.id },
      data: { status: "approved", reviewedBy: user!.id, reviewedAt: new Date() },
    });
    // grant ownership + promote role
    await prisma.campsite.update({
      where: { id: claim.campsiteId },
      data: { ownerUserId: claim.userId },
    });
    await prisma.user.update({ where: { id: claim.userId }, data: { role: "owner" } });
    await prisma.notification.create({
      data: { userId: claim.userId, type: "claim_status", title: "คำขอเป็นเจ้าของลานได้รับการอนุมัติแล้ว", targetType: "campsite", targetId: claim.campsiteId },
    });
    return claim;
  })
  .patch("/owner-claims/:id/reject", async ({ params, user }) => {
    const claim = await prisma.ownerClaim.update({
      where: { id: params.id },
      data: { status: "rejected", reviewedBy: user!.id, reviewedAt: new Date() },
    });
    await prisma.notification.create({
      data: { userId: claim.userId, type: "claim_status", title: "คำขอเป็นเจ้าของลานถูกปฏิเสธ", targetType: "campsite", targetId: claim.campsiteId },
    });
    return claim;
  })
  // ---- users ----
  .get("/users", async () =>
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  )
  .patch(
    "/users/:id/role",
    async ({ params, body }) =>
      prisma.user.update({ where: { id: params.id }, data: { role: body.role as any } }),
    { body: t.Object({ role: t.String() }) },
  );
