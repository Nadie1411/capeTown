import { z } from "zod";
import { prisma } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";
import { handle, ok, parseBody } from "@/lib/api";

/** Reinstall the default content. "design" = pages + settings only; "all" = also services, projects and the media list. Users and messages are never touched. */
export const POST = handle(async (req) => {
  const parsed = await parseBody(req, z.object({ scope: z.enum(["design", "all"]) }));
  if ("error" in parsed) return parsed.error;
  const result = await seedDatabase(prisma, { reset: parsed.data.scope });
  return ok({ result });
});
