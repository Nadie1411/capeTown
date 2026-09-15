import { z } from "zod";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions, signSession, verifyCredentials } from "@/lib/auth";
import { handle, parseBody, bad } from "@/lib/api";

const attempts = new Map<string, number[]>();

export const POST = handle(async (req) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((t) => now - t < 15 * 60 * 1000);
  if (recent.length >= 10) return bad("Too many attempts, try again later", 429);
  attempts.set(ip, [...recent, now]);

  const parsed = await parseBody(req, z.object({ email: z.string().min(3), password: z.string().min(1) }));
  if ("error" in parsed) return parsed.error;
  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) return bad("Incorrect email or password", 401);
  const token = await signSession({ sub: user.id, email: user.email, name: user.name });
  const res = NextResponse.json({ ok: true, user: { email: user.email, name: user.name } });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
});
