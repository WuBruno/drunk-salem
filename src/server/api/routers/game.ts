import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  resolveDrunkardDrink,
  resolveInvestigation,
  resolveKilled,
} from "@/server/service/actions";
import { randomAssignDrinks, resolveDrinks } from "@/server/service/drinks";
import { getActiveGame, resolveGameEnd } from "@/server/service/game";
import { assignRoles, shuffleMafiaKilling } from "@/server/service/roles";
import { processVotes } from "@/server/service/vote";
import { DayStage, GameState } from "@prisma/client";
import { z } from "zod";

const generateCode = () => Math.floor(100000 + Math.random() * 900000);

export const gameRouter = createTRPCRouter({
  create: publicProcedure.mutation(async ({ ctx }) => {
    while (true) {
      const code = generateCode();
      const count = await ctx.prisma.game.count({ where: { code } });
      if (count === 0) {
        return ctx.prisma.game.create({
          data: {
            code,
          },
        });
      }
    }
  }),
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.game.findMany();
  }),
  one: publicProcedure.input(z.number()).query(({ input, ctx }) => {
    return ctx.prisma.game.findUnique({ where: { id: input } });
  }),
  startGame: publicProcedure
    .input(z.object({ gameId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await assignRoles(ctx.prisma, input.gameId);
      return ctx.prisma.game.update({
        data: { state: GameState.RUNNING },
        where: { id: input.gameId },
      });
    }),
  processNextStage: publicProcedure
    .input(z.object({ gameId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);

      switch (game.stage) {
        case DayStage.DAY:
          await ctx.prisma.game.update({
            data: {
              stage: DayStage.VOTING,
            },
            where: { id: input.gameId },
          });
          break;
        case DayStage.VOTING:
          await processVotes(ctx.prisma, input.gameId, game.day);
          await resolveDrinks(ctx.prisma, game);
          await ctx.prisma.game.update({
            data: {
              stage: DayStage.NIGHT,
            },
            where: { id: input.gameId },
          });
          break;
        case DayStage.NIGHT:
          await resolveKilled(ctx.prisma, game);
          await resolveInvestigation(ctx.prisma, game);
          await resolveDrunkardDrink(ctx.prisma, game);

          await resolveDrinks(ctx.prisma, game);

          await randomAssignDrinks(ctx.prisma, game);
          await ctx.prisma.game.update({
            data: {
              stage: DayStage.DAY,
              day: {
                increment: 1,
              },
            },
            where: { id: input.gameId },
          });
          await shuffleMafiaKilling(ctx.prisma, input.gameId);
          break;

        default:
          break;
      }

      await resolveGameEnd(ctx.prisma, game);
    }),
});
