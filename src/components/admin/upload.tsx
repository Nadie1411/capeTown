"use client";
import { useSyncExternalStore } from "react";
import type { MediaData } from "@/lib/types";
import { MAX_UPLOAD_BYTES, UPLOAD_CHUNK_SIZES } from "@/lib/upload-limits";
import { withBase } from "@/lib/base";
import { Button, useToast } from "./ui";
import { useT } from "./i18n";

/* Uploads are sent in pieces (see upload-limits.ts) and tracked in one place, so the progress card in the admin shell
   shows them wherever they were started, and they keep going if the media dialog is closed. */

type Progress = { fileName: string; fileIndex: number; fileCount: number; loaded: number; total: number };

let progress: Progress | null = null;
let controller: AbortController | null = null;
let chunkStep = 0; // index into UPLOAD_CHUNK_SIZES; only ever moves to smaller pieces, and is remembered for the next files
const listeners = new Set<() => void>();

function publish(next: Progress | null) {
  progress = next;
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export const cancelUpload = () => controller?.abort();

const cancelled = () => new DOMException("Upload cancelled", "AbortError");

function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => { clearTimeout(timer); reject(cancelled()); }, { once: true });
  });
}

function newUploadId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** POSTs one piece. Resolves with the HTTP status (0 = network error / timeout) and the parsed JSON body. */
function sendPiece(url: string, piece: Blob, signal: AbortSignal, onSent: (bytes: number) => void) {
  return new Promise<{ status: number; body: any }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const onAbort = () => xhr.abort();
    signal.addEventListener("abort", onAbort, { once: true });
    const finish = () => signal.removeEventListener("abort", onAbort);
    xhr.open("POST", url);
    xhr.timeout = 120_000;
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.upload.onprogress = (e) => onSent(e.loaded);
    xhr.onload = () => {
      finish();
      let body: any = {};
      try { body = JSON.parse(xhr.responseText); } catch {}
      resolve({ status: xhr.status, body });
    };
    xhr.onerror = xhr.ontimeout = () => { finish(); resolve({ status: 0, body: {} }); };
    xhr.onabort = () => { finish(); reject(cancelled()); };
    xhr.send(piece);
  });
}

async function uploadOne(file: File, sentBefore: number, report: (loaded: number) => void, signal: AbortSignal): Promise<MediaData> {
  const query = `id=${newUploadId()}&name=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.type)}&total=${file.size}`;
  let offset = 0;
  let failures = 0;
  let resyncs = 0;
  for (;;) {
    signal.throwIfAborted();
    const end = Math.min(offset + UPLOAD_CHUNK_SIZES[chunkStep], file.size);
    const { status, body } = await sendPiece(withBase(`/api/admin/media/upload?${query}&offset=${offset}`), file.slice(offset, end), signal, (n) => report(sentBefore + offset + n));
    if (status === 200) {
      failures = 0;
      offset = end;
      report(sentBefore + offset);
      if (offset < file.size) continue;
      if (body.media) return body.media;
      throw new Error("Unexpected reply from the server");
    }
    // the server lost track of how much it has: carry on from where it says it is
    if (status === 409 && typeof body.received === "number" && ++resyncs <= 3) {
      offset = body.received;
      report(sentBefore + offset);
      continue;
    }
    // a proxy in front of the app refused the piece as too big (413, or it hung up on us): send smaller pieces
    if ((status === 413 || status === 0) && chunkStep < UPLOAD_CHUNK_SIZES.length - 1) {
      chunkStep++;
      continue;
    }
    if ((status === 0 || status >= 500) && ++failures <= 3) {
      await pause(failures * 1000, signal);
      continue;
    }
    throw new Error(body.error || (status === 0 ? "Connection lost" : status === 413 ? "The server refused the upload (413)" : `Request failed (${status})`));
  }
}

