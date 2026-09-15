/* Resets an admin password from the command line (for when it is forgotten).
   Usage: npm run reset-password -- admin@example.com "NewStrongPassword123"  */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [email, password] = process.argv.slice(2);
if (!email || !password || password.length < 8) {
  console.error("Usage: npm run reset-password -- <email> <new password (8+ chars)>");
  process.exit(1);
}
const prisma = new PrismaClient();
prisma.user
  .findUnique({ where: { email: email.toLowerCase() } })
  .then(async (user) => {
    const passwordHash = await bcrypt.hash(password, 10);
    if (user) {
      await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
      console.log(`✓ password updated for ${user.email}`);
    } else {
      await prisma.user.create({ data: { email: email.toLowerCase(), name: "Admin", passwordHash } });
      console.log(`✓ admin user ${email} created`);
    }
  })
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
