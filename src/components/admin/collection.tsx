"use client";
import { asset, withBase } from "@/lib/base";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Field } from "@/blocks/schema";
import type { LText, ProjectCategory, ProjectData, ServiceData } from "@/lib/types";
import { L, isVideoUrl, slugify, uid } from "@/lib/utils";
import { Badge, Button, Card, PageHeader, api, useConfirm, useToast } from "./ui";
import { SchemaForm } from "./schema-form";
import { SortableList, DragHandle } from "./sortable";
import { useT, useAdminLang } from "./i18n";
import { ICONS } from "@/lib/icons";
import { Plus, Pencil, Trash2, ExternalLink, Save, Star, Eye, EyeOff } from "lucide-react";

type Kind = "service" | "project";
type Item = ServiceData | ProjectData;

const common = (kind: Kind): Field[] => [
  { key: "title", type: "ltext", label: L("الاسم", "Title") },
  { key: "slug", type: "text", label: L("الرابط (slug)", "URL slug"), width: "half", help: L("يُولّد تلقائياً من الاسم الإنجليزي إن تُرك فارغاً", "Generated from the English title if left empty") },
  ...(kind === "service"
    ? ([{ key: "icon", type: "icon", label: L("الأيقونة", "Icon"), width: "half" }] as Field[])
    : ([
        { key: "category", type: "category", label: L("نوع المبنى", "Building type"), width: "half" },
        { key: "location", type: "ltext", label: L("الموقع", "Location") },
        { key: "year", type: "text", label: L("سنة التنفيذ", "Year"), width: "half" },
        { key: "client", type: "text", label: L("العميل (اختياري)", "Client (optional)"), width: "half" },
      ] as Field[])),
  { key: "summary", type: "ltextarea", label: L("وصف مختصر (يظهر في البطاقات)", "Short description (shown on cards)") },
  { key: "body", type: "lrichtext", label: L("التفاصيل الكاملة", "Full details") },
  { key: "coverUrl", type: "media", accept: "image", label: L("الصورة الرئيسية", "Cover image") },
  {
    key: "gallery",
    type: "list",
    label: L("معرض الصور والفيديو", "Photo & video gallery"),
    itemFields: [
      { key: "url", type: "media", accept: "any", label: L("الصورة / الفيديو", "Image / video") },
      { key: "caption", type: "ltext", label: L("تعليق (اختياري)", "Caption (optional)") },
    ],
    newItem: () => ({ url: "", caption: L("", "") }),
  },
  { key: "featured", type: "boolean", label: L("مميز (يظهر في الصفحة الرئيسية)", "Featured (shown on the home page)"), width: "half" },
  { key: "published", type: "boolean", label: L("منشور", "Published"), width: "half" },
];

