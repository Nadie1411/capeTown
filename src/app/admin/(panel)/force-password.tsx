"use client";
import { useState } from "react";
import { Button, Input, api, useToast } from "@/components/admin/ui";
import { useT } from "@/components/admin/i18n";
import { KeyRound, ShieldAlert } from "lucide-react";

/** Shown instead of the panel when the account is on a one-time recovery password. */
export function ForcePasswordChange({ email }: { email: string }) {
  const t = useT();
  const toast = useToast();
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) return toast(t({ en: "Passwords do not match", ar: "كلمتا المرور غير متطابقتين" }), "error");
    if (newPassword.length < 8) return toast(t({ en: "Use at least 8 characters", ar: "استخدم 8 أحرف على الأقل" }), "error");
    setBusy(true);
    try {
      await api("/api/admin/account", { method: "PUT", json: { currentPassword, newPassword } });
      toast(t({ en: "Password changed — opening the panel…", ar: "تم تغيير كلمة المرور — جارٍ فتح اللوحة…" }));
      setTimeout(() => window.location.reload(), 700);
    } catch (err: any) {
      toast(err.message, "error");
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#233283_0%,_#0f172a_70%)] p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-5 flex items-start gap-3 rounded-xl bg-amber-50 p-3 text-amber-900">
          <ShieldAlert size={20} className="mt-0.5 flex-none" />
          <p className="text-sm">{t({ en: "You signed in with a temporary password. Choose your own password to continue — the temporary one stops working.", ar: "لقد دخلت بكلمة مرور مؤقتة. اختر كلمة مرور خاصة بك للمتابعة — وستتوقف المؤقتة عن العمل." })}</p>
        </div>
        <h1 className="text-lg font-extrabold text-slate-900">{t({ en: "Set a new password", ar: "اختر كلمة مرور جديدة" })}</h1>
        <p className="mb-5 text-sm text-slate-500" dir="ltr">{email}</p>
        <div className="grid gap-3">
          <div>
            <label className="a-label">{t({ en: "Temporary password", ar: "كلمة المرور المؤقتة" })}</label>
            <Input type="password" dir="ltr" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <div>
            <label className="a-label">{t({ en: "New password", ar: "كلمة المرور الجديدة" })}</label>
            <Input type="password" dir="ltr" autoComplete="new-password" required value={newPassword} onChange={(e) => setNew(e.target.value)} />
          </div>
          <div>
            <label className="a-label">{t({ en: "Confirm new password", ar: "تأكيد كلمة المرور الجديدة" })}</label>
            <Input type="password" dir="ltr" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Button type="submit" variant="primary" loading={busy} className="mt-1 !py-2.5"><KeyRound size={16} /> {t({ en: "Save and continue", ar: "حفظ ومتابعة" })}</Button>
        </div>
      </form>
    </div>
  );
}
