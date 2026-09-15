import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().max(160).optional().default(""),
  service: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().max(4000).optional().default(""),
  locale: z.enum(["ar", "en"]).optional().default("ar"),
  website: z.string().optional().default(""), // honeypot
});

const recent = new Map<string, number[]>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (hits.length >= 8) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  recent.set(ip, [...hits, now]);

  let data;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  if (data.website) return NextResponse.json({ ok: true }); // bot filled the honeypot
  await prisma.lead.create({ data: { name: data.name, phone: data.phone, email: data.email, service: data.service, message: data.message, locale: data.locale } });
  return NextResponse.json({ ok: true });
}
