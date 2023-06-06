import { DAY_STAGES, GAME_STATES } from "@/constants";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getActiveGame } from "@/server/service/game";
import { processVotes } from "@/server/service/vote";
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
    .mutation(({ input, ctx }) => {
      return ctx.prisma.game.update({
        data: { state: GAME_STATES.RUNNING },
        where: { id: input.gameId },
      });
    }),
  processNextStage: publicProcedure
    .input(z.object({ gameId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);
      // TODO: Verify if game reached terminal state

      switch (game.stage) {
        case DAY_STAGES.DAY:
          await ctx.prisma.game.update({
            data: {
              stage: DAY_STAGES.VOTING,
            },
            where: { id: input.gameId },
          });
          break;
        case DAY_STAGES.VOTING:
          await processVotes(ctx.prisma, input.gameId, game.day);
          await ctx.prisma.game.update({
            data: {
              stage: DAY_STAGES.NIGHT,
            },
            where: { id: input.gameId },
          });
          break;
        case DAY_STAGES.NIGHT:
          await ctx.prisma.game.update({
            data: {
              stage: DAY_STAGES.DAY,
              day: {
                increment: 1,
              },
            },
            where: { id: input.gameId },
          });
          break;

        default:
          break;
      }
    }),
});
