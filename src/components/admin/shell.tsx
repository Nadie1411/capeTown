"use client";
import { withBase } from "@/lib/base";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useT, useAdminLang, setAdminLang } from "./i18n";
import { LayoutDashboard, FileText, Hammer, Building2, Images, Inbox, Settings, QrCode, UserRound, LogOut, ExternalLink, Menu, X, Languages } from "lucide-react";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: { en: "Dashboard", ar: "الرئيسية" }, exact: true },
  { href: "/admin/pages", icon: FileText, label: { en: "Pages & layout", ar: "الصفحات والتصميم" } },
  { href: "/admin/services", icon: Hammer, label: { en: "Services", ar: "الخدمات" } },
  { href: "/admin/projects", icon: Building2, label: { en: "Projects", ar: "المشاريع" } },
  { href: "/admin/media", icon: Images, label: { en: "Media", ar: "الوسائط" } },
  { href: "/admin/leads", icon: Inbox, label: { en: "Messages", ar: "الرسائل" }, badge: true },
  { href: "/admin/settings", icon: Settings, label: { en: "Site settings", ar: "إعدادات الموقع" } },
  { href: "/admin/qr", icon: QrCode, label: { en: "QR code", ar: "رمز QR" } },
  { href: "/admin/account", icon: UserRound, label: { en: "My account", ar: "حسابي" } },
];

export function AdminShell({ user, unread, children }: { user: { name: string; email: string }; unread: number; children: React.ReactNode }) {
  const t = useT();
  const lang = useAdminLang();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isEditor = /^\/admin\/pages\/[^/]+$/.test(pathname);
  const logout = async () => {
    await fetch(withBase("/api/admin/auth/logout"), { method: "POST" });
    window.location.href = withBase("/admin/login");
  };
  const toggleLang = () => {
    setAdminLang(lang === "ar" ? "en" : "ar");
    router.refresh();
  };
  const Sidebar = (
    <aside className="flex h-full w-64 flex-col bg-[#141c52] text-slate-200">
      <div className="flex items-center gap-3 px-4 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={withBase("/brand/mark-white.svg")} alt="" className="h-10 w-10" />
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold text-white">Cape Town</div>
          <div className="truncate text-[11px] text-slate-400">{t({ en: "Website admin", ar: "إدارة الموقع" })}</div>
        </div>
        <button className="ms-auto rounded p-1 text-slate-300 hover:bg-white/10 lg:hidden" onClick={() => setOpen(false)}><X size={18} /></button>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV.map((n) => {
          const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <a key={n.href} href={withBase(n.href)} className="a-side-link text-sm" data-active={active} onClick={() => setOpen(false)}>
              <n.icon size={18} />
              <span className="flex-1">{t(n.label)}</span>
              {n.badge && unread ? <span className="rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{unread}</span> : null}
            </a>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <a href={withBase("/")} target="_blank" className="a-side-link text-sm"><ExternalLink size={18} />{t({ en: "View website", ar: "عرض الموقع" })}</a>
        <button onClick={toggleLang} className="a-side-link w-full text-sm"><Languages size={18} />{lang === "ar" ? "English" : "العربية"}</button>
        <button onClick={logout} className="a-side-link w-full text-sm"><LogOut size={18} />{t({ en: "Sign out", ar: "تسجيل الخروج" })}</button>
        <div className="truncate px-3 pt-1 text-[11px] text-slate-400" dir="ltr">{user.email}</div>
      </div>
    </aside>
  );
  return (
    <div className="flex min-h-screen">
      {!isEditor ? <div className="fixed inset-y-0 start-0 z-40 hidden lg:block">{Sidebar}</div> : null}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0">{Sidebar}</div>
        </div>
      ) : null}
      <div className={cn("flex min-h-screen min-w-0 flex-1 flex-col", !isEditor && "lg:ps-64")}>
        <header className={cn("sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-2 backdrop-blur", isEditor ? "hidden" : "lg:hidden")}>
          <button className="a-btn a-btn-ghost a-btn-icon" onClick={() => setOpen(true)}><Menu size={20} /></button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBase("/brand/mark.svg")} alt="" className="h-8 w-8" />
          <span className="text-sm font-bold">{t({ en: "Admin", ar: "لوحة التحكم" })}</span>
        </header>
        <main className={cn("min-w-0 flex-1", isEditor ? "" : "p-4 md:p-6 lg:p-8")}>{children}</main>
      </div>
    </div>
  );
}
