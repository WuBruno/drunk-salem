import { roles } from "../src/constants";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  return prisma.$transaction(
    Array.from(roles.entries()).map(([role, team]) =>
      prisma.roles.upsert({
        where: {
          role,
        },
        create: {
          role,
          team,
        },
        update: {
          team,
        },
      })
    )
  );
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
