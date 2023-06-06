import { GameState, type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const getActiveGame = async (prisma: PrismaClient, gameId: number) => {
  const game = await prisma.game.findFirstOrThrow({
    where: { id: gameId },
  });

  if (game.state !== GameState.RUNNING) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Game is not running",
    });
  }
  return game;
};
