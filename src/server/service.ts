import { GAME_STATES } from "@/constants";
import { type PrismaClient } from "@prisma/client";

export const getActiveGame = async (prisma: PrismaClient, gameId: number) => {
  const game = await prisma.game.findFirstOrThrow({
    where: { id: gameId },
  });

  if (game.state !== GAME_STATES.RUNNING) {
    throw new Error("Game is not running");
  }
  return game;
};
