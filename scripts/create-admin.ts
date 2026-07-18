import "dotenv/config";
import { z } from "zod";
import { Role } from "../src/app/generated/prisma/client/index.js";
import { prisma } from "../src/config/db.js";
import { createAdminManually } from "../src/services/auth.service.js";

const schema = z.object({
  ADMIN_NAME: z.string().min(2),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
});

async function main() {
  const env = schema.parse(process.env);
  const existing = await prisma.admin.findUnique({ where: { email: env.ADMIN_EMAIL } });
  if (existing) {
    throw new Error("Admin with this email already exists");
  }

  const admin = await createAdminManually({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
    role: Role.SUPER_ADMIN,
  });

  console.log(`Admin created: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
