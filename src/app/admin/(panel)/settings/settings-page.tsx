"use client";
import { withBase } from "@/lib/base";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Block, SiteSettings } from "@/lib/types";
import { cn, uid } from "@/lib/utils";
import { ICONS } from "@/lib/icons";
import { Button, Card, PageHeader, Switch, api, useConfirm, useToast } from "@/components/admin/ui";
import { SchemaForm } from "@/components/admin/schema-form";
import { SETTINGS_TABS, CATEGORY_FIELDS } from "@/components/admin/settings-schema";
import { useT, useAdminLang } from "@/components/admin/i18n";
import { ensureIds } from "@/components/admin/ids";
import { Save, Eye, EyeOff, Monitor, Smartphone } from "lucide-react";

export function SettingsPage({ initial, initialTab, previewBlocks }: { initial: SiteSettings; initialTab?: string; previewBlocks: Block[] }) {
  const t = useT();
  const adminLang = useAdminLang();
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [resetting, setResetting] = useState(false);
  const resetContent = async (scope: "design" | "all") => {
    const msg = scope === "design"
      ? t({ en: "Replace ALL pages and site settings with the latest default design? Services, projects, media, messages and users are kept. This cannot be undone.", ar: "استبدال جميع الصفحات وإعدادات الموقع بأحدث تصميم افتراضي؟ تبقى الخدمات والمشاريع والوسائط والرسائل والمستخدمون. لا يمكن التراجع." })
      : t({ en: "Reset EVERYTHING to the demo content (pages, settings, services, projects, media list)? Messages and users are kept. This cannot be undone.", ar: "إعادة كل المحتوى إلى المحتوى التجريبي (الصفحات، الإعدادات، الخدمات، المشاريع، قائمة الوسائط)؟ تبقى الرسائل والمستخدمون. لا يمكن التراجع." });
    if (!(await confirm(msg))) return;
    setResetting(true);
    try {
      await api("/api/admin/reset", { method: "POST", json: { scope } });
      toast(t({ en: "Default content installed — reloading…", ar: "تم تثبيت المحتوى الافتراضي — جارٍ التحديث…" }));
      setTimeout(() => window.location.reload(), 800);
    } catch (e: any) {
      toast(e.message, "error");
      setResetting(false);
    }
  };
  const [init] = useState<SiteSettings>(() => ensureIds(initial));
  const [settings, setSettings] = useState<SiteSettings>(init);
  const [saved, setSaved] = useState(() => JSON.stringify(init));
  const [tab, setTab] = useState<string>(SETTINGS_TABS.some((x) => x.key === initialTab) ? (initialTab as string) : "brand");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(true);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [locale, setLocale] = useState<"en" | "ar">(adminLang);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const dirty = JSON.stringify(settings) !== saved;
  const current = SETTINGS_TABS.find((x) => x.key === tab)!;

  const send = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win || !readyRef.current) return;
    win.postMessage({ type: "cape:preview", blocks: previewBlocks, settings, locale, selectedId: null, showChrome: true }, "*");
  }, [settings, locale, previewBlocks]);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => { if (e.data?.type === "cape:ready") { readyRef.current = true; send(); } };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [send]);
  useEffect(() => { const id = setTimeout(send, 150); return () => clearTimeout(id); }, [send]);

  const save = async () => {
    setSaving(true);
    try {
      const d = await api<{ settings: SiteSettings }>("/api/admin/settings", { method: "PUT", json: { settings } });
      const next = ensureIds(d.settings);
      setSettings(next);
      setSaved(JSON.stringify(next));
      toast(t({ en: "Settings saved", ar: "تم حفظ الإعدادات" }));
      router.refresh();
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); if (dirty) save(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, settings]);

  const formCtx = useMemo(() => ({ services: [], projects: [], pages: [], categories: settings.projectCategories, settings }), [settings]);
  const setSection = (key: keyof SiteSettings, value: any) => setSettings((s) => ({ ...s, [key]: value }));

  return (
    <div className={cn("grid gap-6", preview && "xl:grid-cols-[minmax(0,1fr)_minmax(420px,44%)]")}>
      <div className="min-w-0">
        <PageHeader
          title={t({ en: "Site settings", ar: "إعدادات الموقع" })}
          description={t({ en: "Changes show instantly in the preview. Save to publish them.", ar: "التغييرات تظهر فوراً في المعاينة. اضغط حفظ لنشرها." })}
          actions={
            <>
              <Button onClick={() => setPreview((p) => !p)} className="hidden xl:inline-flex">{preview ? <EyeOff size={15} /> : <Eye size={15} />} {t({ en: "Preview", ar: "المعاينة" })}</Button>
              <Button variant="primary" onClick={save} loading={saving} disabled={!dirty}><Save size={15} /> {dirty ? t({ en: "Save changes", ar: "حفظ التغييرات" }) : t({ en: "Saved", ar: "محفوظ" })}</Button>
            </>
          }
        />
        <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
            {SETTINGS_TABS.map((x) => {
              const I = ICONS[x.icon];
              return (
                <button key={x.key} onClick={() => setTab(x.key)} className={cn("flex flex-none items-center gap-2 rounded-xl px-3 py-2 text-start text-sm font-semibold", tab === x.key ? "bg-white text-[#233283] shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:bg-white/70")}>
                  {I ? <I size={16} /> : null} {t(x.label)}
                </button>
              );
            })}
          </nav>
          <Card title={t(current.label)}>
            <p className="-mt-2 mb-4 text-xs text-slate-500">{t(current.description)}</p>
            {current.key === "projectCategories" ? (
              <CategoriesEditor value={settings.projectCategories} onChange={(v) => setSection("projectCategories", v)} />
            ) : current.key === "seo" ? (
              <>
                <div className="mb-5 rounded-xl border border-slate-200 px-3 py-2">
                  <div className="mb-1 text-xs font-bold text-slate-600">{t({ en: "Languages", ar: "اللغات" })}</div>
                  <Switch label="English" checked={settings.locales.enabled.includes("en")} onChange={(v) => setSection("locales", { enabled: v ? [...new Set([...settings.locales.enabled, "en"])] : settings.locales.enabled.filter((l) => l !== "en") })} />
                  <Switch label="العربية" checked={settings.locales.enabled.includes("ar")} onChange={(v) => setSection("locales", { enabled: v ? [...new Set([...settings.locales.enabled, "ar"])] : settings.locales.enabled.filter((l) => l !== "ar") })} />
                  <p className="mt-1 text-xs text-slate-500">{t({ en: "The default language is set in the .env file (NEXT_PUBLIC_DEFAULT_LOCALE).", ar: "اللغة الافتراضية تُضبط في ملف .env (NEXT_PUBLIC_DEFAULT_LOCALE)." })}</p>
                </div>
                <SchemaForm fields={current.fields} value={settings.seo} onChange={(v) => setSection("seo", v)} ctx={formCtx} />
              </>
            ) : (
              <SchemaForm key={current.key} fields={current.fields} value={(settings as any)[current.key]} onChange={(v) => setSection(current.key, coerce(current.key, v))} ctx={formCtx} />
            )}
            {current.key === "advanced" ? (
              <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                <div className="text-sm font-bold text-slate-800">{t({ en: "Default content", ar: "المحتوى الافتراضي" })}</div>
                <p className="mt-1 text-xs text-slate-600">{t({ en: "When the developer ships a new default design, pages and settings that were never edited here update automatically on deploy. Use these buttons to force it.", ar: "عند نشر تصميم افتراضي جديد، تُحدَّث الصفحات والإعدادات التي لم تُعدَّل هنا تلقائياً. استخدم هذه الأزرار لفرض ذلك." })}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="secondary" loading={resetting} onClick={() => resetContent("design")}>{t({ en: "Load latest default design (pages + settings)", ar: "تحميل أحدث تصميم افتراضي (الصفحات + الإعدادات)" })}</Button>
                  <Button variant="danger" loading={resetting} onClick={() => resetContent("all")}>{t({ en: "Reset all demo content", ar: "إعادة كل المحتوى التجريبي" })}</Button>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
      {preview ? (
        <div className="hidden xl:block">
          <div className="sticky top-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{t({ en: "Live preview", ar: "معاينة مباشرة" })}</span>
              <div className="ms-auto flex items-center gap-1 rounded-lg bg-slate-200 p-0.5">
                <button className={cn("rounded-md p-1", device === "desktop" ? "bg-white shadow-sm" : "text-slate-500")} onClick={() => setDevice("desktop")}><Monitor size={14} /></button>
                <button className={cn("rounded-md p-1", device === "mobile" ? "bg-white shadow-sm" : "text-slate-500")} onClick={() => setDevice("mobile")}><Smartphone size={14} /></button>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-slate-200 p-0.5">
                {(["en", "ar"] as const).map((l) => <button key={l} className={cn("rounded-md px-2 py-0.5 text-[11px] font-bold", locale === l ? "bg-white shadow-sm" : "text-slate-500")} onClick={() => setLocale(l)}>{l.toUpperCase()}</button>)}
              </div>
            </div>
            <div className="mx-auto overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5" style={{ width: device === "mobile" ? 390 : "100%", height: "calc(100vh - 7rem)" }}>
              <iframe ref={iframeRef} src={withBase("/preview")} title="preview" className="h-full w-full" />
            </div>
          </div>
        </div>
      ) : null}
      {dialog}
    </div>
  );
}

/** number-ish selects come back as strings */
function coerce(key: string, v: any) {
  if (key === "brand") return { ...v, fontScale: Number(v.fontScale) || 1, headingWeight: Number(v.headingWeight) || 700 };
  if (key === "header") return { ...v, logoHeight: Number(v.logoHeight) || 60 };
  return v;
}

function CategoriesEditor({ value, onChange }: { value: SiteSettings["projectCategories"]; onChange: (v: SiteSettings["projectCategories"]) => void }) {
  const t = useT();
  const field = { key: "projectCategories", type: "list" as const, label: { en: "Types", ar: "الأنواع" }, itemFields: CATEGORY_FIELDS, newItem: () => ({ key: `type-${uid()}`, icon: "Building2", label: { en: "New type", ar: "نوع جديد" } }) };
  return (
    <>
      <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{t({ en: "Changing a key will detach projects already assigned to it — rename the label instead.", ar: "تغيير المعرّف يفصل المشاريع المرتبطة به — غيّر الاسم فقط." })}</p>
      <SchemaForm fields={[field]} value={{ projectCategories: value }} onChange={(v) => onChange(v.projectCategories)} ctx={{ services: [], projects: [], pages: [], categories: value }} />
    </>
  );
}
