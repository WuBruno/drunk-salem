import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

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
    });
  }),
  allUsers: publicProcedure.input(z.number()).query(({ input, ctx }) => {
    return ctx.prisma.user.findMany({
      where: { gameId: input },
      orderBy: { alive: "desc" },
    });
  }),
  alive: publicProcedure.input(z.number()).query(({ input, ctx }) => {
    return ctx.prisma.user.findMany({
      where: { gameId: input, alive: true },
    });
  }),
});
