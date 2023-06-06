import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getActiveGame } from "@/server/service/game";
import { TRPCError } from "@trpc/server";
import { DayStage } from "@prisma/client";

export const votingRouter = createTRPCRouter({
  getVotesByDay: publicProcedure
    .input(z.object({ gameId: z.number(), day: z.number() }))
    .query(({ ctx, input }) =>
      ctx.prisma.user.findMany({
        where: {
          gameId: input.gameId,
        },
        include: {
          votes: {
            where: {
              day: input.day,
              gameId: input.gameId,
            },
            include: {
              target: true,
            },
          },
        },
      })
    ),
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
      if (game.stage === DayStage.NIGHT) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Game is in night stage",
        });
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
      if (game.stage === DayStage.NIGHT) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Game is in night stage",
        });
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
