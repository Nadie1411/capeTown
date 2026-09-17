import { prisma } from "./db";
import { mergeSettings } from "./settings-defaults";
import { normalizeBlocks } from "@/blocks/registry";
import { safeJson } from "./utils";
import type { LeadData, MediaData, PageData, PageSeo, ProjectData, ServiceData, SiteSettings } from "./types";

/* ------------------------------ settings ------------------------------ */

export async function getSettings(): Promise<SiteSettings> {
  const row = await prisma.setting.findUnique({ where: { id: "site" } });
  return mergeSettings(safeJson(row?.data, {}));
}

export async function saveSettings(data: any) {
  const merged = mergeSettings(data);
  (merged as any)._meta = { ...((data && data._meta) || {}), edited: true };
  await prisma.setting.upsert({
    where: { id: "site" },
    create: { id: "site", data: JSON.stringify(merged) },
    update: { data: JSON.stringify(merged) },
  });
  return merged;
}

/* ------------------------------ pages ------------------------------ */

const DEFAULT_SEO: PageSeo = { title: { ar: "", en: "" }, description: { ar: "", en: "" }, ogImageUrl: "", noIndex: false };

export function mapPage(row: any): PageData {
  return {
    id: row.id,
    slug: row.slug,
    title: { ar: row.titleAr, en: row.titleEn },
    isHome: row.isHome,
    published: row.published,
    blocks: normalizeBlocks(safeJson(row.blocks, [])),
    seo: { ...DEFAULT_SEO, ...safeJson(row.seo, {}) },
    updatedAt: row.updatedAt?.toISOString?.() ?? row.updatedAt,
  };
}

export async function getPages(): Promise<PageData[]> {
  const rows = await prisma.page.findMany({ orderBy: [{ isHome: "desc" }, { createdAt: "asc" }] });
  return rows.map(mapPage);
}

export async function getPageBySlug(slug: string, onlyPublished = true): Promise<PageData | null> {
  const row = await prisma.page.findUnique({ where: { slug } });
  if (!row) return null;
  if (onlyPublished && !row.published) return null;
  return mapPage(row);
}

export async function getHomePage(): Promise<PageData | null> {
  const row = (await prisma.page.findFirst({ where: { isHome: true } })) || (await prisma.page.findUnique({ where: { slug: "home" } }));
  return row ? mapPage(row) : null;
}

export async function getPageById(id: string): Promise<PageData | null> {
  const row = await prisma.page.findUnique({ where: { id } });
  return row ? mapPage(row) : null;
}

/* ------------------------------ services ------------------------------ */

export function mapService(row: any): ServiceData {
  return {
    id: row.id,
    slug: row.slug,
    title: { ar: row.titleAr, en: row.titleEn },
    summary: { ar: row.summaryAr, en: row.summaryEn },
    body: { ar: row.bodyAr, en: row.bodyEn },
    icon: row.icon,
    coverUrl: row.coverUrl,
    gallery: safeJson(row.gallery, []),
    order: row.order,
    featured: row.featured,
    published: row.published,
  };
}

export async function getServices(onlyPublished = true): Promise<ServiceData[]> {
  const rows = await prisma.service.findMany({ where: onlyPublished ? { published: true } : {}, orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  return rows.map(mapService);
}

export async function getServiceBySlug(slug: string): Promise<ServiceData | null> {
  const row = await prisma.service.findUnique({ where: { slug } });
  return row && row.published ? mapService(row) : null;
}

/* ------------------------------ projects ------------------------------ */

export function mapProject(row: any): ProjectData {
  return {
    id: row.id,
    slug: row.slug,
    title: { ar: row.titleAr, en: row.titleEn },
    category: row.category,
    location: { ar: row.locationAr, en: row.locationEn },
    year: row.year,
    client: row.client,
    summary: { ar: row.summaryAr, en: row.summaryEn },
    body: { ar: row.bodyAr, en: row.bodyEn },
    coverUrl: row.coverUrl,
    gallery: safeJson(row.gallery, []),
    order: row.order,
    featured: row.featured,
    published: row.published,
  };
}

export async function getProjects(onlyPublished = true): Promise<ProjectData[]> {
  const rows = await prisma.project.findMany({ where: onlyPublished ? { published: true } : {}, orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  return rows.map(mapProject);
}

export async function getProjectBySlug(slug: string): Promise<ProjectData | null> {
  const row = await prisma.project.findUnique({ where: { slug } });
  return row && row.published ? mapProject(row) : null;
}

/* ------------------------------ media / leads ------------------------------ */

export function mapMedia(row: any): MediaData {
  return {
    id: row.id,
    kind: row.kind,
    filename: row.filename,
    url: row.url,
    thumbUrl: row.thumbUrl,
    mime: row.mime,
    size: row.size,
    width: row.width,
    height: row.height,
    alt: { ar: row.altAr, en: row.altEn },
    createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
  };
}

export function mapLead(row: any): LeadData {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    service: row.service,
    message: row.message,
    locale: row.locale,
    read: row.read,
    createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
  };
}

/** Everything the block renderers need, in one call */
export async function getRenderContext() {
  const [settings, services, projects] = await Promise.all([getSettings(), getServices(), getProjects()]);
  return { settings, services, projects };
}
