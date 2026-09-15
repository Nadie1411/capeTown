import type { MetadataRoute } from "next";
import { getPages, getProjects, getServices, getSettings } from "@/lib/content";
import { localePath } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, pages, services, projects] = await Promise.all([getSettings(), getPages(), getServices(), getProjects()]);
  const base = (settings.seo.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const locales = settings.locales.enabled;
  const paths: string[] = ["/", ...pages.filter((p) => p.published && !p.isHome && !p.seo.noIndex).map((p) => `/${p.slug}`), ...services.map((s) => `/services/${s.slug}`), ...projects.map((p) => `/projects/${p.slug}`)];
  return paths.flatMap((p) => locales.map((l) => ({ url: `${base}${localePath(l, p)}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.7 })));
}
