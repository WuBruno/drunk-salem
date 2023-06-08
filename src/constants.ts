import { Role, Team } from "@prisma/client";

export const roles: Map<Role, Team> = new Map<Role, Team>([
  [Role.MAFIA_KILLING, Team.MAFIA],
  [Role.MAFIA, Team.MAFIA],
  [Role.DOCTOR, Team.TOWN],
  [Role.DETECTIVE, Team.TOWN],
  [Role.TOWNSPERSON, Team.TOWN],
  [Role.UNASSIGNED, Team.UNASSIGNED],
]);
