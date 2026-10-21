import path from "node:path";
import fs from "node:fs/promises";

export function uploadDir() {
  const dir = process.env.UPLOAD_DIR || "./storage/uploads";
  return path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
}

export const MIME_KIND: Record<string, "image" | "video" | "file"> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "image/svg+xml": "image",
  "image/avif": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
  "application/pdf": "file",
};

export const EXT_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
};

export const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "application/pdf": ".pdf",
};

/** A problem with an upload that the person uploading should see as-is (wrong type, unsafe SVG …) */
export class UploadError extends Error {}

/** Work out the mime type and kind of an incoming file. Browsers sometimes send no type for .mov/.mp4, so fall back to the extension. */
export function describeUpload(filename: string, declaredMime: string) {
  const sent = declaredMime && declaredMime !== "application/octet-stream" ? declaredMime : "";
  const mime = sent || EXT_MIME[path.extname(filename).toLowerCase()] || declaredMime || "application/octet-stream";
  const kind = MIME_KIND[mime];
  if (!kind) throw new UploadError(`Unsupported file type: ${mime}`);
  return { mime, kind };
}

/** Where unfinished chunked uploads are assembled. Inside the upload dir so finishing is a cheap rename; never served (dot folder). */
export function tempDir() {
  return path.join(uploadDir(), ".tmp");
}

/** Resolve a public /uploads/... url to a file path inside the upload dir (prevents path traversal) */
export function resolveUploadPath(rel: string) {
  const base = uploadDir();
  const target = path.normalize(path.join(base, rel));
  if (!target.startsWith(base)) return null;
  return target;
}

export async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}
