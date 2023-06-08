import { DayStage, EventType, type PrismaClient } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";

export const emitKilledEvent = async (
  prisma: PrismaClient,
  gameId: number,
  day: number,
  userId: number,
  actionId: number
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const event = await prisma.events.create({
    data: {
      gameId,
      day,
      stage: DayStage.NIGHT,
      description: `${user.username} was killed`,
      targetId: user.id,
      type: EventType.KILLED,
    },
  });

  return connectActionToEvent(prisma, event.id, [actionId]);
};

export const emitHungEvent = async (
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
  userId: number,
  actionId: number
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

  const event = await prisma.events.create({
    data: {
      gameId,
      day,
      stage: DayStage.NIGHT,
      description: `${user.username} was investigated, they are part of ${user.role?.team}`,
      targetId: user.id,
      type: EventType.INVESTIGATED,
    },
  });

  return connectActionToEvent(prisma, event.id, [actionId]);
};

const connectActionToEvent = async (
  prisma: PrismaClient,
  eventId: number,
  actionId: number[]
) => {
  return Promise.all(
    actionId.map((id) => {
      return prisma.actions.update({
        where: {
          id,
        },
        data: {
          eventId,
        },
      });
    })
  );
};

export const emitSavedEvent = async (
  prisma: PrismaClient,
  gameId: number,
  day: number,
  userId: number,
  healActionId: number,
  killActionId: number
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

  const event = await prisma.events.create({
    data: {
      gameId,
      day,
      stage: DayStage.NIGHT,
      description: `${user.username} was saved last night`,
      targetId: user.id,
      type: EventType.SAVED,
    },
  });

  return connectActionToEvent(prisma, event.id, [healActionId, killActionId]);
};
