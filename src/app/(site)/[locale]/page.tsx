import type { Metadata } from "next";
import { getHomePage, getRenderContext } from "@/lib/content";
import { isLocale, lt } from "@/lib/i18n";
import { PageRenderer } from "@/blocks/render";
import { EmptyPage } from "@/components/site/empty";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "ar";
  const page = await getHomePage();
  if (!page) return {};
  const title = lt(page.seo.title, locale);
  const description = lt(page.seo.description, locale);
  return { ...(title ? { title: { absolute: title } } : {}), ...(description ? { description } : {}), robots: page.seo.noIndex ? { index: false } : undefined, openGraph: page.seo.ogImageUrl ? { images: [page.seo.ogImageUrl] } : undefined };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "ar";
  const [page, ctx] = await Promise.all([getHomePage(), getRenderContext()]);
  if (!page) return <EmptyPage locale={locale} />;
  return <PageRenderer blocks={page.blocks} ctx={{ ...ctx, locale, pageTitle: page.title, pageSlug: page.slug }} />;
}
