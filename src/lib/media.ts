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

export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024; // 200 MB (videos)

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
