import { headers } from "next/headers";
import { DEFAULT_LOCALE, localePath, t } from "@/lib/i18n";

export default async function NotFound() {
  const h = await headers();
  const ref = h.get("referer") || "";
  const locale = /\/ar(\/|$)/.test(ref) ? "ar" : /\/en(\/|$)/.test(ref) ? "en" : DEFAULT_LOCALE;
  return (
    <div className="wrap wrap-narrow py-28 text-center" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="text-7xl font-black text-[var(--c-primary)]/20">404</div>
      <h1 className="mt-2 text-3xl font-black text-[var(--c-primary)]">{t(locale, "notFound")}</h1>
      <p className="mt-3 text-[var(--c-muted)]">{t(locale, "notFoundText")}</p>
      <a href={localePath(locale, "/")} className="btn btn-primary btn-lg mt-8">{t(locale, "backHome")}</a>
    </div>
  );
}
