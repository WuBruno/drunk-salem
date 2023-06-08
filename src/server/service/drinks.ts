import {
  type Game,
  type PrismaClient,
  EventType,
  ActionTypes,
  Team,
} from "@prisma/client";
import { TRPCClientError } from "@trpc/client";

const DRINK_DISTRIBUTIONS = {
  INVESTIGATE: 1,
  KILLED: 3,
  HUNG: 3,
  FAILED_KILL: 2,
  KILL: 1,
  HEALED: 1,
  HEAL: 1,
};

const getEventsForDrinks = async (prisma: PrismaClient, game: Game) => {
  return prisma.events.findMany({
    where: {
      gameId: game.id,
      day: game.day,
      stage: game.stage,
    },
    include: {
      actions: {
        include: {
          target: {
            include: {
              role: true,
            },
          },
        },
      },
    },
  });
};
type ArrayElement<T> = T extends (infer U)[] ? U : T;
type EventsForDrinks = ArrayElement<
  Awaited<ReturnType<typeof getEventsForDrinks>>
>;

export const resolveDrinks = async (prisma: PrismaClient, game: Game) => {
  const events = await getEventsForDrinks(prisma, game);
  return Promise.all(events.map((event) => resolveDrink(prisma, game, event)));
};

export const resolveDrink = async (
  prisma: PrismaClient,
  game: Game,
  event: EventsForDrinks
) => {
  switch (event.type) {
    case EventType.KILLED:
      event.actions.map(async (action) => {
        if (action.type === ActionTypes.KILL) {
          await incrementDrink(
            prisma,
            game,
            event.id,
            action.userId,
            DRINK_DISTRIBUTIONS.KILL
          );
        }
      });
    case EventType.HUNG:
      if (!event.targetId) {
        throw new TRPCClientError("Killed event must have a target");
      }
      await incrementDrink(
        prisma,
        game,
        event.id,
        event.targetId,
        DRINK_DISTRIBUTIONS.HUNG
      );
      break;
    case EventType.INVESTIGATED:
      event.actions.map(async (action) => {
        if (action.type === ActionTypes.INVESTIGATE) {
          // Skip drink if mafia
          if (action.target.role.team === Team.MAFIA) {
            return;
          }

          await incrementDrink(
            prisma,
            game,
            event.id,
            action.userId,
            DRINK_DISTRIBUTIONS.INVESTIGATE
          );
        }
      });

      break;
    case EventType.SAVED:
      event.actions.map(async (action) => {
        switch (action.type) {
          case ActionTypes.KILL:
            return incrementDrink(
              prisma,
              game,
              event.id,
              action.userId,
              DRINK_DISTRIBUTIONS.FAILED_KILL
            );
          case ActionTypes.HEAL:
            await incrementDrink(
              prisma,
              game,
              event.id,
              action.userId,
              DRINK_DISTRIBUTIONS.HEAL
            );
            return incrementDrink(
              prisma,
              game,
              event.id,
              action.targetId,
              DRINK_DISTRIBUTIONS.HEALED
            );
          default:
            throw new TRPCClientError("Unexpected action type");
        }
      });
  }
  return;
};

export const incrementDrink = async (
  prisma: PrismaClient,
  game: Game,
  eventId: number,
  targetId: number,
  amount: number
) =>
  prisma.drinks.upsert({
    where: {
      day_stage_gameId_targetId: {
        day: game.day,
        stage: game.stage,
        gameId: game.id,
        targetId,
      },
    },
    update: {
      amount: {
        increment: amount,
      },
      events: {
        connect: {
          id: eventId,
        },
      },
    },
    create: {
      day: game.day,
      stage: game.stage,
      gameId: game.id,
      targetId,
      amount,
      events: {
        connect: {
          id: eventId,
        },
      },
    },
  });
