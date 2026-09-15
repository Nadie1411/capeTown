import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export function ok(data: any = { ok: true }, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<{ data: T } | { error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { error: bad("Invalid JSON") };
  }
  const result = schema.safeParse(raw);
  if (!result.success) return { error: bad(result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")) };
  return { data: result.data };
}

export function handle(fn: (req: Request, ctx: any) => Promise<Response>) {
  return async (req: Request, ctx: any) => {
    try {
      return await fn(req, ctx);
    } catch (e: any) {
      console.error(e);
      if (e?.code === "P2002") return bad("A record with the same slug/value already exists", 409);
      if (e?.code === "P2025") return bad("Not found", 404);
      return bad(e?.message || "Server error", 500);
    }
  };
}

export const ltextSchema = (z: typeof import("zod").z) => z.object({ ar: z.string().default(""), en: z.string().default("") });
