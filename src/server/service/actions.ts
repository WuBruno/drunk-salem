import {
  type PrismaClient,
  DayStage,
  ActionTypes,
  type Game,
} from "@prisma/client";
import {
  emitInvestigatedEvent,
  emitKilledEvent,
  emitSavedEvent,
} from "./events";
import { applyDeath } from "./user";

export const resolveKilled = async (prisma: PrismaClient, game: Game) => {
  const killAction = await prisma.actions.findUnique({
    where: {
      day_gameId_type: {
        gameId: game.id,
        day: game.day,
        type: ActionTypes.KILL,
      },
    },
  });

  if (!killAction) {
    return;
  }

  const heal = await prisma.actions.findUnique({
    where: {
      day_gameId_type: {
        gameId: game.id,
        day: game.day,
        type: ActionTypes.HEAL,
      },
    },
  });

  if (heal && heal.targetId === killAction.targetId) {
    // TODO: Issue drink to killer
    return emitSavedEvent(
      prisma,
      game.id,
      game.day,
      heal.userId,
      heal.id,
      killAction.id
    );
  }

  const investigateAction = await prisma.actions.findUnique({
    where: {
      day_gameId_type: {
        gameId: game.id,
        day: game.day,
        type: ActionTypes.INVESTIGATE,
      },
    },
  });

  // Also kill investigator if they investigated the killed
  if (investigateAction?.targetId === killAction.targetId) {
    await emitKilledEvent(
      prisma,
      game.id,
      game.day,
      investigateAction.userId,
      investigateAction.id
    );
    // TODO: Separate into resolve DEATH event
    await applyDeath(prisma, killAction.targetId);
  }

  await emitKilledEvent(
    prisma,
    game.id,
    game.day,
    killAction.targetId,
    killAction.id
  );
  await applyDeath(prisma, killAction.targetId);
};

export const resolveInvestigation = async (
  prisma: PrismaClient,
  game: Game
) => {
  const investigateAction = await prisma.actions.findUnique({
    where: {
      day_gameId_type: {
        gameId: game.id,
        day: game.day,
        type: ActionTypes.INVESTIGATE,
      },
    },
    include: {
      user: true,
    },
  });

  if (!investigateAction || !investigateAction.user.alive) {
    return; // No investigation or investigator is dead
  }

  return emitInvestigatedEvent(
    prisma,
    game.id,
    game.day,
    investigateAction.targetId,
    investigateAction.targetId
  );
};

export const emitKillAction = async (
  prisma: PrismaClient,
  gameId: number,
  day: number,
  userId: number,
  targetId: number
) =>
  prisma.actions.upsert({
    where: {
      day_gameId_type: {
        day,
        gameId,
        type: ActionTypes.KILL,
      },
    },
    create: {
      userId,
      day,
      gameId,
      type: ActionTypes.KILL,
      stage: DayStage.NIGHT,
      targetId,
    },
    update: {
      targetId,
    },
  });

export const removeKillAction = async (
  prisma: PrismaClient,
  gameId: number,
  day: number
) =>
  prisma.actions.delete({
    where: {
      day_gameId_type: {
        day,
        gameId,
        type: ActionTypes.KILL,
      },
    },
  });

export const emitHealAction = async (
  prisma: PrismaClient,
  gameId: number,
  day: number,
  userId: number,
  targetId: number
) =>
  prisma.actions.upsert({
    where: {
      day_gameId_type: {
        day,
        gameId,
        type: ActionTypes.HEAL,
      },
    },
    create: {
      userId,
      day,
      gameId,
      type: ActionTypes.HEAL,
      stage: DayStage.NIGHT,
      targetId,
    },
    update: {
      targetId,
    },
  });

export const removeHealAction = async (
  prisma: PrismaClient,
  gameId: number,
  day: number
) =>
  prisma.actions.delete({
    where: {
      day_gameId_type: {
        day,
        gameId,
        type: ActionTypes.HEAL,
      },
    },
  });

export const emitInvestigateAction = async (
  prisma: PrismaClient,
  gameId: number,
  day: number,
  userId: number,
  targetId: number
) =>
  prisma.actions.upsert({
    where: {
      day_gameId_type: {
        day,
        gameId,
        type: ActionTypes.INVESTIGATE,
      },
    },
    create: {
      userId,
      day,
      gameId,
      type: ActionTypes.INVESTIGATE,
      stage: DayStage.NIGHT,
      targetId,
    },
    update: {
      targetId,
    },
  });

export const removeInvestigateAction = async (
  prisma: PrismaClient,
  gameId: number,
  day: number
) =>
  prisma.actions.delete({
    where: {
      day_gameId_type: {
        day,
        gameId,
        type: ActionTypes.INVESTIGATE,
      },
    },
  });
