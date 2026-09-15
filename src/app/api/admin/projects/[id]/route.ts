import { prisma } from "@/lib/db";
import { handle, ok, parseBody } from "@/lib/api";
import { projectSchema, updateProject } from "@/lib/api-collections";

export const PUT = handle(async (req, ctx) => {
  const { id } = await ctx.params;
  const parsed = await parseBody(req, projectSchema);
  if ("error" in parsed) return parsed.error;
  return ok({ project: await updateProject(id, parsed.data) });
});

export const DELETE = handle(async (_req, ctx) => {
  const { id } = await ctx.params;
  await prisma.project.delete({ where: { id } });
  return ok();
});
