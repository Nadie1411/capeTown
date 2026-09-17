/* CLI wrapper: `npm run db:seed` fills empty tables; `npm run db:seed -- --reset` wipes content and reinstalls the defaults.
   Also runs on every container start (idempotent). The real logic lives in src/lib/seed.ts */
import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/lib/seed";

const prisma = new PrismaClient();
const reset = process.argv.includes("--reset") ? "all" : process.argv.includes("--reset-design") ? "design" : "none";

seedDatabase(prisma, { reset, log: console.log })
  .then(() => console.log("✓ seed complete"))
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
