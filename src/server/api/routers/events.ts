import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const eventsRouter = createTRPCRouter({
  all: publicProcedure.input(z.number()).query(({ ctx, input }) => {
    return ctx.prisma.events.findMany({
      where: {
        gameId: input,
      },
      orderBy: {
        id: "desc",
      },
    });
  }),
});
