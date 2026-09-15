import { z } from "zod";
import fs from "node:fs/promises";
import { prisma } from "@/lib/db";
import { mapMedia } from "@/lib/content";
import { handle, ok, parseBody, bad } from "@/lib/api";
import { resolveUploadPath } from "@/lib/media";

export const PUT = handle(async (req, ctx) => {
  const { id } = await ctx.params;
  const parsed = await parseBody(req, z.object({ alt: z.object({ ar: z.string(), en: z.string() }) }));
  if ("error" in parsed) return parsed.error;
  const row = await prisma.media.update({ where: { id }, data: { altAr: parsed.data.alt.ar, altEn: parsed.data.alt.en } });
  return ok({ media: mapMedia(row) });
});

export const DELETE = handle(async (_req, ctx) => {
  const { id } = await ctx.params;
  const row = await prisma.media.findUnique({ where: { id } });
  if (!row) return bad("Not found", 404);
  for (const u of [row.url, row.thumbUrl]) {
    if (u && u.startsWith("/uploads/")) {
      const p = resolveUploadPath(u.replace(/^\/uploads\//, ""));
      if (p) await fs.unlink(p).catch(() => {});
    }
  }
  await prisma.media.delete({ where: { id } });
  return ok();
});
