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
