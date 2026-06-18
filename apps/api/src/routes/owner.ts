import { Elysia, t } from "elysia";
import { prisma } from "@ckt/db";
import { authPlugin } from "../lib/auth";
import { requireRole, requireCampAccess } from "../lib/rbac";

export const ownerRoutes = new Elysia({ prefix: "/api/owner" })
  .use(authPlugin)
  .onBeforeHandle(({ user }) => {
    requireRole(user, "owner", "camp_staff", "admin");
  })
  .get("/campsites", async ({ user }) =>
    prisma.campsite.findMany({
      where: { ownerUserId: user!.id },
      include: { photos: { orderBy: { sortOrder: "asc" } } },
    }),
  )
  .patch(
    "/campsites/:id",
    async ({ user, params, body }) => {
      // owner/staff/admin only; safe fields only
      await requireCampAccess(user, params.id);
      return prisma.campsite.update({
        where: { id: params.id },
        data: {
          priceMin: body.priceMin,
          priceMax: body.priceMax,
          phone: body.phone,
          websiteUrl: body.websiteUrl,
          facebookUrl: body.facebookUrl,
          lineId: body.lineId,
          description: body.description,
        },
      });
    },
    {
      body: t.Object({
        priceMin: t.Optional(t.Integer()),
        priceMax: t.Optional(t.Integer()),
        phone: t.Optional(t.String()),
        websiteUrl: t.Optional(t.String()),
        facebookUrl: t.Optional(t.String()),
        lineId: t.Optional(t.String()),
        description: t.Optional(t.String()),
      }),
    },
  )
  .post(
    "/campsites/:id/photos",
    async ({ user, params, body }) => {
      await requireCampAccess(user, params.id);
      return prisma.campsitePhoto.create({
        data: { campsiteId: params.id, imageUrl: body.imageUrl, caption: body.caption, source: "owner" },
      });
    },
    { body: t.Object({ imageUrl: t.String(), caption: t.Optional(t.String()) }) },
  )
  .delete("/photos/:id", async ({ user, params, status }) => {
    const photo = await prisma.campsitePhoto.findUnique({
      where: { id: params.id },
      include: { campsite: true },
    });
    if (!photo) return status(404, { message: "Not found" });
    await requireCampAccess(user, photo.campsiteId);
    await prisma.campsitePhoto.delete({ where: { id: params.id } });
    return { ok: true };
  })
  .post(
    "/reviews/:id/reply",
    async ({ user, params, body, status }) => {
      const r = await prisma.review.findUnique({
        where: { id: params.id },
        include: { campsite: true },
      });
      if (!r) return status(404, { message: "Not found" });
      await requireCampAccess(user, r.campsiteId);
      return prisma.review.update({
        where: { id: params.id },
        data: { ownerReply: body.reply, ownerReplyAt: new Date() },
      });
    },
    { body: t.Object({ reply: t.String({ minLength: 1, maxLength: 2000 }) }) },
  );
