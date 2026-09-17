import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE === "ar" ? "ar" : "en";
const BASE = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");
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

/** Absolute URL inside the app (base path included) */
function appUrl(req: NextRequest, path: string, search = "") {
  const p = path === "/" && BASE ? BASE : `${BASE}${path}`;
  return new URL(`${p}${search}`, req.url);
}

export async function proxy(req: NextRequest) {
  // Next strips the base path from nextUrl.pathname — except for the bare base URL itself, so normalise here.
  let pathname = req.nextUrl.pathname;
  if (BASE && (pathname === BASE || pathname.startsWith(BASE + "/"))) pathname = pathname.slice(BASE.length) || "/";
  // trailing slashes: canonicalise (Next's own redirect is disabled so a web server that adds slashes cannot loop)
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const clean = pathname.replace(/\/+$/, "");
    if (clean.startsWith("/_next") || clean.startsWith("/api")) pathname = clean;
    else return NextResponse.redirect(appUrl(req, clean, req.nextUrl.search), 308);
  }

  // ---- admin panel & admin API guard ----
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (!(await hasValidSession(req))) return NextResponse.redirect(appUrl(req, "/admin/login", `?next=${encodeURIComponent(pathname)}`));
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

  // ---- locale handling: default locale has no prefix, the other uses /en or /ar ----
  const seg = pathname.split("/")[1];
  if (seg === DEFAULT_LOCALE) {
    return NextResponse.redirect(appUrl(req, pathname.slice(DEFAULT_LOCALE.length + 1) || "/", req.nextUrl.search), 308);
  }
  if (seg === "ar" || seg === "en") return NextResponse.next();

  return NextResponse.rewrite(appUrl(req, `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`, req.nextUrl.search));
}

export const config = {
  matcher: ["/", "/((?!_next/static|_next/image).*)"],
};
