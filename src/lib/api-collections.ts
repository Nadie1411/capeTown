import { z } from "zod";
import { prisma } from "@/lib/db";
import { mapProject, mapService } from "@/lib/content";
import { slugify } from "@/lib/utils";

const L = z.object({ ar: z.string().default(""), en: z.string().default("") });
const gallery = z.array(z.object({ url: z.string(), kind: z.enum(["image", "video"]).default("image"), posterUrl: z.string().optional(), caption: L.optional() })).default([]);

export const serviceSchema = z.object({
  slug: z.string().optional(),
  title: L,
  summary: L.default({ ar: "", en: "" }),
  body: L.default({ ar: "", en: "" }),
  icon: z.string().default("Hammer"),
  coverUrl: z.string().default(""),
  gallery,
  order: z.number().int().default(0),
  featured: z.boolean().default(true),
  published: z.boolean().default(true),
});

export const projectSchema = serviceSchema.omit({ icon: true }).extend({
  category: z.string().default("residential"),
  location: L.default({ ar: "", en: "" }),
  year: z.string().default(""),
  client: z.string().default(""),
});

async function uniqueSlug(table: "service" | "project", base: string, excludeId?: string) {
  let slug = slugify(base) || `${table}-${Date.now().toString(36)}`;
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const found = table === "service" ? await prisma.service.findUnique({ where: { slug } }) : await prisma.project.findUnique({ where: { slug } });
    if (!found || found.id === excludeId) return slug;
    slug = `${slugify(base)}-${++i}`;
  }
}

export function serviceToRow(d: z.infer<typeof serviceSchema>) {
  return {
    titleAr: d.title.ar,
    titleEn: d.title.en,
    summaryAr: d.summary.ar,
    summaryEn: d.summary.en,
    bodyAr: d.body.ar,
    bodyEn: d.body.en,
    icon: d.icon,
    coverUrl: d.coverUrl,
    gallery: JSON.stringify(d.gallery),
    order: d.order,
    featured: d.featured,
    published: d.published,
  };
}

export function projectToRow(d: z.infer<typeof projectSchema>) {
  return {
    titleAr: d.title.ar,
    titleEn: d.title.en,
    category: d.category,
    locationAr: d.location.ar,
    locationEn: d.location.en,
    year: d.year,
    client: d.client,
    summaryAr: d.summary.ar,
    summaryEn: d.summary.en,
    bodyAr: d.body.ar,
    bodyEn: d.body.en,
    coverUrl: d.coverUrl,
    gallery: JSON.stringify(d.gallery),
    order: d.order,
    featured: d.featured,
    published: d.published,
  };
}

export async function createService(d: z.infer<typeof serviceSchema>) {
  const slug = await uniqueSlug("service", d.slug || d.title.en || d.title.ar);
  const count = await prisma.service.count();
  return mapService(await prisma.service.create({ data: { ...serviceToRow(d), slug, order: d.order || count } }));
}
export async function updateService(id: string, d: z.infer<typeof serviceSchema>) {
  const slug = await uniqueSlug("service", d.slug || d.title.en || d.title.ar, id);
  return mapService(await prisma.service.update({ where: { id }, data: { ...serviceToRow(d), slug } }));
}
export async function createProject(d: z.infer<typeof projectSchema>) {
  const slug = await uniqueSlug("project", d.slug || d.title.en || d.title.ar);
  const count = await prisma.project.count();
  return mapProject(await prisma.project.create({ data: { ...projectToRow(d), slug, order: d.order || count } }));
}
export async function updateProject(id: string, d: z.infer<typeof projectSchema>) {
  const slug = await uniqueSlug("project", d.slug || d.title.en || d.title.ar, id);
  return mapProject(await prisma.project.update({ where: { id }, data: { ...projectToRow(d), slug } }));
}
