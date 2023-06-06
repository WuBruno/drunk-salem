import { DAY_STAGES } from "@/constants";
import { type PrismaClient } from "@prisma/client";

export const emitHanged = async (
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
      stage: DAY_STAGES.VOTING,
      description: `${user.username} was hanged`,
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
      stage: DAY_STAGES.VOTING,
      description: `No one was hanged`,
    },
  });
};
