"use client";
import { useState } from "react";
import { Button, Input, api } from "@/components/admin/ui";
import { useT, useAdminLang, setAdminLang } from "@/components/admin/i18n";
import { LockKeyhole } from "lucide-react";

export function LoginForm({ next }: { next: string }) {
  const t = useT();
  const lang = useAdminLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/auth/login", { method: "POST", json: { email, password } });
      window.location.href = next.startsWith("/admin") ? next : "/admin";
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
      <div className="mb-6 flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.svg" alt="" className="mb-3 h-24 w-24" />
        <h1 className="text-lg font-extrabold text-slate-900">{t({ en: "Admin panel", ar: "لوحة التحكم" })}</h1>
        <p className="text-sm text-slate-500">{t({ en: "Sign in to manage the website", ar: "سجّل الدخول لإدارة الموقع" })}</p>
      </div>
      <div className="grid gap-3">
        <div>
          <label className="a-label">{t({ en: "Email", ar: "البريد الإلكتروني" })}</label>
          <Input type="email" dir="ltr" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="a-label">{t({ en: "Password", ar: "كلمة المرور" })}</label>
          <Input type="password" dir="ltr" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}
        <Button type="submit" variant="primary" loading={busy} className="mt-1 !py-2.5"><LockKeyhole size={16} /> {t({ en: "Sign in", ar: "دخول" })}</Button>
      </div>
      <button type="button" className="mt-5 w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800" onClick={() => { setAdminLang(lang === "ar" ? "en" : "ar"); window.location.reload(); }}>
        {lang === "ar" ? "English" : "العربية"}
      </button>
    </form>
  );
}
