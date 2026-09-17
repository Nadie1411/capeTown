import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/content";
import { withBase } from "@/lib/base";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings();
  const origin = new URL(settings.seo.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").origin;
  return { rules: [{ userAgent: "*", allow: withBase("/"), disallow: [withBase("/admin"), withBase("/api"), withBase("/preview")] }], sitemap: `${origin}${withBase("/sitemap.xml")}` };
}
