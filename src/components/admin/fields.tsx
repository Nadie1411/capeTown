"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LText, LinkItem, PageData } from "@/lib/types";
import { ICONS, PICKER_ICONS } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button, Input, Modal, Select, Textarea } from "./ui";
import { useT, useAdminLang } from "./i18n";
import { Search, X } from "lucide-react";

/* ------------------------------ bilingual text ------------------------------ */

const LANGS: { key: "ar" | "en"; label: string; dir: "rtl" | "ltr" }[] = [
  { key: "ar", label: "AR", dir: "rtl" },
  { key: "en", label: "EN", dir: "ltr" },
];

export function LTextField({ value, onChange, label, multiline, placeholder, rows = 3 }: { value: LText; onChange: (v: LText) => void; label?: string; multiline?: boolean; placeholder?: string; rows?: number }) {
  const adminLang = useAdminLang();
  const v = value || { ar: "", en: "" };
  const langs = adminLang === "ar" ? LANGS : [...LANGS].reverse();
  return (
    <div>
      {label ? <label className="a-label">{label}</label> : null}
      <div className="grid gap-1.5">
        {langs.map((l) => (
          <div key={l.key} className="relative">
            <span className={cn("pointer-events-none absolute top-2 z-[1] rounded bg-slate-100 px-1 text-[10px] font-bold text-slate-500", l.dir === "rtl" ? "left-2" : "right-2")}>{l.label}</span>
            {multiline ? (
              <Textarea rows={rows} dir={l.dir} value={v[l.key] || ""} placeholder={placeholder} onChange={(e) => onChange({ ...v, [l.key]: e.target.value })} className="!pe-9" />
            ) : (
              <Input dir={l.dir} value={v[l.key] || ""} placeholder={placeholder} onChange={(e) => onChange({ ...v, [l.key]: e.target.value })} className="!pe-9" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ color ------------------------------ */

const PRESETS = ["#233283", "#17205c", "#0f172a", "#d4a12a", "#ffffff", "#f4f6fb", "#1a2033", "#5b6474", "#25d366", "#e11d48", "#0ea5e9", "#16a34a"];

export function ColorField({ value, onChange, label, allowEmpty = true }: { value: string; onChange: (v: string) => void; label?: string; allowEmpty?: boolean }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const valid = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value || "");
  return (
    <div ref={ref} className="relative">
      {label ? <label className="a-label">{label}</label> : null}
      <div className="flex items-center gap-2">
        <button type="button" className="h-9 w-9 flex-none rounded-lg border border-slate-200 shadow-inner" style={{ background: valid ? value : "repeating-conic-gradient(#e2e8f0 0 25%, #fff 0 50%) 50%/10px 10px" }} onClick={() => setOpen((o) => !o)} aria-label="Pick color" />
        <Input value={value || ""} placeholder={allowEmpty ? t({ en: "Default", ar: "افتراضي" }) : "#000000"} dir="ltr" onChange={(e) => onChange(e.target.value.trim())} className="font-mono" />
        {allowEmpty && value ? <Button size="icon" variant="ghost" onClick={() => onChange("")} aria-label="Clear"><X size={14} /></Button> : null}
      </div>
      {open ? (
        <div className="absolute z-20 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <input type="color" value={valid ? (value.length === 4 ? "#" + value.slice(1).split("").map((c) => c + c).join("") : value) : "#233283"} onChange={(e) => onChange(e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-slate-200" />
          <div className="mt-2 grid grid-cols-6 gap-1.5">
            {PRESETS.map((p) => (
              <button key={p} type="button" className={cn("h-7 w-full rounded-md border", value?.toLowerCase() === p ? "border-slate-900 ring-2 ring-slate-300" : "border-slate-200")} style={{ background: p }} onClick={() => onChange(p)} aria-label={p} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------ icon picker ------------------------------ */

export function IconField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const Cur = ICONS[value];
  const list = useMemo(() => PICKER_ICONS.filter((n) => n.toLowerCase().includes(q.toLowerCase())), [q]);
  return (
    <div>
      {label ? <label className="a-label">{label}</label> : null}
      <div className="flex items-center gap-2">
        <button type="button" className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm hover:border-slate-400" onClick={() => setOpen(true)}>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#233283]/10 text-[#233283]">{Cur ? <Cur size={18} /> : "?"}</span>
          <span className="font-mono text-xs text-slate-600">{value || t({ en: "Choose icon", ar: "اختر أيقونة" })}</span>
        </button>
        {value ? <Button size="icon" variant="ghost" onClick={() => onChange("")} aria-label="Clear"><X size={14} /></Button> : null}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={t({ en: "Choose an icon", ar: "اختر أيقونة" })} size="lg">
        <div className="relative mb-3">
          <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input autoFocus placeholder={t({ en: "Search…", ar: "بحث…" })} value={q} onChange={(e) => setQ(e.target.value)} className="!ps-9" dir="ltr" />
        </div>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 md:grid-cols-10">
          {list.map((n) => {
            const C = ICONS[n];
            return (
              <button key={n} type="button" title={n} className={cn("flex aspect-square flex-col items-center justify-center rounded-lg border text-slate-700 hover:border-[#233283] hover:bg-blue-50", value === n ? "border-[#233283] bg-blue-50" : "border-slate-200")} onClick={() => { onChange(n); setOpen(false); }}>
                <C size={22} />
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

/* ------------------------------ link ------------------------------ */

const LINK_STYLES: { value: LinkItem["style"]; label: LText }[] = [
  { value: "primary", label: { en: "Primary (blue)", ar: "أساسي (أزرق)" } },
  { value: "secondary", label: { en: "Secondary (gold)", ar: "ثانوي (ذهبي)" } },
  { value: "outline", label: { en: "Outline", ar: "إطار" } },
  { value: "ghost", label: { en: "Text link", ar: "رابط نصي" } },
  { value: "call", label: { en: "Call (gold + phone icon)", ar: "اتصال (ذهبي + أيقونة)" } },
  { value: "whatsapp", label: { en: "WhatsApp (green)", ar: "واتساب (أخضر)" } },
];

export function LinkField({ value, onChange, pages }: { value: LinkItem; onChange: (v: LinkItem) => void; pages?: PageData[] }) {
  const t = useT();
  const lang = useAdminLang();
  const v = value || { label: { ar: "", en: "" }, href: "/", style: "primary" as const };
  const presets = [
    { value: "tel:", label: t({ en: "Call (first phone number)", ar: "اتصال (الرقم الأول)" }) },
    { value: "whatsapp:", label: t({ en: "WhatsApp", ar: "واتساب" }) },
    { value: "mailto:", label: t({ en: "Email", ar: "البريد الإلكتروني" }) },
    ...(pages || []).map((p) => ({ value: p.isHome ? "/" : `/${p.slug}`, label: `${t({ en: "Page", ar: "صفحة" })}: ${p.title[lang] || p.title.en || p.title.ar}` })),
    { value: "#services", label: t({ en: "Anchor: #services", ar: "قسم: #services" }) },
    { value: "#projects", label: t({ en: "Anchor: #projects", ar: "قسم: #projects" }) },
    { value: "#contact", label: t({ en: "Anchor: #contact", ar: "قسم: #contact" }) },
    { value: "__custom", label: t({ en: "Custom URL…", ar: "رابط مخصص…" }) },
  ];
  const isPreset = presets.some((p) => p.value === v.href);
  const [custom, setCustom] = useState(!isPreset);
  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <LTextField label={t({ en: "Button text", ar: "نص الزر" })} value={v.label} onChange={(label) => onChange({ ...v, label })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="a-label">{t({ en: "Opens", ar: "يفتح" })}</label>
          <Select options={presets} value={custom ? "__custom" : v.href} onChange={(e) => { if (e.target.value === "__custom") { setCustom(true); onChange({ ...v, href: v.href.startsWith("http") ? v.href : "https://" }); } else { setCustom(false); onChange({ ...v, href: e.target.value }); } }} />
          {custom ? <Input className="mt-1.5" dir="ltr" placeholder="https://… or /page" value={v.href} onChange={(e) => onChange({ ...v, href: e.target.value })} /> : null}
        </div>
        <div>
          <label className="a-label">{t({ en: "Style", ar: "الشكل" })}</label>
          <Select options={LINK_STYLES.map((s) => ({ value: s.value, label: t(s.label) }))} value={v.style} onChange={(e) => onChange({ ...v, style: e.target.value as LinkItem["style"] })} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <IconField label={t({ en: "Icon (optional)", ar: "أيقونة (اختياري)" })} value={v.icon || ""} onChange={(icon) => onChange({ ...v, icon })} />
        <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={!!v.newTab} onChange={(e) => onChange({ ...v, newTab: e.target.checked })} /> {t({ en: "Open in new tab", ar: "فتح في تبويب جديد" })}</label>
      </div>
    </div>
  );
}
