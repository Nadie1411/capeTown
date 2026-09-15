import { z } from "zod";
import { prisma } from "@/lib/db";
import { getPages, mapPage } from "@/lib/content";
import { handle, ok, parseBody, bad } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { createBlock } from "@/blocks/registry";

export const GET = handle(async () => ok({ pages: await getPages() }));

export const POST = handle(async (req) => {
  const parsed = await parseBody(
    req,
    z.object({
      slug: z.string().min(1),
      title: z.object({ ar: z.string().default(""), en: z.string().default("") }),
      template: z.enum(["blank", "standard"]).default("standard"),
    })
  );
  if ("error" in parsed) return parsed.error;
  const slug = slugify(parsed.data.slug);
  if (!slug) return bad("Invalid slug");
  const blocks = parsed.data.template === "standard" ? [createBlock("pageHeader", { content: { title: parsed.data.title } }), createBlock("richText")] : [];
  const row = await prisma.page.create({ data: { slug, titleAr: parsed.data.title.ar, titleEn: parsed.data.title.en, blocks: JSON.stringify(blocks) } });
  return ok({ page: mapPage(row) });
});
