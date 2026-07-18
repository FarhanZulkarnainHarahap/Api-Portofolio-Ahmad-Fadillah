import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/db.js";

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`HR Portfolio API listening on port ${env.PORT}`);
});

function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
