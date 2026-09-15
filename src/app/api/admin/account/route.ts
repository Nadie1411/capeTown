import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, hashPassword, verifyCredentials } from "@/lib/auth";
import { handle, ok, parseBody, bad } from "@/lib/api";

export const PUT = handle(async (req) => {
  const session = await getSession();
  if (!session) return bad("Unauthorized", 401);
  const parsed = await parseBody(req, z.object({ name: z.string().min(1).max(80).optional(), email: z.string().email().optional(), currentPassword: z.string().optional(), newPassword: z.string().min(8).max(200).optional() }));
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return bad("Unauthorized", 401);
  const data: any = {};
  if (d.name) data.name = d.name;
  if (d.email) data.email = d.email.toLowerCase();
  if (d.newPassword) {
    if (!d.currentPassword || !(await verifyCredentials(user.email, d.currentPassword))) return bad("Current password is incorrect", 400);
    data.passwordHash = await hashPassword(d.newPassword);
  }
  await prisma.user.update({ where: { id: user.id }, data });
  return ok();
});
