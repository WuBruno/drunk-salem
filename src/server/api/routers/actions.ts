import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  emitDrunkardDrinkAction,
  emitHealAction,
  emitInvestigateAction,
  emitKillAction,
  removeDrunkardDrinkAction,
  removeHealAction,
  removeInvestigateAction,
  removeKillAction,
} from "@/server/service/actions";
import { getActiveGame } from "@/server/service/game";
import { ActionTypes, EventType } from "@prisma/client";
import { z } from "zod";

export const actionsRouter = createTRPCRouter({
  all: publicProcedure
    .input(z.object({ gameId: z.number() }))
    .query(async ({ ctx, input }) =>
      ctx.prisma.actions.findMany({
        where: {
          gameId: input.gameId,
        },
        include: {
          target: true,
          user: true,
        },
      })
    ),
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
      return emitKillAction(
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
      await removeKillAction(ctx.prisma, input.gameId, game.day);
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
      await emitHealAction(
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
      await removeHealAction(ctx.prisma, input.gameId, game.day);
    }),
  investigate: publicProcedure
    .input(
      z.object({
        gameId: z.number(),
        userId: z.number(),
        targetId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);
      await emitInvestigateAction(
        ctx.prisma,
        input.gameId,
        game.day,
        input.userId,
        input.targetId
      );
    }),
  getInvestigate: publicProcedure
    .input(z.object({ gameId: z.number() }))
    .query(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);

      return ctx.prisma.actions.findUnique({
        where: {
          day_gameId_type: {
            day: game.day,
            gameId: input.gameId,
            type: ActionTypes.INVESTIGATE,
          },
        },
      });
    }),
  getInvestigationResults: publicProcedure
    .input(z.object({ gameId: z.number() }))
    .query(async ({ ctx, input }) =>
      ctx.prisma.events.findMany({
        where: {
          gameId: input.gameId,
          type: EventType.INVESTIGATED,
        },
      })
    ),
  removeInvestigate: publicProcedure
    .input(
      z.object({
        gameId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);
      await removeInvestigateAction(ctx.prisma, input.gameId, game.day);
    }),
  drunkardDrink: publicProcedure
    .input(
      z.object({
        gameId: z.number(),
        userId: z.number(),
        targetId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);
      await emitDrunkardDrinkAction(
        ctx.prisma,
        input.gameId,
        game.day,
        input.userId,
        input.targetId
      );
    }),
  getDrunkardDrink: publicProcedure
    .input(z.object({ gameId: z.number() }))
    .query(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);

      return ctx.prisma.actions.findUnique({
        where: {
          day_gameId_type: {
            day: game.day,
            gameId: input.gameId,
            type: ActionTypes.DRUNKARD_DRINK,
          },
        },
      });
    }),
  removeDrunkardDrink: publicProcedure
    .input(
      z.object({
        gameId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);
      await removeDrunkardDrinkAction(ctx.prisma, input.gameId, game.day);
    }),
});
