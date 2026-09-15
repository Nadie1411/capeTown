import { uid } from "@/lib/utils";

/** Recursively give every object inside arrays a stable `_id` (used as drag & drop keys). */
export function ensureIds<T>(value: T): T {
  const walk = (v: any): any => {
    if (Array.isArray(v)) return v.map((it) => (it && typeof it === "object" && !Array.isArray(it) ? walk({ ...it, _id: it._id || uid("i") }) : it));
    if (v && typeof v === "object") {
      const out: any = {};
      for (const k of Object.keys(v)) out[k] = walk(v[k]);
      return out;
    }
    return v;
  };
  return walk(value);
}
