import { type PrismaClient } from "@prisma/client";
import { emitHanged, emitNoHang } from "./events";

const hangPlayer = async (
  prisma: PrismaClient,
  gameId: number,
  day: number,
  userId: number
) => {
  await emitHanged(prisma, gameId, day, userId);
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      alive: false,
    },
  });
};

export const processVotes = async (
  prisma: PrismaClient,
  gameId: number,
  day: number
) => {
  const highestVotes = await prisma.votes.groupBy({
    where: {
      gameId,
      day,
    },
    by: ["targetId"],
    _count: {
      targetId: true,
    },
    orderBy: {
      _count: {
        targetId: "desc",
      },
    },
    take: 1,
  });
  const playersAlive = await prisma.user.count({
    where: {
      gameId,
      alive: true,
    },
  });

  const highestVote = highestVotes.at(0);
  if (!highestVote) {
    // No particular votes won
    return;
  }

  const highestVoteCount = highestVote._count.targetId;
  // Require majority to kill
  if (highestVoteCount && highestVoteCount > playersAlive / 2) {
    return hangPlayer(prisma, gameId, day, highestVote.targetId);
  } else {
    return emitNoHang(prisma, gameId, day);
  }
};
