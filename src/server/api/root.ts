import { createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/user";
import { gameRouter } from "./routers/game";
import { votingRouter } from "./routers/voting";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  game: gameRouter,
  vote: votingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