export function CollectionEditor({ kind, item, categories, services, projects }: { kind: Kind; item: Item | null; categories: ProjectCategory[]; services: ServiceData[]; projects: ProjectData[] }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState<any>(() =>
    item
      ? { ...item, gallery: item.gallery.map((g) => ({ ...g, _id: uid("i") })) }
      : { title: L("", ""), slug: "", icon: "Hammer", category: categories[0]?.key || "residential", location: L("", ""), year: "", client: "", summary: L("", ""), body: L("", ""), coverUrl: "", gallery: [], featured: true, published: true, order: 0 }
  );
  const [saving, setSaving] = useState(false);
  const fields = useMemo(() => common(kind), [kind]);
  const base = kind === "service" ? "/admin/services" : "/admin/projects";
  const name = kind === "service" ? t({ en: "Service", ar: "الخدمة" }) : t({ en: "Project", ar: "المشروع" });

  const save = async () => {
    if (!value.title?.en && !value.title?.ar) return toast(t({ en: "Please enter a title", ar: "الرجاء إدخال الاسم" }), "error");
    setSaving(true);
    try {
      const payload = { ...value, slug: value.slug ? slugify(value.slug) : "", gallery: (value.gallery || []).filter((g: any) => g.url).map((g: any) => ({ url: g.url, kind: isVideoUrl(g.url) ? "video" : "image", caption: g.caption })) };
      const url = item ? `/api/admin/${kind}s/${item.id}` : `/api/admin/${kind}s`;
      const d = await api<any>(url, { method: item ? "PUT" : "POST", json: payload });
      toast(t({ en: "Saved", ar: "تم الحفظ" }));
      if (!item) router.replace(`${base}/${d[kind].id}`);
      else {
        setValue((v: any) => ({ ...v, slug: d[kind].slug }));
        router.refresh();
      }
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = item ? `/${kind}s/${item.slug}` : null;
  return (
    <>
      <PageHeader
        title={item ? (value.title.en || value.title.ar) : t({ en: `New ${kind}`, ar: kind === "service" ? "خدمة جديدة" : "مشروع جديد" })}
        back={{ href: base, label: kind === "service" ? t({ en: "Services", ar: "الخدمات" }) : t({ en: "Projects", ar: "المشاريع" }) }}
        actions={
          <>
            {publicUrl ? <a href={withBase(publicUrl)} target="_blank" className="a-btn a-btn-secondary"><ExternalLink size={15} /> {t({ en: "View", ar: "عرض" })}</a> : null}
            <Button variant="primary" onClick={save} loading={saving}><Save size={15} /> {t({ en: `Save ${name.toLowerCase()}`, ar: "حفظ" })}</Button>
          </>
        }
      />
      <Card>
        <SchemaForm fields={fields} value={value} onChange={setValue} ctx={{ services, projects, pages: [], categories, instanceKey: item?.id || "new" }} />
      </Card>
    </>
  );
}

export function CollectionList({ kind, items, categories }: { kind: Kind; items: Item[]; categories: ProjectCategory[] }) {
  const t = useT();
  const lang = useAdminLang();
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [list, setList] = useState(items);
  const base = kind === "service" ? "/admin/services" : "/admin/projects";
  const title = kind === "service" ? t({ en: "Services", ar: "الخدمات" }) : t({ en: "Projects", ar: "المشاريع" });
  const reorder = async (next: Item[]) => {
    setList(next);
    try {
      await api(`/api/admin/${kind}s/reorder`, { method: "PUT", json: { ids: next.map((i) => i.id) } });
    } catch (e: any) {
      toast(e.message, "error");
    }
  };
  const remove = async (it: Item) => {
    if (!(await confirm(t({ en: `Delete "${it.title.en || it.title.ar}"?`, ar: `حذف "${it.title.ar || it.title.en}"؟` })))) return;
    await api(`/api/admin/${kind}s/${it.id}`, { method: "DELETE" });
    setList((l) => l.filter((x) => x.id !== it.id));
    toast(t({ en: "Deleted", ar: "تم الحذف" }));
    router.refresh();
  };
  const toggle = async (it: Item, key: "published" | "featured") => {
    const next = { ...it, [key]: !it[key] } as any;
    setList((l) => l.map((x) => (x.id === it.id ? next : x)));
    await api(`/api/admin/${kind}s/${it.id}`, { method: "PUT", json: next });
  };
  const catLabel = (key: string) => { const c = categories.find((c) => c.key === key); return c ? (c.label as LText)[lang] || c.label.en : key; };

  return (
    <>
      <PageHeader title={title} description={kind === "service" ? t({ en: "Services appear on the home page, the services page, the footer and the contact form.", ar: "تظهر الخدمات في الصفحة الرئيسية وصفحة الخدمات والتذييل ونموذج التواصل." }) : t({ en: "Your previous work. Drag to reorder — the order is used everywhere on the site.", ar: "أعمالك السابقة. اسحب لإعادة الترتيب — يُستخدم الترتيب في كل الموقع." })} actions={<a href={`${base}/new`} className="a-btn a-btn-primary"><Plus size={16} /> {kind === "service" ? t({ en: "New service", ar: "خدمة جديدة" }) : t({ en: "New project", ar: "مشروع جديد" })}</a>} />
      <SortableList
        items={list}
        onReorder={reorder}
        className="grid gap-2"
        render={(it, handle) => {
          const Icon = kind === "service" ? ICONS[(it as ServiceData).icon] : null;
          return (
            <div className="a-card flex items-center gap-3 p-2.5">
              <DragHandle handle={handle} />
              <div className="flex h-14 w-20 flex-none items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-[#233283]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {it.coverUrl ? <img src={asset(it.coverUrl)} alt="" className="h-full w-full object-cover" /> : Icon ? <Icon size={22} /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <a href={`${base}/${it.id}`} className="block truncate text-sm font-bold text-slate-900 hover:underline">{it.title[lang] || it.title.en || it.title.ar}</a>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  <span dir="ltr">/{kind}s/{it.slug}</span>
                  {kind === "project" ? <Badge>{catLabel((it as ProjectData).category)}</Badge> : null}
                  {kind === "project" && (it as ProjectData).year ? <span>· {(it as ProjectData).year}</span> : null}
                </div>
              </div>
              <button className={`a-btn a-btn-ghost a-btn-sm ${it.featured ? "!text-amber-500" : "!text-slate-400"}`} title={t({ en: "Featured", ar: "مميز" })} onClick={() => toggle(it, "featured")}><Star size={15} fill={it.featured ? "currentColor" : "none"} /></button>
              <button className={`a-btn a-btn-ghost a-btn-sm ${it.published ? "" : "!text-slate-400"}`} title={it.published ? t({ en: "Published", ar: "منشور" }) : t({ en: "Hidden", ar: "مخفي" })} onClick={() => toggle(it, "published")}>{it.published ? <Eye size={15} /> : <EyeOff size={15} />}</button>
              <a href={`${base}/${it.id}`} className="a-btn a-btn-secondary a-btn-sm"><Pencil size={14} /> {t({ en: "Edit", ar: "تعديل" })}</a>
              <Button size="sm" variant="ghost" className="!text-rose-600" onClick={() => remove(it)}><Trash2 size={14} /></Button>
            </div>
          );
        }}
      />
      {!list.length ? <p className="py-10 text-center text-sm text-slate-500">{t({ en: "Nothing here yet.", ar: "لا يوجد شيء بعد." })}</p> : null}
      {dialog}
    </>
  );
}
