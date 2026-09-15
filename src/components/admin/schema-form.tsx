"use client";
import { useEffect, useState } from "react";
import type { Field } from "@/blocks/schema";
import type { LText, PageData, ProjectCategory, ProjectData, ServiceData, SiteSettings } from "@/lib/types";
import { cn, uid } from "@/lib/utils";
import { Button, Input, Select, Switch, Textarea } from "./ui";
import { ColorField, IconField, LTextField, LinkField } from "./fields";
import { MediaField } from "./media-library";
import { LRichTextField, RichTextEditor } from "./rich-text";
import { SortableList, DragHandle } from "./sortable";
import { useT, useAdminLang } from "./i18n";
import { ChevronDown, Copy, Plus, Trash2 } from "lucide-react";

export interface FormCtx {
  services: ServiceData[];
  projects: ProjectData[];
  pages: PageData[];
  categories: ProjectCategory[];
  settings?: SiteSettings;
  instanceKey?: string;
}

export function SchemaForm({ fields, value, onChange, ctx, className }: { fields: Field[]; value: any; onChange: (v: any) => void; ctx: FormCtx; className?: string }) {
  const v = value || {};
  const set = (key: string, val: any) => {
    if (key === "_") return onChange(val);
    onChange({ ...v, [key]: val });
  };
  return (
    <div className={cn("grid grid-cols-2 gap-x-3 gap-y-4", className)}>
      {fields.map((f, i) => {
        if (f.showIf && !f.showIf(v)) return null;
        const val = f.key === "_" ? v : v[f.key];
        return (
          <div key={`${f.key}-${i}`} className={f.width === "half" ? "col-span-1" : "col-span-2"}>
            <FieldControl field={f} value={val} onChange={(nv) => set(f.key, nv)} ctx={ctx} />
          </div>
        );
      })}
    </div>
  );
}

function FieldControl({ field, value, onChange, ctx }: { field: Field; value: any; onChange: (v: any) => void; ctx: FormCtx }) {
  const t = useT();
  const lang = useAdminLang();
  const label = t(field.label);
  const help = field.help ? t(field.help) : undefined;
  const wrap = (node: React.ReactNode) => (
    <div>
      {label && !["ltext", "ltextarea", "lrichtext", "media", "color", "icon", "boolean", "list", "group", "link"].includes(field.type) ? <label className="a-label">{label}</label> : null}
      {node}
      {help ? <p className="mt-1 text-xs text-slate-500">{help}</p> : null}
    </div>
  );
  switch (field.type) {
    case "text":
    case "url":
      return wrap(<Input value={value ?? ""} placeholder={field.placeholder} dir={field.type === "url" ? "ltr" : undefined} onChange={(e) => onChange(e.target.value)} />);
    case "textarea":
      return wrap(<Textarea value={value ?? ""} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />);
    case "code":
      return wrap(<Textarea value={value ?? ""} rows={8} dir="ltr" className="font-mono text-xs" onChange={(e) => onChange(e.target.value)} />);
    case "number":
      return wrap(<Input type="number" value={value ?? ""} min={field.min} max={field.max} step={field.step} dir="ltr" onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />);
    case "color":
      return <><ColorField label={label} value={value ?? ""} onChange={onChange} />{help ? <p className="mt-1 text-xs text-slate-500">{help}</p> : null}</>;
    case "boolean":
      return <div className="rounded-xl border border-slate-200 px-3 py-1.5"><Switch checked={!!value} onChange={onChange} label={label} description={help} /></div>;
    case "select":
      return wrap(<Select value={value ?? field.options[0]?.value} options={field.options.map((o) => ({ value: o.value, label: t(o.label) }))} onChange={(e) => onChange(e.target.value)} />);
    case "icon":
      return <IconField label={label} value={value ?? ""} onChange={onChange} />;
    case "media":
      return <MediaField label={label} value={value ?? ""} onChange={onChange} accept={field.accept} />;
    case "ltext":
      return <LTextField label={label} value={value} onChange={onChange} />;
    case "ltextarea":
      return <LTextField label={label} value={value} onChange={onChange} multiline />;
    case "richtext":
      return wrap(<RichTextEditor value={value ?? ""} onChange={onChange} dir={lang === "ar" ? "rtl" : "ltr"} />);
    case "lrichtext":
      return <LRichTextField label={label} value={value} onChange={onChange} instanceKey={`${ctx.instanceKey || ""}:${field.key}`} />;
    case "link":
      return <LinkField value={value} onChange={onChange} pages={ctx.pages} />;
    case "group":
      return (
        <fieldset className="rounded-xl border border-slate-200 p-3">
          <legend className="px-1 text-xs font-bold text-slate-600">{label}</legend>
          <SchemaForm fields={field.fields} value={value || {}} onChange={onChange} ctx={ctx} />
        </fieldset>
      );
    case "list":
      return <ListField field={field} value={Array.isArray(value) ? value : []} onChange={onChange} ctx={ctx} />;
    case "services":
      return <PickList label={label} options={ctx.services.map((s) => ({ id: s.id, label: s.title[lang] || s.title.en || s.title.ar }))} value={value || []} onChange={onChange} />;
    case "projects":
      return <PickList label={label} options={ctx.projects.map((p) => ({ id: p.id, label: p.title[lang] || p.title.en || p.title.ar }))} value={value || []} onChange={onChange} />;
    case "category":
      return wrap(<Select value={value ?? ""} options={[{ value: "", label: "—" }, ...ctx.categories.map((c) => ({ value: c.key, label: t(c.label) }))]} onChange={(e) => onChange(e.target.value)} />);
    default:
      return null;
  }
}

