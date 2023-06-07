import { type PrismaClient, DayStage, ActionTypes } from "@prisma/client";
import { emitKilled } from "./events";
import { applyDeath } from "./user";

export const resolveKilled = async (
  prisma: PrismaClient,
  gameId: number,
  day: number
) => {
  const killAction = await prisma.actions.findUnique({
    where: {
      day_gameId_type: {
        gameId,
        day,
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
        gameId,
        day,
        type: ActionTypes.HEAL,
      },
    },
  });

  if (heal && heal.targetId === killAction.targetId) {
    // TODO: Issue drink to killer
    return;
  }

  await emitKilled(prisma, gameId, day, killAction.targetId);
  await applyDeath(prisma, killAction.targetId);
};

export const emitKill = async (
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

export const removeKill = async (
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

export const emitHeal = async (
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

export const removeHeal = async (
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
