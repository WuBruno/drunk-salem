import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const drinksRouter = createTRPCRouter({
  getDrinks: publicProcedure
    .input(z.object({ gameId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.drinks.findMany({
        where: {
          gameId: input.gameId,
        },
        include: {
          target: true,
        },
      });
    }),
});