function PickList({ label, options, value, onChange }: { label: string; options: { id: string; label: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <div>
      <label className="a-label">{label}</label>
      <div className="grid max-h-56 gap-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
        {options.map((o) => (
          <label key={o.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
            <input type="checkbox" checked={value.includes(o.id)} onChange={() => toggle(o.id)} /> {o.label}
          </label>
        ))}
        {!options.length ? <p className="p-2 text-xs text-slate-500">—</p> : null}
      </div>
    </div>
  );
}

/* ------------------------------ list of items ------------------------------ */

function itemTitle(field: Extract<Field, { type: "list" }>, item: any, index: number, lang: "ar" | "en") {
  if (field.itemTitle) return field.itemTitle(item, index);
  if (!item || typeof item !== "object") return `#${index + 1}`;
  if (item.label && typeof item.label === "object") return item.label[lang] || item.label.en || item.label.ar || `#${index + 1}`;
  for (const k of ["title", "name", "text", "q", "label", "caption"]) {
    const v = item[k];
    if (v && typeof v === "object") return v[lang] || v.en || v.ar || `#${index + 1}`;
    if (typeof v === "string" && v) return v;
  }
  if (typeof item.value !== "undefined") return `${item.value}${item.suffix || ""}`;
  return `#${index + 1}`;
}

function ListField({ field, value, onChange, ctx }: { field: Extract<Field, { type: "list" }>; value: any[]; onChange: (v: any[]) => void; ctx: FormCtx }) {
  const t = useT();
  const lang = useAdminLang();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  // give every item a stable id for drag & drop (kept in the saved data — harmless)
  const items = value.map((it) => (it && typeof it === "object" && it._id ? it : { ...(typeof it === "object" ? it : { value: it }), _id: uid("i") }));
  const needsIds = items.some((it, i) => it !== value[i]);
  useEffect(() => {
    if (needsIds) onChange(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsIds]);

  const update = (idx: number, v: any) => onChange(items.map((it, i) => (i === idx ? { ...v, _id: it._id } : it)));
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const duplicate = (idx: number) => onChange([...items.slice(0, idx + 1), { ...structuredClone(items[idx]), _id: uid("i") }, ...items.slice(idx + 1)]);
  const add = () => {
    const nv = { ...(field.newItem ? field.newItem() : {}), _id: uid("i") };
    onChange([...items, nv]);
    setOpen((o) => ({ ...o, [nv._id]: true }));
  };
  const isSingleLink = field.itemFields.length === 1 && field.itemFields[0].type === "link";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="a-label !mb-0">{t(field.label)} <span className="text-slate-400">({items.length})</span></label>
        <Button size="sm" onClick={add} disabled={!!field.max && items.length >= field.max}><Plus size={14} /> {field.addLabel ? t(field.addLabel) : t({ en: "Add", ar: "إضافة" })}</Button>
      </div>
      <SortableList
        items={items.map((it) => ({ ...it, id: it._id }))}
        onReorder={(list) => onChange(list.map(({ id, ...rest }) => rest))}
        className="grid gap-2"
        render={(item, handle, index) => {
          const isOpen = open[item.id] ?? false;
          const { id, ...data } = item;
          return (
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-1 px-2 py-1.5">
                <DragHandle handle={handle} />
                <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-start text-sm font-semibold text-slate-700" onClick={() => setOpen((o) => ({ ...o, [item.id]: !isOpen }))}>
                  <span className="truncate">{itemTitle(field, data, index, lang)}</span>
                  <ChevronDown size={14} className={cn("ms-auto flex-none text-slate-400 transition", isOpen && "rotate-180")} />
                </button>
                <button type="button" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={() => duplicate(index)} title={t({ en: "Duplicate", ar: "تكرار" })}><Copy size={14} /></button>
                <button type="button" className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => remove(index)} title={t({ en: "Remove", ar: "حذف" })}><Trash2 size={14} /></button>
              </div>
              {isOpen ? (
                <div className="border-t border-slate-100 p-3">
                  {isSingleLink ? <LinkField value={data as any} onChange={(v) => update(index, v)} pages={ctx.pages} /> : <SchemaForm fields={field.itemFields} value={data} onChange={(v) => update(index, v)} ctx={{ ...ctx, instanceKey: `${ctx.instanceKey || ""}:${item.id}` }} />}
                </div>
              ) : null}
            </div>
          );
        }}
      />
      {!items.length ? <p className="rounded-xl border border-dashed border-slate-300 p-3 text-center text-xs text-slate-500">{t({ en: "No items yet", ar: "لا توجد عناصر بعد" })}</p> : null}
    </div>
  );
}
