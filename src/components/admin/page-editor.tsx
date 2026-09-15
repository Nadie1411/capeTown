"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Block, BlockType, PageData, ProjectData, ServiceData, SiteSettings } from "@/lib/types";
import { BLOCKS, BLOCK_CATEGORIES, BLOCK_ORDER, STYLE_FIELDS, createBlock } from "@/blocks/registry";
import { ICONS } from "@/lib/icons";
import { cn, uid, slugify } from "@/lib/utils";
import { localePath } from "@/lib/i18n";
import { Button, Input, Modal, Switch, Tabs, api, useConfirm, useToast } from "./ui";
import { SchemaForm } from "./schema-form";
import { LTextField } from "./fields";
import { MediaField } from "./media-library";
import { SortableList, DragHandle } from "./sortable";
import { useT, useAdminLang } from "./i18n";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Copy, Eye, EyeOff, ExternalLink, Monitor, Plus, Save, Settings2, Smartphone, Tablet, Trash2, X, LayoutList, Paintbrush, FileText } from "lucide-react";

interface Ctx {
  services: ServiceData[];
  projects: ProjectData[];
  pages: PageData[];
  settings: SiteSettings;
}

import { ensureIds } from "./ids";

export function PageEditor({ initialPage, ctx }: { initialPage: PageData; ctx: Ctx }) {
  const t = useT();
  const adminLang = useAdminLang();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [init] = useState<PageData>(() => ({ ...initialPage, blocks: ensureIds(initialPage.blocks) }));
  const [page, setPage] = useState<PageData>(init);
  const [saved, setSaved] = useState(() => JSON.stringify(init));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"content" | "style">("content");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [locale, setLocale] = useState<"en" | "ar">(adminLang === "ar" ? "ar" : "en");
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showChrome, setShowChrome] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const dirty = JSON.stringify(page) !== saved;
  const selected = page.blocks.find((b) => b.id === selectedId) || null;

  /* ---------- preview messaging ---------- */
  const send = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win || !readyRef.current) return;
    win.postMessage({ type: "cape:preview", blocks: page.blocks, settings: ctx.settings, locale, selectedId, showChrome, pageTitle: page.title }, "*");
  }, [page.blocks, page.title, ctx.settings, locale, selectedId, showChrome]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "cape:ready") {
        readyRef.current = true;
        send();
      }
      if (e.data?.type === "cape:select" && e.data.id) {
        setSelectedId(e.data.id);
        setTab("content");
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [send]);

  useEffect(() => {
    const id = setTimeout(send, 120);
    return () => clearTimeout(id);
  }, [send]);

  useEffect(() => {
    if (!selectedId) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "cape:scrollTo", id: selectedId }, "*");
  }, [selectedId]);

  /* ---------- save ---------- */
  const save = useCallback(async () => {
    setSaving(true);
    try {
      const d = await api<{ page: PageData }>(`/api/admin/pages/${page.id}`, { method: "PUT", json: { title: page.title, slug: page.slug, published: page.published, blocks: page.blocks, seo: page.seo } });
      const next = { ...page, slug: d.page.slug };
      setPage(next);
      setSaved(JSON.stringify(next));
      toast(t({ en: "Page saved", ar: "تم حفظ الصفحة" }));
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  }, [page, toast, t]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty) save();
      }
    };
    window.addEventListener("keydown", onKey);
    const onUnload = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); } };
    window.addEventListener("beforeunload", onUnload);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("beforeunload", onUnload); };
  }, [dirty, save]);

  /* ---------- block operations ---------- */
  const updateBlock = (id: string, patch: Partial<Block>) => setPage((p) => ({ ...p, blocks: p.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  const removeBlock = async (id: string) => {
    if (!(await confirm(t({ en: "Delete this block?", ar: "حذف هذا القسم؟" })))) return;
    setPage((p) => ({ ...p, blocks: p.blocks.filter((b) => b.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  };
  const duplicateBlock = (id: string) => {
    setPage((p) => {
      const i = p.blocks.findIndex((b) => b.id === id);
      const copy = { ...structuredClone(p.blocks[i]), id: uid("b") };
      const blocks = [...p.blocks];
      blocks.splice(i + 1, 0, copy);
      return { ...p, blocks };
    });
  };
  const move = (id: string, dir: -1 | 1) => {
    setPage((p) => {
      const i = p.blocks.findIndex((b) => b.id === id);
      const j = i + dir;
      if (j < 0 || j >= p.blocks.length) return p;
      const blocks = [...p.blocks];
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      return { ...p, blocks };
    });
  };
  const addBlock = (type: BlockType) => {
    const nb = ensureIds([createBlock(type)])[0];
    setPage((p) => {
      const i = selectedId ? p.blocks.findIndex((b) => b.id === selectedId) : -1;
      const blocks = [...p.blocks];
      blocks.splice(i >= 0 ? i + 1 : blocks.length, 0, nb);
      return { ...p, blocks };
    });
    setSelectedId(nb.id);
    setTab("content");
    setAddOpen(false);
  };

  const formCtx = useMemo(() => ({ services: ctx.services, projects: ctx.projects, pages: ctx.pages, categories: ctx.settings.projectCategories, settings: ctx.settings }), [ctx]);
  const widths = { desktop: "100%", tablet: "820px", mobile: "390px" };
  const pageUrl = localePath(locale, page.isHome ? "/" : `/${page.slug}`);
  const blockName = (b: Block) => b.label || t(BLOCKS[b.type].name);

  return (
    <div className="flex h-[calc(100vh)] flex-col lg:h-screen">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <a href="/admin" className="flex items-center" title="Admin">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/mark.svg" alt="" className="h-8 w-8" /></a>
        <a href="/admin/pages" className="a-btn a-btn-ghost a-btn-sm"><ArrowLeft size={15} className="rtl:hidden" /><ArrowRight size={15} className="ltr:hidden" /> {t({ en: "Pages", ar: "الصفحات" })}</a>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-slate-900">{page.title[adminLang] || page.title.en || page.title.ar}</div>
          <div className="text-[11px] text-slate-500" dir="ltr">/{page.isHome ? "" : page.slug}{!page.published ? ` · ${t({ en: "draft", ar: "مسودة" })}` : ""}</div>
        </div>
        <div className="mx-auto flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
          {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([d, I]) => (
            <button key={d} className={cn("rounded-md p-1.5", device === d ? "bg-white text-[#233283] shadow-sm" : "text-slate-500")} onClick={() => setDevice(d)} title={d}><I size={16} /></button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
          {(["en", "ar"] as const).map((l) => (
            <button key={l} className={cn("rounded-md px-2 py-1 text-xs font-bold", locale === l ? "bg-white text-[#233283] shadow-sm" : "text-slate-500")} onClick={() => setLocale(l)}>{l.toUpperCase()}</button>
          ))}
        </div>
        <button className={cn("a-btn a-btn-ghost a-btn-sm", !showChrome && "text-slate-400")} onClick={() => setShowChrome((s) => !s)} title={t({ en: "Header & footer", ar: "الرأس والتذييل" })}>{showChrome ? <Eye size={15} /> : <EyeOff size={15} />}</button>
        <a href={pageUrl} target="_blank" className="a-btn a-btn-ghost a-btn-sm" title={t({ en: "Open page", ar: "فتح الصفحة" })}><ExternalLink size={15} /></a>
        <Button variant="primary" size="sm" onClick={save} loading={saving} disabled={!dirty}><Save size={15} /> {dirty ? t({ en: "Save changes", ar: "حفظ التغييرات" }) : t({ en: "Saved", ar: "محفوظ" })}</Button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* block list */}
        <aside className="a-scroll flex w-72 flex-none flex-col overflow-y-auto border-e border-slate-200 bg-white">
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{t({ en: "Sections", ar: "الأقسام" })}</span>
            <button className={cn("a-btn a-btn-ghost a-btn-sm", !selectedId && "text-[#233283]")} onClick={() => setSelectedId(null)} title={t({ en: "Page settings", ar: "إعدادات الصفحة" })}><Settings2 size={15} /></button>
          </div>
          <div className="px-2">
            <SortableList
              items={page.blocks}
              onReorder={(blocks) => setPage((p) => ({ ...p, blocks }))}
              className="grid gap-1"
              render={(b, handle) => {
                const I = ICONS[BLOCKS[b.type].icon];
                const active = b.id === selectedId;
                return (
                  <div className={cn("group flex items-center gap-1 rounded-lg border px-1 py-1", active ? "border-[#233283] bg-blue-50" : "border-transparent hover:bg-slate-50", !b.enabled && "opacity-50")}>
                    <DragHandle handle={handle} />
                    <button className="flex min-w-0 flex-1 items-center gap-2 text-start" onClick={() => { setSelectedId(b.id); setTab("content"); }}>
                      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-slate-100 text-slate-600">{I ? <I size={15} /> : null}</span>
                      <span className="truncate text-[13px] font-semibold text-slate-800">{blockName(b)}</span>
                    </button>
                    <button className="rounded p-1 text-slate-400 hover:text-slate-700" title={b.enabled ? t({ en: "Hide", ar: "إخفاء" }) : t({ en: "Show", ar: "إظهار" })} onClick={() => updateBlock(b.id, { enabled: !b.enabled })}>{b.enabled ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                  </div>
                );
              }}
            />
          </div>
          <div className="p-2">
            <Button className="w-full" onClick={() => setAddOpen(true)}><Plus size={15} /> {t({ en: "Add section", ar: "إضافة قسم" })}</Button>
          </div>
        </aside>

        {/* preview */}
        <div className="a-scroll relative min-w-0 flex-1 overflow-auto bg-slate-200/70 p-4">
          <div className="mx-auto h-full overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5 transition-[width]" style={{ width: widths[device], maxWidth: "100%" }}>
            <iframe ref={iframeRef} src="/preview" title="preview" className="h-full w-full" />
          </div>
        </div>

        {/* inspector */}
        <aside className="a-scroll flex w-[400px] flex-none flex-col overflow-y-auto border-s border-slate-200 bg-white">
          {selected ? (
            <>
              <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-4 pt-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#233283]/10 text-[#233283]">{(() => { const I = ICONS[BLOCKS[selected.type].icon]; return I ? <I size={16} /> : null; })()}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{t(BLOCKS[selected.type].name)}</div>
                    <div className="truncate text-[11px] text-slate-500">{t(BLOCKS[selected.type].description)}</div>
                  </div>
                  <button className="a-btn a-btn-ghost a-btn-icon" onClick={() => setSelectedId(null)}><X size={16} /></button>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => move(selected.id, -1)} title={t({ en: "Move up", ar: "تحريك للأعلى" })}><ChevronUp size={14} /></Button>
                  <Button size="sm" variant="ghost" onClick={() => move(selected.id, 1)} title={t({ en: "Move down", ar: "تحريك للأسفل" })}><ChevronDown size={14} /></Button>
                  <Button size="sm" variant="ghost" onClick={() => duplicateBlock(selected.id)} title={t({ en: "Duplicate", ar: "تكرار" })}><Copy size={14} /></Button>
                  <Button size="sm" variant="ghost" className="!text-rose-600" onClick={() => removeBlock(selected.id)} title={t({ en: "Delete", ar: "حذف" })}><Trash2 size={14} /></Button>
                  <div className="ms-auto"><Switch checked={selected.enabled} onChange={(v) => updateBlock(selected.id, { enabled: v })} label={t({ en: "Visible", ar: "ظاهر" })} /></div>
                </div>
                <Tabs className="my-2" tabs={[{ value: "content", label: t({ en: "Content", ar: "المحتوى" }), icon: <LayoutList size={14} /> }, { value: "style", label: t({ en: "Design", ar: "التصميم" }), icon: <Paintbrush size={14} /> }]} value={tab} onChange={setTab} />
              </div>
              <div className="p-4">
                {tab === "content" ? (
                  <>
                    <div className="mb-4">
                      <label className="a-label">{t({ en: "Section name (admin only)", ar: "اسم القسم (للإدارة فقط)" })}</label>
                      <Input value={selected.label} placeholder={t(BLOCKS[selected.type].name)} onChange={(e) => updateBlock(selected.id, { label: e.target.value })} />
                    </div>
                    <SchemaForm key={selected.id} fields={BLOCKS[selected.type].fields} value={selected.content} onChange={(content) => updateBlock(selected.id, { content })} ctx={{ ...formCtx, instanceKey: selected.id }} />
                  </>
                ) : (
                  <SchemaForm key={selected.id + "-style"} fields={STYLE_FIELDS} value={selected.style} onChange={(style) => updateBlock(selected.id, { style })} ctx={{ ...formCtx, instanceKey: selected.id + "-style" }} />
                )}
              </div>
            </>
          ) : (
            <div className="p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold"><FileText size={16} /> {t({ en: "Page settings", ar: "إعدادات الصفحة" })}</div>
              <div className="grid gap-4">
                <LTextField label={t({ en: "Page title", ar: "عنوان الصفحة" })} value={page.title} onChange={(title) => setPage((p) => ({ ...p, title }))} />
                {!page.isHome ? (
                  <div>
                    <label className="a-label">{t({ en: "URL slug", ar: "رابط الصفحة" })}</label>
                    <div className="flex items-center gap-1" dir="ltr">
                      <span className="text-sm text-slate-400">/</span>
                      <Input value={page.slug} onChange={(e) => setPage((p) => ({ ...p, slug: slugify(e.target.value) || e.target.value }))} />
                    </div>
                  </div>
                ) : null}
                <div className="rounded-xl border border-slate-200 px-3 py-1.5"><Switch checked={page.published} onChange={(published) => setPage((p) => ({ ...p, published }))} label={t({ en: "Published", ar: "منشورة" })} description={t({ en: "Unpublished pages are hidden from visitors", ar: "الصفحات غير المنشورة مخفية عن الزوار" })} /></div>
                <fieldset className="rounded-xl border border-slate-200 p-3">
                  <legend className="px-1 text-xs font-bold text-slate-600">SEO</legend>
                  <div className="grid gap-3">
                    <LTextField label={t({ en: "Meta title", ar: "عنوان محركات البحث" })} value={page.seo.title} onChange={(title) => setPage((p) => ({ ...p, seo: { ...p.seo, title } }))} />
                    <LTextField label={t({ en: "Meta description", ar: "وصف محركات البحث" })} value={page.seo.description} onChange={(description) => setPage((p) => ({ ...p, seo: { ...p.seo, description } }))} multiline rows={2} />
                    <MediaField label={t({ en: "Share image (Open Graph)", ar: "صورة المشاركة" })} value={page.seo.ogImageUrl} onChange={(ogImageUrl) => setPage((p) => ({ ...p, seo: { ...p.seo, ogImageUrl } }))} accept="image" compact />
                    <Switch checked={page.seo.noIndex} onChange={(noIndex) => setPage((p) => ({ ...p, seo: { ...p.seo, noIndex } }))} label={t({ en: "Hide from search engines", ar: "إخفاء عن محركات البحث" })} />
                  </div>
                </fieldset>
                <p className="text-xs text-slate-500">{t({ en: "Tip: click any section in the preview to edit it.", ar: "نصيحة: اضغط على أي قسم في المعاينة لتعديله." })}</p>
              </div>
            </div>
          )}
        </aside>
      </div>

      <AddBlockModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={addBlock} />
      {dialog}
    </div>
  );
}

function AddBlockModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (type: BlockType) => void }) {
  const t = useT();
  const [cat, setCat] = useState<string>("all");
  const list = BLOCK_ORDER.filter((k) => cat === "all" || BLOCKS[k].category === cat);
  return (
    <Modal open={open} onClose={onClose} title={t({ en: "Add a section", ar: "إضافة قسم" })} size="lg">
      <div className="mb-4 flex flex-wrap gap-1">
        {[{ key: "all", label: { en: "All", ar: "الكل" } }, ...BLOCK_CATEGORIES].map((c) => (
          <button key={c.key} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", cat === c.key ? "border-[#233283] bg-[#233283] text-white" : "border-slate-200 text-slate-600 hover:border-slate-400")} onClick={() => setCat(c.key)}>{t(c.label)}</button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((k) => {
          const d = BLOCKS[k];
          const I = ICONS[d.icon];
          return (
            <button key={k} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-start transition hover:border-[#233283] hover:bg-blue-50" onClick={() => onAdd(k)}>
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-[#233283]/10 text-[#233283]">{I ? <I size={18} /> : null}</span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-slate-800">{t(d.name)}</span>
                <span className="block text-xs leading-snug text-slate-500">{t(d.description)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
