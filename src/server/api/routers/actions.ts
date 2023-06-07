import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  emitHeal,
  emitKill,
  removeHeal,
  removeKill,
} from "@/server/service/actions";
import { getActiveGame } from "@/server/service/game";
import { ActionTypes } from "@prisma/client";
import { z } from "zod";

export const actionsRouter = createTRPCRouter({
  getKill: publicProcedure
    .input(z.object({ gameId: z.number() }))
    .query(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);

      return ctx.prisma.actions.findUnique({
        where: {
          day_gameId_type: {
            day: game.day,
            gameId: input.gameId,
            type: ActionTypes.KILL,
          },
        },
      });
    }),
  kill: publicProcedure
    .input(
      z.object({
        gameId: z.number(),
        userId: z.number(),
        targetId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);
      return emitKill(
        ctx.prisma,
        input.gameId,
        game.day,
        input.userId,
        input.targetId
      );
    }),
  removeKill: publicProcedure
    .input(
      z.object({
        gameId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);
      await removeKill(ctx.prisma, input.gameId, game.day);
    }),
  heal: publicProcedure
    .input(
      z.object({
        gameId: z.number(),
        userId: z.number(),
        targetId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);
      await emitHeal(
        ctx.prisma,
        input.gameId,
        game.day,
        input.userId,
        input.targetId
      );
    }),
  getHeal: publicProcedure
    .input(z.object({ gameId: z.number() }))
    .query(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);

      return ctx.prisma.actions.findUnique({
        where: {
          day_gameId_type: {
            day: game.day,
            gameId: input.gameId,
            type: ActionTypes.HEAL,
          },
        },
      });
    }),
  removeHeal: publicProcedure
    .input(
      z.object({
        gameId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);
      await removeHeal(ctx.prisma, input.gameId, game.day);
    }),
});
