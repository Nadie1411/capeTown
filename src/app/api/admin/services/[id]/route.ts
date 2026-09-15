import { prisma } from "@/lib/db";
import { handle, ok, parseBody } from "@/lib/api";
import { serviceSchema, updateService } from "@/lib/api-collections";

export const PUT = handle(async (req, ctx) => {
  const { id } = await ctx.params;
  const parsed = await parseBody(req, serviceSchema);
  if ("error" in parsed) return parsed.error;
  return ok({ service: await updateService(id, parsed.data) });
});

export const DELETE = handle(async (_req, ctx) => {
  const { id } = await ctx.params;
  await prisma.service.delete({ where: { id } });
  return ok();
});
