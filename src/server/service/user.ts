import { type PrismaClient } from "@prisma/client";

export const applyDeath = async (prisma: PrismaClient, userId: number) =>
  prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      alive: false,
    },
  });

export const getUsersAlive = async (prisma: PrismaClient, gameId: number) =>
  prisma.user.findMany({
    where: {
      gameId,
      alive: true,
    },
  });
