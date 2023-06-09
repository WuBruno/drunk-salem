import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getUsersAlive } from "@/server/service/user";
import { Team } from "@prisma/client";

export const userRouter = createTRPCRouter({
  signup: publicProcedure
    .input(z.object({ username: z.string(), gameId: z.number() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.user.create({
        data: { username: input.username, gameId: input.gameId },
      });
    }),
  user: publicProcedure.input(z.number()).query(({ input, ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: input },
      include: {
        role: true,
      },
    });
  }),
  allUsers: publicProcedure.input(z.number()).query(({ input, ctx }) => {
    return ctx.prisma.user.findMany({
      where: { gameId: input },
      orderBy: { alive: "desc" },
    });
  }),
  alive: publicProcedure
    .input(z.number())
    .query(({ input, ctx }) => getUsersAlive(ctx.prisma, input)),
  roles: publicProcedure.input(z.number()).query(async ({ input, ctx }) => {
    return ctx.prisma.user.groupBy({
      where: {
        gameId: input,
      },
      by: ["roleId"],
      _count: {
        id: true,
      },
    });
  }),
  teams: publicProcedure.input(z.number()).query(async ({ input, ctx }) => {
    const town = await ctx.prisma.user.count({
      where: {
        gameId: input,
        role: {
          team: Team.TOWN,
        },
      },
    });
    const mafia = await ctx.prisma.user.count({
      where: {
        gameId: input,
        role: {
          team: Team.MAFIA,
        },
      },
    });

    return { town, mafia };
  }),
});
