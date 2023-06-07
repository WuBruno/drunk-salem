import { roles } from "../src/constants";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  return prisma.$transaction([
    prisma.roles.deleteMany(),
    prisma.roles.createMany({
      data: Array.from(roles.entries(), ([role, team]) => ({ role, team })),
    }),
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
