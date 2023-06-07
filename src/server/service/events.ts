import { DayStage, EventType, type PrismaClient } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";

export const emitKilledEvent = async (
  prisma: PrismaClient,
  gameId: number,
  day: number,
  userId: number
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  return prisma.events.create({
    data: {
      gameId,
      day,
      stage: DayStage.NIGHT,
      description: `${user.username} was killed`,
      targetId: user.id,
      type: EventType.KILLED,
    },
  });
};

export const emitHangedEvent = async (
  prisma: PrismaClient,
  gameId: number,
  day: number,
  userId: number
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  return prisma.events.create({
    data: {
      gameId,
      day,
      stage: DayStage.VOTING,
      description: `${user.username} was hanged`,
      targetId: user.id,
      type: EventType.HUNG,
    },
  });
};

export const emitNoHang = async (
  prisma: PrismaClient,
  gameId: number,
  day: number
) => {
  return prisma.events.create({
    data: {
      gameId,
      day,
      stage: DayStage.VOTING,
      type: EventType.ANNOUNCEMENT,
      description: `No one was hanged`,
    },
  });
};

export const emitInvestigatedEvent = async (
  prisma: PrismaClient,
  gameId: number,
  day: number,
  userId: number
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    include: {
      role: true,
    },
  });

  if (!user.role?.team) {
    throw new TRPCClientError("User has no role");
  }

  return prisma.events.create({
    data: {
      gameId,
      day,
      stage: DayStage.NIGHT,
      description: `${user.username} was investigated, they are part of ${user.role?.team}`,
      targetId: user.id,
      type: EventType.INVESTIGATED,
    },
  });
};
