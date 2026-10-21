/** Largest file the media library accepts (videos). Shared by the browser (checks before sending) and the server. */
export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024; // 200 MB

/** Files travel in pieces, so no single request is big. The first size has to stay under 10 MB (the most Next's
 *  proxy.ts keeps of a request body); the smaller sizes are fallbacks for hosts that answer 413 above ~1 MB (nginx default). */
export const UPLOAD_CHUNK_SIZES = [4 * 1024 * 1024, 768 * 1024, 256 * 1024];
