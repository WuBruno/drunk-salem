import { type PrismaClient, DayStage, ActionTypes } from "@prisma/client";
import { emitInvestigatedEvent, emitKilledEvent } from "./events";
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

  const investigateAction = await prisma.actions.findUnique({
    where: {
      day_gameId_type: {
        gameId,
        day,
        type: ActionTypes.INVESTIGATE,
      },
    },
  });

  // Also kill investigator if they investigated the killed
  if (investigateAction?.targetId === killAction.targetId) {
    await emitKilledEvent(prisma, gameId, day, investigateAction.userId);
    await applyDeath(prisma, killAction.targetId);
  }

  await emitKilledEvent(prisma, gameId, day, killAction.targetId);
  await applyDeath(prisma, killAction.targetId);
};

export const resolveInvestigation = async (
  prisma: PrismaClient,
  gameId: number,
  day: number
) => {
  const investigateAction = await prisma.actions.findUnique({
    where: {
      day_gameId_type: {
        gameId,
        day,
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

  await emitInvestigatedEvent(prisma, gameId, day, investigateAction.targetId);
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
