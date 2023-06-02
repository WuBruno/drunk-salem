import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  signup: publicProcedure
    .input(z.object({ username: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.user.create({
        data: { username: input.username },
      });
    }),
  allUsers: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
});
