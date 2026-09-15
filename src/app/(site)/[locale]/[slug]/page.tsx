import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug, getRenderContext } from "@/lib/content";
import { isLocale, lt } from "@/lib/i18n";
import { PageRenderer } from "@/blocks/render";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : "ar";
  const page = await getPageBySlug(slug);
  if (!page) return {};
  return {
    title: lt(page.seo.title, locale) || lt(page.title, locale),
    description: lt(page.seo.description, locale) || undefined,
    robots: page.seo.noIndex ? { index: false } : undefined,
    openGraph: page.seo.ogImageUrl ? { images: [page.seo.ogImageUrl] } : undefined,
  };
}

export default async function GenericPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : "ar";
  const page = await getPageBySlug(slug);
  if (!page || page.isHome) notFound();
  const ctx = await getRenderContext();
  return <PageRenderer blocks={page.blocks} ctx={{ ...ctx, locale, pageTitle: page.title, pageSlug: page.slug }} />;
}
