import { Role, type PrismaClient } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";

const MAFIA_ACTIVE_ROLES = {
  [Role.MAFIA_KILLING]: 1,
};
const mafiaActiveTotal = Object.values(MAFIA_ACTIVE_ROLES).reduce(
  (acc, curr) => acc + curr,
  0
);
const MAFIA_RATIO = 1 / 4;
const TOWN_ACTIVE_ROLES = {
  [Role.DETECTIVE]: 1,
  [Role.DOCTOR]: 1,
};
const townActiveTotal = Object.values(TOWN_ACTIVE_ROLES).reduce(
  (acc, curr) => acc + curr,
  0
);
export const minimumTotalRoles = Math.max(
  mafiaActiveTotal + townActiveTotal,
  4
);

const getMafiaCount = (totalUsers: number) =>
  Math.floor(totalUsers * MAFIA_RATIO);

const getMafiaRoles = (totalUsers: number) => {
  const mafiaTeamTotal = Math.floor(totalUsers * MAFIA_RATIO);
  const mafiaInactiveTotal = mafiaTeamTotal - mafiaActiveTotal;

  return [
    ...Array<Role>(mafiaInactiveTotal).fill(Role.MAFIA),
    ...Object.entries(MAFIA_ACTIVE_ROLES).flatMap(([role, count]) =>
      Array<Role>(count).fill(role as Role)
    ),
  ];
};

const getTownRoles = (totalUsers: number) => {
  const townTeamTotal = totalUsers - getMafiaCount(totalUsers);
  const townInactiveTotal = townTeamTotal - townActiveTotal;

  return [
    ...Array<Role>(townInactiveTotal).fill(Role.TOWNSPERSON),
    ...Object.entries(TOWN_ACTIVE_ROLES).flatMap(([role, count]) =>
      Array<Role>(count).fill(role as Role)
    ),
  ];
};

function shuffle<T>(array: T[]): T[] {
  return [...array]
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

const zip = <T, S>(a: T[], b: S[]) => a.map((k, i) => [k, b[i]]) as [T, S][];

export const assignRoles = async (prisma: PrismaClient, gameId: number) => {
  const users = await prisma.game
    .findUnique({
      where: {
        id: gameId,
      },
    })
    .users({});

  if (!users) {
    throw new TRPCClientError("No users found for game");
  }

  const userCount = users.length;

  if (userCount < minimumTotalRoles) {
    throw new TRPCClientError(
      `Not enough users to start game, requires: ${minimumTotalRoles}`
    );
  }

  const shuffledGameRoles = shuffle([
    ...getTownRoles(userCount),
    ...getMafiaRoles(userCount),
  ]);

  const zipped = zip(users, shuffledGameRoles);

  return Promise.all(
    zipped.map(([user, role]) =>
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          roleId: role,
        },
      })
    )
  );
};
