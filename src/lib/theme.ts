import type { Locale, SiteSettings } from "./types";

const RADIUS: Record<SiteSettings["brand"]["radius"], string> = { none: "0px", sm: "6px", md: "10px", lg: "14px", xl: "22px" };

/** Google Fonts query strings for the fonts offered in the admin */
const FONT_QUERY: Record<string, string> = {
  // Latin
  Inter: "Inter:wght@300..800",
  "Plus Jakarta Sans": "Plus+Jakarta+Sans:wght@300..800",
  Manrope: "Manrope:wght@300..800",
  "DM Sans": "DM+Sans:wght@300..800",
  Poppins: "Poppins:wght@300;400;500;600;700",
  Outfit: "Outfit:wght@300..800",
  // Arabic (all include Latin glyphs too)
  "IBM Plex Sans Arabic": "IBM+Plex+Sans+Arabic:wght@300;400;500;600;700",
  Tajawal: "Tajawal:wght@300;400;500;700;800",
  Almarai: "Almarai:wght@300;400;700;800",
  Cairo: "Cairo:wght@300..900",
  "Noto Kufi Arabic": "Noto+Kufi+Arabic:wght@300..800",
  "Noto Sans Arabic": "Noto+Sans+Arabic:wght@300..800",
  "Readex Pro": "Readex+Pro:wght@200..700",
  Rubik: "Rubik:wght@300..800",
};

export const LATIN_FONTS = ["Inter", "Plus Jakarta Sans", "Manrope", "DM Sans", "Poppins", "Outfit", "Rubik", "Readex Pro"];
export const ARABIC_FONTS = ["IBM Plex Sans Arabic", "Tajawal", "Almarai", "Noto Sans Arabic", "Noto Kufi Arabic", "Readex Pro", "Rubik", "Cairo"];

export function fontHref(...fonts: string[]) {
  const q = [...new Set(fonts.filter(Boolean))].map((f) => FONT_QUERY[f] || FONT_QUERY.Inter).map((f) => `family=${f}`).join("&");
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

export function siteFont(s: SiteSettings, locale: Locale) {
  return locale === "ar" ? s.brand.fontAr || "IBM Plex Sans Arabic" : s.brand.fontEn || "Inter";
}

export function themeVars(s: SiteSettings, locale: Locale): Record<string, string> {
  const b = s.brand;
  const radius = RADIUS[b.radius] || RADIUS.lg;
  const btnRadius = b.buttonStyle === "pill" ? "999px" : b.buttonStyle === "square" ? "4px" : radius;
  const font = siteFont(s, locale);
  const fallback = locale === "ar" ? '"IBM Plex Sans Arabic", "Tajawal", system-ui, sans-serif' : '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif';
  return {
    "--c-primary": b.primaryColor,
    "--c-primary-dark": b.primaryDark,
    "--c-secondary": b.secondaryColor,
    "--c-accent": b.accentColor,
    "--c-text": b.textColor,
    "--c-muted": b.mutedColor,
    "--c-bg": b.bgColor,
    "--c-surface": b.surfaceColor,
    "--font-site": `"${font}", ${fallback}`,
    "--font-scale": String(b.fontScale || 1),
    "--heading-weight": String(b.headingWeight || 700),
    "--radius": radius,
    "--btn-radius": btnRadius,
  };
}
