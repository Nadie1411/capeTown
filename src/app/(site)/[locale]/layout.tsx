import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/app/globals.css";
import { getServices, getSettings } from "@/lib/content";
import { dirOf, isLocale, lt } from "@/lib/i18n";
import { fontHref, pageFonts, themeVars } from "@/lib/theme";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { FloatingButtons } from "@/components/site/floating";
import { RevealObserver } from "@/components/site/reveal";
import { asset, withBase } from "@/lib/base";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "ar";
  const s = await getSettings();
  const siteUrl = s.seo.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(siteUrl),
    title: { default: lt(s.seo.title, locale), template: `%s | ${lt(s.brand.shortName, locale)}` },
    description: lt(s.seo.description, locale),
    keywords: lt(s.seo.keywords, locale),
    icons: { icon: [{ url: withBase("/favicon.ico"), sizes: "any" }, { url: asset(s.brand.faviconUrl || "/brand/mark.svg"), type: "image/svg+xml" }], apple: withBase("/apple-touch-icon.png") },
    alternates: { languages: { en: new URL(siteUrl).origin + withBase("/"), ar: new URL(siteUrl).origin + withBase("/ar") } },
    openGraph: { type: "website", siteName: lt(s.brand.name, locale), title: lt(s.seo.title, locale), description: lt(s.seo.description, locale), images: s.brand.ogImageUrl ? [asset(s.brand.ogImageUrl)] : [], locale: locale === "ar" ? "ar_KW" : "en_US" },
  };
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const vars = themeVars(settings, locale);
  const siteUrl = settings.seo.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: lt(settings.brand.name, locale),
    url: siteUrl || undefined,
    logo: siteUrl ? `${new URL(siteUrl).origin}${asset(settings.brand.logoUrl)}` : undefined,
    image: siteUrl ? `${new URL(siteUrl).origin}${asset(settings.brand.ogImageUrl)}` : undefined,
    telephone: settings.contact.phones[0]?.number,
    email: settings.contact.email || undefined,
    address: { "@type": "PostalAddress", streetAddress: lt(settings.contact.address, locale), addressCountry: "KW" },
    areaServed: "Kuwait",
    description: lt(settings.seo.description, locale),
  };
  return (
    <html lang={locale} dir={dirOf(locale)} style={vars as any} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={fontHref(...pageFonts(settings, locale))} />
        <meta name="theme-color" content={settings.brand.primaryColor} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="site-root flex min-h-screen flex-col" dir={dirOf(locale)}>
        {settings.advanced.headCode ? <div dangerouslySetInnerHTML={{ __html: settings.advanced.headCode }} /> : null}
        <RevealObserver />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-[var(--c-primary)] focus:shadow-lg">{t(locale, "skipToContent")}</a>
        <SiteHeader settings={settings} locale={locale} />
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter settings={settings} locale={locale} services={services} />
        <FloatingButtons settings={settings} locale={locale} />
        {settings.floating.mobileBar ? <div className="h-20 md:hidden" aria-hidden="true" /> : null}
        {settings.advanced.bodyCode ? <div dangerouslySetInnerHTML={{ __html: settings.advanced.bodyCode }} /> : null}
      </body>
    </html>
  );
}
