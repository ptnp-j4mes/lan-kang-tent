import { Elysia, t } from "elysia";
import { prisma } from "@ckt/db";
import { authPlugin, requireUser } from "../lib/auth";

// recompute campsite aggregate member rating from approved reviews
async function recomputeRating(campsiteId: string) {
  const agg = await prisma.review.aggregate({
    where: { campsiteId, status: "approved" },
    _avg: { ratingOverall: true },
    _count: { _all: true },
  });
  await prisma.campsite.update({
    where: { id: campsiteId },
    data: {
      memberRating: agg._avg.ratingOverall ?? null,
      memberReviewCount: agg._count._all,
    },
  });
}

export const memberRoutes = new Elysia()
  .use(authPlugin)
  // ---- reviews ----
  .post(
    "/api/reviews",
    async ({ user, body, status }) => {
      requireUser(user);
      const review = await prisma.review.create({
        data: {
          campsiteId: body.campsiteId,
          userId: user!.id,
          ratingOverall: body.ratingOverall,
          ratingCleanliness: body.ratingCleanliness,
          ratingFacility: body.ratingFacility,
          ratingView: body.ratingView,
          ratingAccessibility: body.ratingAccessibility,
          ratingSafety: body.ratingSafety,
          ratingValue: body.ratingValue,
          tripType: body.tripType as any,
          visitDate: body.visitDate ? new Date(body.visitDate) : undefined,
          comment: body.comment,
          status: "pending", // moderation queue
        },
      });
      return status(201, review);
    },
    {
      body: t.Object({
        campsiteId: t.String(),
        ratingOverall: t.Integer({ minimum: 1, maximum: 5 }),
        ratingCleanliness: t.Optional(t.Integer({ minimum: 1, maximum: 5 })),
        ratingFacility: t.Optional(t.Integer({ minimum: 1, maximum: 5 })),
        ratingView: t.Optional(t.Integer({ minimum: 1, maximum: 5 })),
        ratingAccessibility: t.Optional(t.Integer({ minimum: 1, maximum: 5 })),
        ratingSafety: t.Optional(t.Integer({ minimum: 1, maximum: 5 })),
        ratingValue: t.Optional(t.Integer({ minimum: 1, maximum: 5 })),
        tripType: t.Optional(t.String()),
        visitDate: t.Optional(t.String()),
        comment: t.Optional(t.String({ maxLength: 4000 })),
      }),
    },
  )
  .patch("/api/reviews/:id", async ({ user, params, body, status }) => {
    requireUser(user);
    const r = await prisma.review.findUnique({ where: { id: params.id } });
    if (!r || r.userId !== user!.id) return status(403, { message: "Forbidden" });
    const updated = await prisma.review.update({
      where: { id: params.id },
      data: { ...(body as any), status: "pending" },
    });
    return updated;
  })
  .delete("/api/reviews/:id", async ({ user, params, status }) => {
    requireUser(user);
    const r = await prisma.review.findUnique({ where: { id: params.id } });
    if (!r || r.userId !== user!.id) return status(403, { message: "Forbidden" });
    await prisma.review.delete({ where: { id: params.id } });
    await recomputeRating(r.campsiteId);
    return { ok: true };
  })
  // ---- favorites ----
  .post("/api/campsites/:id/favorite", async ({ user, params, status }) => {
    requireUser(user);
    await prisma.favoriteCampsite.upsert({
      where: { userId_campsiteId: { userId: user!.id, campsiteId: params.id } },
      update: {},
      create: { userId: user!.id, campsiteId: params.id },
    });
    return status(201, { ok: true });
  })
  .delete("/api/campsites/:id/favorite", async ({ user, params }) => {
    requireUser(user);
    await prisma.favoriteCampsite.deleteMany({
      where: { userId: user!.id, campsiteId: params.id },
    });
    return { ok: true };
  })
  // ---- report ----
  .post(
    "/api/campsites/:id/report",
    async ({ user, params, body, status }) => {
      requireUser(user);
      await prisma.report.create({
        data: {
          reporterUserId: user!.id,
          targetType: "campsite",
          targetId: params.id,
          reason: body.reason,
        },
      });
      return status(201, { ok: true });
    },
    { body: t.Object({ reason: t.String({ minLength: 3, maxLength: 1000 }) }) },
  )
  // ---- owner claim ----
  .post(
    "/api/owner-claims",
    async ({ user, body, status }) => {
      requireUser(user);
      const claim = await prisma.ownerClaim.create({
        data: {
          campsiteId: body.campsiteId,
          userId: user!.id,
          evidenceText: body.evidenceText,
          evidenceFileUrl: body.evidenceFileUrl,
        },
      });
      return status(201, claim);
    },
    {
      body: t.Object({
        campsiteId: t.String(),
        evidenceText: t.Optional(t.String({ maxLength: 2000 })),
        evidenceFileUrl: t.Optional(t.String()),
      }),
    },
  );

export { recomputeRating };