/** Uploads the files one after another, publishing progress as bytes go out. Never throws: problems come back in `errors`. */
export async function uploadFiles(input: File[]) {
  const media: MediaData[] = [];
  const errors: string[] = [];
  const queue = input.filter((f) => {
    if (f.size === 0) errors.push(`${f.name}: empty file`);
    else if (f.size > MAX_UPLOAD_BYTES) errors.push(`${f.name}: too large (${Math.round(f.size / 1048576)} MB, the limit is ${MAX_UPLOAD_BYTES / 1048576} MB)`);
    else return true;
    return false;
  });
  const total = queue.reduce((n, f) => n + f.size, 0);
  const stopped = new AbortController();
  const warn = (e: BeforeUnloadEvent) => e.preventDefault(); // leaving the page would throw the upload away
  let wasCancelled = false;
  controller = stopped;
  window.addEventListener("beforeunload", warn);
  try {
    let sent = 0;
    for (const [i, file] of queue.entries()) {
      let shown = -Infinity;
      const report = (loaded: number) => {
        if (loaded - shown < 128 * 1024 && loaded < sent + file.size) return; // don't re-render for every few bytes
        shown = loaded;
        publish({ fileName: file.name, fileIndex: i, fileCount: queue.length, loaded: Math.min(loaded, total), total });
      };
      report(sent);
      try {
        media.push(await uploadOne(file, sent, report, stopped.signal));
      } catch (e: any) {
        if (e?.name === "AbortError") { wasCancelled = true; break; }
        errors.push(`${file.name}: ${e?.message || "upload failed"}`);
      }
      sent += file.size;
    }
  } finally {
    window.removeEventListener("beforeunload", warn);
    controller = null;
    publish(null);
  }
  return { media, errors, cancelled: wasCancelled };
}

/** For anything that uploads: `upload(files)` sends them, reports the result in a toast and hands the new media to `onUploaded`. */
export function useUpload(onUploaded: (media: MediaData[]) => void) {
  const t = useT();
  const toast = useToast();
  const busy = useSyncExternalStore(subscribe, () => progress !== null, () => false);
  const upload = async (files: FileList | File[] | null) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    if (progress) return toast(t({ en: "Another upload is still running", ar: "هناك عملية رفع جارية" }), "info");
    const result = await uploadFiles(list);
    if (result.media.length) {
      onUploaded(result.media);
      toast(t({ en: `${result.media.length} file(s) uploaded`, ar: `تم رفع ${result.media.length} ملف` }));
    }
    if (result.errors.length) toast(result.errors[0] + (result.errors.length > 1 ? ` (+${result.errors.length - 1})` : ""), "error");
    else if (result.cancelled) toast(t({ en: "Upload cancelled", ar: "تم إلغاء الرفع" }), "info");
  };
  return { upload, busy };
}

const mb = (bytes: number) => (bytes / 1048576).toFixed(1);

/** Floating progress bar with the megabytes sent so far. Rendered once, in the admin shell. */
export function UploadProgressCard() {
  const t = useT();
  const p = useSyncExternalStore(subscribe, () => progress, () => null);
  if (!p) return null;
  const pct = p.total ? Math.min(100, Math.floor((p.loaded / p.total) * 100)) : 0;
  return (
    <div className="fixed inset-x-4 bottom-4 z-[110] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:inset-x-auto sm:end-4 sm:w-96" role="status">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500">
            {t({ en: "Uploading", ar: "جارٍ الرفع" })}
            {p.fileCount > 1 ? ` · ${t({ en: `file ${p.fileIndex + 1} of ${p.fileCount}`, ar: `الملف ${p.fileIndex + 1} من ${p.fileCount}` })}` : ""}
          </p>
          <p className="truncate text-sm font-semibold text-slate-800" title={p.fileName}>{p.fileName}</p>
        </div>
        <Button size="sm" variant="ghost" onClick={cancelUpload}>{t({ en: "Cancel", ar: "إلغاء" })}</Button>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className="h-full rounded-full bg-[#233283] transition-[width] duration-150" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 flex justify-between text-xs tabular-nums text-slate-600" dir="ltr">
        <span>{mb(p.loaded)} / {mb(p.total)} MB</span>
        <span>{pct}%</span>
      </p>
    </div>
  );
}
