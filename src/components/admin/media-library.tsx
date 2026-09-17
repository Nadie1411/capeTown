"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaData } from "@/lib/types";
import { cn, formatBytes, isVideoUrl } from "@/lib/utils";
import { Button, Input, Modal, Tabs, api, useToast, useConfirm } from "./ui";
import { useT } from "./i18n";
import { asset, withBase } from "@/lib/base";
import { Upload, Trash2, Search, Link2, Film, ImageIcon, Copy, LoaderCircle } from "lucide-react";

export function useMedia(kind: "image" | "video" | "any" = "any") {
  const [items, setItems] = useState<MediaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api<{ media: MediaData[] }>(`/api/admin/media?kind=${kind}&q=${encodeURIComponent(q)}`);
      setItems(d.media);
    } finally {
      setLoading(false);
    }
  }, [kind, q]);
  useEffect(() => {
    load();
  }, [load]);
  return { items, setItems, loading, q, setQ, reload: load };
}

export function UploadButton({ onUploaded, accept, className, label }: { onUploaded: (m: MediaData[]) => void; accept?: string; className?: string; label?: string }) {
  const t = useT();
  const toast = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const d = await api<{ media: MediaData[] }>("/api/admin/media", { method: "POST", body: fd });
      onUploaded(d.media);
      toast(t({ en: `${d.media.length} file(s) uploaded`, ar: `تم رفع ${d.media.length} ملف` }));
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };
  return (
    <>
      <input ref={ref} type="file" multiple hidden accept={accept || "image/*,video/mp4,video/webm,video/quicktime,application/pdf"} onChange={(e) => upload(e.target.files)} />
      <Button variant="primary" className={className} loading={busy} onClick={() => ref.current?.click()}>
        <Upload size={16} /> {label || t({ en: "Upload", ar: "رفع ملفات" })}
      </Button>
    </>
  );
}

export function MediaGrid({ items, selected, onSelect, onDelete, loading, compact }: { items: MediaData[]; selected?: string; onSelect?: (m: MediaData) => void; onDelete?: (m: MediaData) => void; loading?: boolean; compact?: boolean }) {
  const t = useT();
  if (loading) return <div className="flex justify-center py-16 text-slate-400"><LoaderCircle className="animate-spin" /></div>;
  if (!items.length) return <p className="py-16 text-center text-sm text-slate-500">{t({ en: "No files yet. Upload images or videos.", ar: "لا توجد ملفات بعد. ارفع صوراً أو فيديوهات." })}</p>;
  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6")}>
      {items.map((m) => (
        <div key={m.id} className={cn("group relative overflow-hidden rounded-xl border bg-slate-50", selected === m.url ? "border-[#233283] ring-2 ring-[#233283]/30" : "border-slate-200")}>
          <button type="button" className="block aspect-square w-full" onClick={() => onSelect?.(m)} title={m.filename}>
            {m.kind === "video" ? (
              <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-500"><Film size={28} /><span className="px-2 text-[10px] leading-tight line-clamp-2">{m.filename}</span></div>
            ) : m.kind === "file" ? (
              <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-500"><span className="text-xs font-bold">PDF</span><span className="px-2 text-[10px] line-clamp-2">{m.filename}</span></div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset(m.thumbUrl || m.url)} alt={m.filename} className="h-full w-full object-cover" loading="lazy" />
            )}
          </button>
          {onDelete ? (
            <button type="button" className="absolute end-1.5 top-1.5 rounded-md bg-white/90 p-1 text-rose-600 opacity-0 shadow transition group-hover:opacity-100" onClick={() => onDelete(m)} aria-label="Delete"><Trash2 size={14} /></button>
          ) : null}
          {!compact ? <div className="truncate px-2 py-1 text-[11px] text-slate-500">{m.filename} · {formatBytes(m.size)}</div> : null}
        </div>
      ))}
    </div>
  );
}

