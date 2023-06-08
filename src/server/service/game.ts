import {
  type Game,
  GameState,
  type PrismaClient,
  GameOutcome,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { emitGameOutcome } from "./events";

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

export const resolveGameEnd = async (prisma: PrismaClient, game: Game) => {
  const mafiaAlive = await prisma.user.count({
    where: {
      gameId: game.id,
      alive: true,
      role: {
        team: "MAFIA",
      },
    },
  });
  const totalAlive = await prisma.user.count({
    where: {
      gameId: game.id,
      alive: true,
    },
  });
  const nonMafiaAlive = totalAlive - mafiaAlive;

  if (!mafiaAlive) {
    game = await prisma.game.update({
      data: {
        state: GameState.FINISHED,
        outcome: GameOutcome.TOWN,
      },
      where: { id: game.id },
    });
    return emitGameOutcome(prisma, game);
  }

  if (mafiaAlive >= nonMafiaAlive) {
    game = await prisma.game.update({
      data: {
        state: GameState.FINISHED,
        outcome: GameOutcome.MAFIA,
      },
      where: { id: game.id },
    });
    return emitGameOutcome(prisma, game);
  }
};
