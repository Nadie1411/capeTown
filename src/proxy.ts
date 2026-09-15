import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE === "en" ? "en" : "ar";
const SESSION_COOKIE = "ct_admin";
const PUBLIC_FILE = /\.[a-zA-Z0-9]+$/;

async function hasValidSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const secret = process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16 ? process.env.AUTH_SECRET : "dev-only-insecure-secret-change-me-please!!";
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ---- admin panel & admin API guard ----
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (!(await hasValidSession(req))) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/admin")) {
    if (pathname.startsWith("/api/admin/auth/login")) return NextResponse.next();
    if (!(await hasValidSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.next();
  }
  if (pathname.startsWith("/preview")) {
    if (!(await hasValidSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.next();
  }

  // ---- things that never get a locale prefix ----
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/uploads") || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  // ---- locale handling: default locale has no prefix, others use /en ----
  const seg = pathname.split("/")[1];
  if (seg === DEFAULT_LOCALE) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (seg === "ar" || seg === "en") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
