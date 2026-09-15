"use client";
import type { LeadData } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Card, PageHeader, Badge } from "@/components/admin/ui";
import { useT, useAdminLang } from "@/components/admin/i18n";
import { FileText, Hammer, Building2, Images, Inbox, CircleCheck, Circle, QrCode, Settings, ExternalLink } from "lucide-react";

export function Dashboard({ counts, recent, checklist }: { counts: Record<string, number>; recent: LeadData[]; checklist: Record<string, boolean> }) {
  const t = useT();
  const lang = useAdminLang();
  const tiles = [
    { href: "/admin/pages", icon: FileText, label: t({ en: "Pages", ar: "الصفحات" }), value: counts.pages },
    { href: "/admin/services", icon: Hammer, label: t({ en: "Services", ar: "الخدمات" }), value: counts.services },
    { href: "/admin/projects", icon: Building2, label: t({ en: "Projects", ar: "المشاريع" }), value: counts.projects },
    { href: "/admin/media", icon: Images, label: t({ en: "Media files", ar: "ملفات الوسائط" }), value: counts.media },
    { href: "/admin/leads", icon: Inbox, label: t({ en: "Messages", ar: "الرسائل" }), value: counts.leads, badge: counts.unread },
  ];
  const steps = [
    { ok: checklist.password, label: t({ en: "Change the default admin password", ar: "غيّر كلمة مرور المدير الافتراضية" }), href: "/admin/account" },
    { ok: checklist.phone, label: t({ en: "Enter your real phone numbers & WhatsApp", ar: "أدخل أرقام الهاتف والواتساب الحقيقية" }), href: "/admin/settings?tab=contact" },
    { ok: checklist.siteUrl, label: t({ en: "Set the public website URL (for the QR code)", ar: "أدخل رابط الموقع العام (لرمز QR)" }), href: "/admin/settings?tab=seo" },
    { ok: true, label: t({ en: "Replace placeholder images with real project photos", ar: "استبدل الصور المؤقتة بصور المشاريع الحقيقية" }), href: "/admin/projects" },
  ];
  return (
    <>
      <PageHeader title={t({ en: "Dashboard", ar: "لوحة التحكم" })} description={t({ en: "Everything on the website is editable from here.", ar: "كل ما في الموقع قابل للتعديل من هنا." })} actions={<a href="/" target="_blank" className="a-btn a-btn-secondary"><ExternalLink size={15} /> {t({ en: "Open website", ar: "فتح الموقع" })}</a>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {tiles.map((x) => (
          <a key={x.href} href={x.href} className="a-card flex items-center gap-3 p-4 transition hover:border-[#233283]/40 hover:shadow">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#233283]/10 text-[#233283]"><x.icon size={22} /></span>
            <span>
              <span className="block text-2xl font-extrabold leading-none text-slate-900" dir="ltr">{x.value}</span>
              <span className="mt-1 block text-xs font-semibold text-slate-500">{x.label}{x.badge ? <Badge tone="rose">{x.badge} {t({ en: "new", ar: "جديد" })}</Badge> : null}</span>
            </span>
          </a>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title={t({ en: "Latest messages", ar: "آخر الرسائل" })} className="lg:col-span-2" padded={false} actions={<a href="/admin/leads" className="text-xs font-bold text-[#233283] hover:underline">{t({ en: "All messages", ar: "كل الرسائل" })}</a>}>
          {recent.length ? (
            <ul className="divide-y divide-slate-100">
              {recent.map((l) => (
                <li key={l.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <span className={`h-2 w-2 flex-none rounded-full ${l.read ? "bg-slate-300" : "bg-rose-500"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-slate-800">{l.name} <span className="font-normal text-slate-500" dir="ltr">{l.phone}</span></span>
                    <span className="block truncate text-slate-500">{l.service ? `${l.service} — ` : ""}{l.message}</span>
                  </span>
                  <span className="flex-none text-xs text-slate-400">{formatDate(l.createdAt, lang)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-slate-500">{t({ en: "No messages yet. Contact form submissions will appear here.", ar: "لا توجد رسائل بعد. ستظهر هنا رسائل نموذج التواصل." })}</p>
          )}
        </Card>
        <div className="grid gap-6">
          <Card title={t({ en: "Getting started", ar: "خطوات البداية" })}>
            <ul className="grid gap-2.5">
              {steps.map((s, i) => (
                <li key={i}>
                  <a href={s.href} className="flex items-start gap-2 text-sm hover:underline">
                    {s.ok ? <CircleCheck size={18} className="mt-0.5 flex-none text-emerald-500" /> : <Circle size={18} className="mt-0.5 flex-none text-slate-300" />}
                    <span className={s.ok ? "text-slate-500" : "font-semibold text-slate-800"}>{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Card>
          <Card title={t({ en: "Quick links", ar: "روابط سريعة" })}>
            <div className="grid grid-cols-2 gap-2">
              <a href="/admin/qr" className="a-btn a-btn-secondary justify-start"><QrCode size={16} /> {t({ en: "QR code", ar: "رمز QR" })}</a>
              <a href="/admin/settings" className="a-btn a-btn-secondary justify-start"><Settings size={16} /> {t({ en: "Settings", ar: "الإعدادات" })}</a>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
