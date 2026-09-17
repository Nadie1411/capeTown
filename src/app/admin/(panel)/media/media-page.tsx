"use client";
import { useState } from "react";
import type { MediaData } from "@/lib/types";
import { formatBytes, formatDate } from "@/lib/utils";
import { Button, Card, Input, Modal, PageHeader, Tabs, api, useConfirm, useToast } from "@/components/admin/ui";
import { MediaGrid, UploadButton, useMedia } from "@/components/admin/media-library";
import { LTextField } from "@/components/admin/fields";
import { useT, useAdminLang } from "@/components/admin/i18n";
import { asset } from "@/lib/base";
import { Search, Copy, Trash2 } from "lucide-react";

export function MediaPage() {
  const t = useT();
  const lang = useAdminLang();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [kind, setKind] = useState<"any" | "image" | "video">("any");
  const { items, setItems, loading, q, setQ } = useMedia(kind);
  const [active, setActive] = useState<MediaData | null>(null);
  const [drag, setDrag] = useState(false);

  const remove = async (m: MediaData) => {
    if (!(await confirm(t({ en: `Delete "${m.filename}"? Pages using it will show a broken image.`, ar: `حذف "${m.filename}"؟ الصفحات التي تستخدمه ستظهر صورة مكسورة.` })))) return;
    await api(`/api/admin/media/${m.id}`, { method: "DELETE" });
    setItems((s) => s.filter((x) => x.id !== m.id));
    setActive(null);
    toast(t({ en: "Deleted", ar: "تم الحذف" }));
  };
  const saveAlt = async () => {
    if (!active) return;
    await api(`/api/admin/media/${active.id}`, { method: "PUT", json: { alt: active.alt } });
    setItems((s) => s.map((x) => (x.id === active.id ? active : x)));
    toast(t({ en: "Saved", ar: "تم الحفظ" }));
  };
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const fd = new FormData();
    Array.from(e.dataTransfer.files).forEach((f) => fd.append("files", f));
    if (!e.dataTransfer.files.length) return;
    try {
      const d = await api<{ media: MediaData[] }>("/api/admin/media", { method: "POST", body: fd });
      setItems((s) => [...d.media, ...s]);
      toast(t({ en: "Uploaded", ar: "تم الرفع" }));
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  return (
    <>
      <PageHeader title={t({ en: "Media library", ar: "مكتبة الوسائط" })} description={t({ en: "Images and videos used across the site. Large images are optimised automatically.", ar: "الصور والفيديوهات المستخدمة في الموقع. تُحسَّن الصور الكبيرة تلقائياً." })} actions={<UploadButton onUploaded={(m) => setItems((s) => [...m, ...s])} />} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Tabs tabs={[{ value: "any", label: t({ en: "All", ar: "الكل" }) }, { value: "image", label: t({ en: "Images", ar: "الصور" }) }, { value: "video", label: t({ en: "Videos", ar: "الفيديو" }) }]} value={kind} onChange={setKind} />
        <div className="relative ms-auto w-64">
          <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder={t({ en: "Search…", ar: "بحث…" })} value={q} onChange={(e) => setQ(e.target.value)} className="!ps-9" />
        </div>
      </div>
      <div className={`rounded-2xl border-2 border-dashed p-3 transition ${drag ? "border-[#233283] bg-blue-50" : "border-transparent"}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}>
        <MediaGrid items={items} loading={loading} onSelect={setActive} onDelete={remove} />
      </div>
      <Modal open={!!active} onClose={() => setActive(null)} title={active?.filename} size="lg" footer={active ? <><Button variant="danger" onClick={() => remove(active)}><Trash2 size={14} /> {t({ en: "Delete", ar: "حذف" })}</Button><Button variant="primary" onClick={saveAlt}>{t({ en: "Save", ar: "حفظ" })}</Button></> : null}>
        {active ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex items-center justify-center overflow-hidden rounded-xl bg-slate-100">
              {active.kind === "video" ? <video src={asset(active.url)} controls className="max-h-80 w-full" /> : // eslint-disable-next-line @next/next/no-img-element
              <img src={asset(active.url)} alt="" className="max-h-80 w-full object-contain" />}
            </div>
            <div className="grid content-start gap-3 text-sm">
              <div>
                <label className="a-label">URL</label>
                <div className="flex gap-1"><Input readOnly value={typeof window !== "undefined" ? window.location.origin + asset(active.url) : asset(active.url)} dir="ltr" /><Button size="icon" onClick={() => { navigator.clipboard?.writeText(window.location.origin + asset(active.url)); toast(t({ en: "Copied", ar: "تم النسخ" }), "info"); }}><Copy size={14} /></Button></div>
              </div>
              <dl className="grid grid-cols-2 gap-1 text-xs text-slate-600">
                <dt>{t({ en: "Type", ar: "النوع" })}</dt><dd dir="ltr">{active.mime}</dd>
                <dt>{t({ en: "Size", ar: "الحجم" })}</dt><dd dir="ltr">{formatBytes(active.size)}</dd>
                {active.width ? <><dt>{t({ en: "Dimensions", ar: "الأبعاد" })}</dt><dd dir="ltr">{active.width} × {active.height}</dd></> : null}
                <dt>{t({ en: "Uploaded", ar: "تاريخ الرفع" })}</dt><dd>{formatDate(active.createdAt, lang)}</dd>
              </dl>
              <LTextField label={t({ en: "Alt text (accessibility & SEO)", ar: "النص البديل (للوصول ومحركات البحث)" })} value={active.alt} onChange={(alt) => setActive({ ...active, alt })} />
            </div>
          </div>
        ) : null}
      </Modal>
      {dialog}
    </>
  );
}
