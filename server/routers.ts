import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { deleteSnippet, getSnippetById, insertSnippet, listSnippets, updateSnippet } from "./db";

const snippetCreate = z.object({
  title: z.string().trim().min(1).max(180),
  language: z.string().trim().min(1).max(64),
  category: z.string().trim().min(1).max(100),
  tags: z.array(z.string().trim().min(1).max(32)).max(12),
  notes: z.string().max(10000).nullable().optional(),
  code: z.string().min(1).max(100000),
});

const snippetUpdate = snippetCreate.partial();

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
  snippets: router({
    list: protectedProcedure
      .input(z.object({ search: z.string().max(120).optional() }).optional())
      .query(({ ctx, input }) => listSnippets(ctx.user.id, input?.search)),
    get: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const snippet = await getSnippetById(ctx.user.id, input.id);
        if (!snippet) throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });
        return snippet;
      }),
    create: protectedProcedure.input(snippetCreate).mutation(({ ctx, input }) => {
      const now = Date.now();
      return insertSnippet({ ...input, userId: ctx.user.id, tags: input.tags.join(","), createdAt: now, updatedAt: now });
    }),
    update: protectedProcedure
      .input(z.object({ id: z.number().int().positive(), data: snippetUpdate }))
      .mutation(async ({ ctx, input }) => {
        const { tags, ...rest } = input.data;
        const updated = await updateSnippet(ctx.user.id, input.id, {
          ...rest,
          ...(tags ? { tags: tags.join(",") } : {}),
        });
        if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });
        return updated;
      }),
    toggleFavorite: protectedProcedure
      .input(z.object({ id: z.number().int().positive(), favorite: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const updated = await updateSnippet(ctx.user.id, input.id, { favorite: input.favorite });
        if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });
        return updated;
      }),
    remove: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ ctx, input }) => deleteSnippet(ctx.user.id, input.id)),
  }),
});

export type AppRouter = typeof appRouter;
