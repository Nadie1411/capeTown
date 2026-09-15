import { z } from "zod";
import { prisma } from "@/lib/db";
import { handle, ok, parseBody } from "@/lib/api";

export const PUT = handle(async (req) => {
  const parsed = await parseBody(req, z.object({ ids: z.array(z.string()) }));
  if ("error" in parsed) return parsed.error;
  await prisma.$transaction(parsed.data.ids.map((id, i) => prisma.project.update({ where: { id }, data: { order: i } })));
  return ok();
});
