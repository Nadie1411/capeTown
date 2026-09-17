import { z } from "zod";
import { prisma } from "@/lib/db";
import { mapPage } from "@/lib/content";
import { handle, ok, parseBody, bad } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { normalizeBlocks } from "@/blocks/registry";

export const GET = handle(async (_req, ctx) => {
  const { id } = await ctx.params;
  const row = await prisma.page.findUnique({ where: { id } });
  if (!row) return bad("Not found", 404);
  return ok({ page: mapPage(row) });
});

export const PUT = handle(async (req, ctx) => {
  const { id } = await ctx.params;
  const parsed = await parseBody(
    req,
    z.object({
      slug: z.string().optional(),
      title: z.object({ ar: z.string(), en: z.string() }).optional(),
      published: z.boolean().optional(),
      isHome: z.boolean().optional(),
      blocks: z.array(z.any()).optional(),
      seo: z.any().optional(),
    })
  );
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;
  const data: any = { edited: true };
  if (d.slug !== undefined) {
    const slug = slugify(d.slug);
    if (!slug) return bad("Invalid slug");
    data.slug = slug;
  }
  if (d.title) {
    data.titleAr = d.title.ar;
    data.titleEn = d.title.en;
  }
  if (d.published !== undefined) data.published = d.published;
  if (d.blocks) data.blocks = JSON.stringify(normalizeBlocks(d.blocks));
  if (d.seo) data.seo = JSON.stringify(d.seo);
  if (d.isHome === true) {
    await prisma.page.updateMany({ where: { isHome: true, NOT: { id } }, data: { isHome: false } });
    data.isHome = true;
  }
  const row = await prisma.page.update({ where: { id }, data });
  return ok({ page: mapPage(row) });
});

export const DELETE = handle(async (_req, ctx) => {
  const { id } = await ctx.params;
  const row = await prisma.page.findUnique({ where: { id } });
  if (!row) return bad("Not found", 404);
  if (row.isHome) return bad("The home page cannot be deleted");
  await prisma.page.delete({ where: { id } });
  return ok();
});