export function MediaLibraryModal({ open, onClose, onSelect, accept = "any" }: { open: boolean; onClose: () => void; onSelect: (url: string) => void; accept?: "image" | "video" | "any" }) {
  const t = useT();
  const { items, setItems, loading, q, setQ } = useMedia(accept);
  const [tab, setTab] = useState<"library" | "url">("library");
  const [url, setUrl] = useState("");
  const [drag, setDrag] = useState(false);
  const toast = useToast();
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const files = e.dataTransfer.files;
    if (!files.length) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    try {
      const d = await api<{ media: MediaData[] }>("/api/admin/media", { method: "POST", body: fd });
      setItems((s) => [...d.media, ...s]);
    } catch (err: any) {
      toast(err.message, "error");
    }
  };
  const acceptAttr = accept === "image" ? "image/*" : accept === "video" ? "video/mp4,video/webm,video/quicktime" : undefined;
  return (
    <Modal open={open} onClose={onClose} title={t({ en: "Media library", ar: "مكتبة الوسائط" })} size="xl">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Tabs tabs={[{ value: "library", label: t({ en: "Library", ar: "المكتبة" }), icon: <ImageIcon size={14} /> }, { value: "url", label: t({ en: "From URL", ar: "من رابط" }), icon: <Link2 size={14} /> }]} value={tab} onChange={setTab} />
        {tab === "library" ? (
          <>
            <div className="relative ms-auto min-w-52 flex-1 sm:flex-none">
              <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder={t({ en: "Search files…", ar: "بحث…" })} value={q} onChange={(e) => setQ(e.target.value)} className="!ps-9" />
            </div>
            <UploadButton accept={acceptAttr} onUploaded={(m) => setItems((s) => [...m, ...s])} />
          </>
        ) : null}
      </div>
      {tab === "library" ? (
        <div className={cn("min-h-64 rounded-xl border-2 border-dashed p-2 transition", drag ? "border-[#233283] bg-blue-50" : "border-transparent")} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}>
          <MediaGrid items={items} loading={loading} compact onSelect={(m) => { onSelect(m.url); onClose(); }} />
          <p className="mt-3 text-center text-xs text-slate-400">{t({ en: "Tip: drag & drop files here to upload", ar: "نصيحة: اسحب الملفات وأفلتها هنا للرفع" })}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          <Input placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} dir="ltr" />
          <Button variant="primary" disabled={!url} onClick={() => { onSelect(url.trim()); onClose(); }}>{t({ en: "Use this URL", ar: "استخدام الرابط" })}</Button>
        </div>
      )}
    </Modal>
  );
}

/** Field: a single media URL with preview, choose/remove buttons */
export function MediaField({ value, onChange, accept = "any", label, compact }: { value: string; onChange: (url: string) => void; accept?: "image" | "video" | "any"; label?: string; compact?: boolean }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const toast = useToast();
  return (
    <div>
      {label ? <label className="a-label">{label}</label> : null}
      <div className={cn("flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2", compact && "p-1.5")}>
        <div className={cn("flex flex-none items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400", compact ? "h-12 w-16" : "h-16 w-24")}>
          {value ? (
            isVideoUrl(value) ? <Film size={22} /> : // eslint-disable-next-line @next/next/no-img-element
            <img src={asset(value)} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={22} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs text-slate-500" dir="ltr" title={value}>{value || t({ en: "No file selected", ar: "لم يتم اختيار ملف" })}</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Button size="sm" onClick={() => setOpen(true)}>{value ? t({ en: "Change", ar: "تغيير" }) : t({ en: "Choose", ar: "اختيار" })}</Button>
            {value ? <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard?.writeText(value); toast(t({ en: "Copied", ar: "تم النسخ" }), "info"); }}><Copy size={13} /></Button> : null}
            {value ? <Button size="sm" variant="ghost" className="!text-rose-600" onClick={() => onChange("")}>{t({ en: "Remove", ar: "إزالة" })}</Button> : null}
          </div>
        </div>
      </div>
      <MediaLibraryModal open={open} onClose={() => setOpen(false)} onSelect={onChange} accept={accept} />
    </div>
  );
}

export { useConfirm };
