import { withBase } from "@/lib/base";
import type { Locale } from "@/lib/types";

export function EmptyPage({ locale }: { locale: Locale }) {
  return (
    <div className="wrap wrap-narrow py-24 text-center">
      <h1 className="text-3xl font-black text-[var(--c-primary)]">{locale === "ar" ? "الموقع قيد الإعداد" : "Site under construction"}</h1>
      <p className="mt-3 text-[var(--c-muted)]">{locale === "ar" ? "لم يتم إنشاء الصفحة الرئيسية بعد. أنشئها من لوحة التحكم." : "The home page has not been created yet. Create it from the admin panel."}</p>
      <a href={withBase("/admin")} className="btn btn-primary mt-6">Admin</a>
    </div>
  );
}
