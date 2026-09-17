/** Base path support — lets the site live in a sub-folder such as https://example.com/elegant/test
 *  Set NEXT_PUBLIC_BASE_PATH="/elegant/test" (no trailing slash) before building. Leave empty for the domain root. */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");

/** Prefix a root-relative path ("/x") with the base path. External, anchor, tel:, mailto: and already-prefixed paths are returned unchanged. */
export function withBase(path: string): string {
  if (!path || !BASE_PATH) return path;
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (path === BASE_PATH || path.startsWith(BASE_PATH + "/")) return path;
  return BASE_PATH + path;
}

/** Same as withBase — for image/video/file URLs stored in the database (e.g. "/uploads/..", "/photos/..") */
export const asset = withBase;
