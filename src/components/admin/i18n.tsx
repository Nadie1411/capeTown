"use client";
import { createContext, useContext } from "react";
import type { LText } from "@/lib/types";

export type AdminLang = "en" | "ar";
const Ctx = createContext<AdminLang>("en");

export function AdminLocaleProvider({ lang, children }: { lang: AdminLang; children: React.ReactNode }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}

export function useAdminLang() {
  return useContext(Ctx);
}

/** t({en, ar}) → string in the admin language */
export function useT() {
  const lang = useContext(Ctx);
  return (v: LText | string | undefined | null) => {
    if (!v) return "";
    if (typeof v === "string") return v;
    return v[lang] || v.en || v.ar || "";
  };
}

export function setAdminLang(lang: AdminLang) {
  document.cookie = `admin_lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}
