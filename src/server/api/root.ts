import { createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/user";
import { gameRouter } from "./routers/game";
import { votingRouter } from "./routers/voting";
import { eventsRouter } from "./routers/events";
import { actionsRouter } from "./routers/actions";
import { drinksRouter } from "./routers/drinks";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  game: gameRouter,
  vote: votingRouter,
  events: eventsRouter,
  actions: actionsRouter,
  drinks: drinksRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
