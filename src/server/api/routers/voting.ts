import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getActiveGame } from "@/server/service";
import { DAY_STAGES } from "@/constants";

export const votingRouter = createTRPCRouter({
  getVoteHistory: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input);

      return await ctx.prisma.game
        .findUnique({
          where: {
            id: game.id,
          },
        })
        .votes({
          where: {
            day: {
              lt: game.day,
            },
          },
        });
    }),
  getMyVote: publicProcedure
    .input(z.object({ gameId: z.number(), userId: z.number() }))
    .query(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);
      return ctx.prisma.votes.findUnique({
        where: {
          userId_day_gameId: {
            userId: input.userId,
            day: game.day,
            gameId: game.id,
          },
        },
      });
    }),
  vote: publicProcedure
    .input(
      z.object({
        gameId: z.number(),
        userId: z.number(),
        targetUserId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);
      if (game.stage === DAY_STAGES.NIGHT) {
        throw new Error("Game is in night stage");
      }

      await ctx.prisma.votes.upsert({
        where: {
          userId_day_gameId: {
            userId: input.userId,
            day: game.day,
            gameId: game.id,
          },
        },
        update: {
          targetId: input.targetUserId,
        },
        create: {
          userId: input.userId,
          targetId: input.targetUserId,
          day: game.day,
          gameId: game.id,
        },
      });
    }),
  clearVote: publicProcedure
    .input(
      z.object({
        gameId: z.number(),
        userId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game = await getActiveGame(ctx.prisma, input.gameId);
      if (game.stage === DAY_STAGES.NIGHT) {
        throw new Error("Game is in night stage");
      }

      await ctx.prisma.votes.delete({
        where: {
          userId_day_gameId: {
            userId: input.userId,
            day: game.day,
            gameId: game.id,
          },
        },
      });
    }),
});
