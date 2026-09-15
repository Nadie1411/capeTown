"use client";
import { useState } from "react";
import { Button, Card, Input, PageHeader, api, useToast } from "@/components/admin/ui";
import { useT } from "@/components/admin/i18n";
import { Save, KeyRound } from "lucide-react";

export function AccountPage({ name: initialName, email: initialEmail }: { name: string; email: string }) {
  const t = useT();
  const toast = useToast();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const saveProfile = async () => {
    setBusy(true);
    try {
      await api("/api/admin/account", { method: "PUT", json: { name, email } });
      toast(t({ en: "Profile saved. Sign in again to refresh your session.", ar: "تم الحفظ. سجّل الدخول مجدداً لتحديث الجلسة." }));
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };
  const savePassword = async () => {
    if (newPassword !== confirm) return toast(t({ en: "Passwords do not match", ar: "كلمتا المرور غير متطابقتين" }), "error");
    if (newPassword.length < 8) return toast(t({ en: "Use at least 8 characters", ar: "استخدم 8 أحرف على الأقل" }), "error");
    setBusy(true);
    try {
      await api("/api/admin/account", { method: "PUT", json: { currentPassword, newPassword } });
      toast(t({ en: "Password changed", ar: "تم تغيير كلمة المرور" }));
      setCurrent(""); setNew(""); setConfirm("");
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title={t({ en: "My account", ar: "حسابي" })} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={t({ en: "Profile", ar: "الملف الشخصي" })}>
          <div className="grid gap-3">
            <div><label className="a-label">{t({ en: "Name", ar: "الاسم" })}</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label className="a-label">{t({ en: "Email (used to sign in)", ar: "البريد الإلكتروني (لتسجيل الدخول)" })}</label><Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <Button variant="primary" onClick={saveProfile} loading={busy} className="justify-self-start"><Save size={15} /> {t({ en: "Save", ar: "حفظ" })}</Button>
          </div>
        </Card>
        <Card title={t({ en: "Change password", ar: "تغيير كلمة المرور" })}>
          <div className="grid gap-3">
            <div><label className="a-label">{t({ en: "Current password", ar: "كلمة المرور الحالية" })}</label><Input type="password" dir="ltr" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" /></div>
            <div><label className="a-label">{t({ en: "New password", ar: "كلمة المرور الجديدة" })}</label><Input type="password" dir="ltr" value={newPassword} onChange={(e) => setNew(e.target.value)} autoComplete="new-password" /></div>
            <div><label className="a-label">{t({ en: "Confirm new password", ar: "تأكيد كلمة المرور الجديدة" })}</label><Input type="password" dir="ltr" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" /></div>
            <Button variant="primary" onClick={savePassword} loading={busy} className="justify-self-start"><KeyRound size={15} /> {t({ en: "Change password", ar: "تغيير كلمة المرور" })}</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
