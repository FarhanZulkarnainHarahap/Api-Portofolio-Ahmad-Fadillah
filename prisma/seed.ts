import bcrypt from "bcrypt";
import { Role } from "../src/app/generated/prisma/client/index.js";
import { prisma } from "../src/config/db.js";

const adminSeed = {
  name: "Ahamad Fadillah Harahap",
  email: "ahmadhrp975@gmail.com",
  password: "dilla07052000",
};

async function main() {
  const passwordHash = await bcrypt.hash(adminSeed.password, 12);

  const admin = await prisma.admin.upsert({
    where: { email: adminSeed.email },
    update: {
      name: adminSeed.name,
      passwordHash,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      name: adminSeed.name,
      email: adminSeed.email,
      passwordHash,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log(`Admin ready: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
