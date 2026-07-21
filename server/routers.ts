import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  createContactMessage,
  createGalleryPhoto,
  createReview,
  deleteContactMessage,
  deleteGalleryPhoto,
  deleteReview,
  getAllContactMessages,
  getAllReviews,
  getApprovedReviews,
  getGalleryPhotos,
  markContactMessageRead,
  updateGalleryPhoto,
  updateReviewStatus,
} from "./db";
import { storagePut } from "./storage";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ===== Gallery =====
  gallery: router({
    list: publicProcedure.query(async () => {
      return await getGalleryPhotos();
    }),

    upload: adminProcedure
      .input(z.object({
        fileName: z.string().min(1),
        fileBase64: z.string().min(1),
        contentType: z.string().default("image/jpeg"),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileBase64, "base64");
        const { key, url } = await storagePut(`gallery/${input.fileName}`, buffer, input.contentType);
        const photo = await createGalleryPhoto({
          imageUrl: url,
          storageKey: key,
          title: input.title || null,
          description: input.description || null,
          category: input.category || null,
        });
        return photo;
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateGalleryPhoto(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteGalleryPhoto(input.id);
        return { success: true };
      }),
  }),

  // ===== Reviews =====
  reviews: router({
    listApproved: publicProcedure.query(async () => {
      return await getApprovedReviews();
    }),

    listAll: adminProcedure.query(async () => {
      return await getAllReviews();
    }),

    create: publicProcedure
      .input(z.object({
        authorName: z.string().min(1).max(255),
        rating: z.number().int().min(1).max(5),
        comment: z.string().min(1).max(2000),
        lang: z.string().max(10).default("es"),
      }))
      .mutation(async ({ input }) => {
        const review = await createReview(input);
        // Notify the instructor about the new review
        try {
          await notifyOwner({
            title: "Nueva reseña recibida",
            content: `${input.authorName} dejó una reseña de ${input.rating} estrellas:\n\n${input.comment}`,
          });
        } catch (e) {
          console.warn("[Reviews] Failed to notify owner:", e);
        }
        return review;
      }),

    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateReviewStatus(input.id, "approved");
        return { success: true };
      }),

    reject: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateReviewStatus(input.id, "rejected");
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteReview(input.id);
        return { success: true };
      }),
  }),

  // ===== Contact =====
  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        email: z.string().email().max(320),
        message: z.string().min(1).max(5000),
        lang: z.string().max(10).default("es"),
      }))
      .mutation(async ({ input }) => {
        const msg = await createContactMessage(input);
        // Notify the instructor about the new contact message
        try {
          await notifyOwner({
            title: "Nuevo mensaje de contacto",
            content: `Nombre: ${input.name}\nEmail: ${input.email}\n\n${input.message}`,
          });
        } catch (e) {
          console.warn("[Contact] Failed to notify owner:", e);
        }
        return { success: true };
      }),

    listAll: adminProcedure.query(async () => {
      return await getAllContactMessages();
    }),

    markRead: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markContactMessageRead(input.id);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteContactMessage(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
