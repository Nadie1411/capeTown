import { z } from "zod";
import { prisma } from "@/lib/db";
import { mapLead } from "@/lib/content";
import { handle, ok, parseBody } from "@/lib/api";

export const PATCH = handle(async (req, ctx) => {
  const { id } = await ctx.params;
  const parsed = await parseBody(req, z.object({ read: z.boolean() }));
  if ("error" in parsed) return parsed.error;
  return ok({ lead: mapLead(await prisma.lead.update({ where: { id }, data: { read: parsed.data.read } })) });
});

export const DELETE = handle(async (_req, ctx) => {
  const { id } = await ctx.params;
  await prisma.lead.delete({ where: { id } });
  return ok();
});
