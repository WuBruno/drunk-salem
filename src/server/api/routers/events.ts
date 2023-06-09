import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { EventType } from "@prisma/client";

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
  public: publicProcedure.input(z.number()).query(({ ctx, input }) => {
    return ctx.prisma.events.findMany({
      where: {
        gameId: input,
        type: {
          not: EventType.INVESTIGATED,
        },
      },
      orderBy: {
        id: "desc",
      },
    });
  }),
});
