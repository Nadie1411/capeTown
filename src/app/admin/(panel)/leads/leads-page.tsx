"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LeadData } from "@/lib/types";
import { cn, formatDate, telHref, waHref } from "@/lib/utils";
import { Button, Card, EmptyState, PageHeader, api, useConfirm, useToast } from "@/components/admin/ui";
import { useT, useAdminLang } from "@/components/admin/i18n";
import { Inbox, Phone, MessageCircle, Mail, Trash2, Download, MailOpen } from "lucide-react";

export function LeadsPage({ initial }: { initial: LeadData[] }) {
  const t = useT();
  const lang = useAdminLang();
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [leads, setLeads] = useState(initial);
  const [active, setActive] = useState<LeadData | null>(initial[0] || null);

  const open = async (l: LeadData) => {
    setActive(l);
    if (!l.read) {
      setLeads((s) => s.map((x) => (x.id === l.id ? { ...x, read: true } : x)));
      await api(`/api/admin/leads/${l.id}`, { method: "PATCH", json: { read: true } });
      router.refresh();
    }
  };
  const remove = async (l: LeadData) => {
    if (!(await confirm(t({ en: "Delete this message?", ar: "حذف هذه الرسالة؟" })))) return;
    await api(`/api/admin/leads/${l.id}`, { method: "DELETE" });
    setLeads((s) => s.filter((x) => x.id !== l.id));
    setActive(null);
    toast(t({ en: "Deleted", ar: "تم الحذف" }));
    router.refresh();
  };
  const exportCsv = () => {
    const rows = [["Date", "Name", "Phone", "Email", "Service", "Message"], ...leads.map((l) => [l.createdAt, l.name, l.phone, l.email, l.service, l.message.replace(/\n/g, " ")])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "messages.csv";
    a.click();
  };

  return (
    <>
      <PageHeader title={t({ en: "Messages", ar: "الرسائل" })} description={t({ en: "Submissions from the website contact form.", ar: "الرسائل الواردة من نموذج التواصل في الموقع." })} actions={<Button onClick={exportCsv} disabled={!leads.length}><Download size={15} /> CSV</Button>} />
      {!leads.length ? (
        <EmptyState icon={<Inbox size={40} />} title={t({ en: "No messages yet", ar: "لا توجد رسائل بعد" })} description={t({ en: "When a visitor sends the contact form, it appears here.", ar: "عندما يرسل زائر نموذج التواصل، تظهر رسالته هنا." })} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <Card padded={false} className="lg:col-span-2">
            <ul className="a-scroll max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
              {leads.map((l) => (
                <li key={l.id}>
                  <button className={cn("flex w-full items-start gap-3 px-4 py-3 text-start hover:bg-slate-50", active?.id === l.id && "bg-blue-50")} onClick={() => open(l)}>
                    <span className={cn("mt-2 h-2 w-2 flex-none rounded-full", l.read ? "bg-slate-300" : "bg-rose-500")} />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-sm", l.read ? "font-medium text-slate-700" : "font-bold text-slate-900")}>{l.name}</span>
                      <span className="block truncate text-xs text-slate-500">{l.service || l.message || l.phone}</span>
                    </span>
                    <span className="flex-none text-[11px] text-slate-400">{formatDate(l.createdAt, lang)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="lg:col-span-3">
            {active ? (
              <div>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{active.name}</h2>
                    <div className="text-xs text-slate-500">{formatDate(active.createdAt, lang)} · {active.locale.toUpperCase()}</div>
                  </div>
                  <div className="flex gap-1">
                    <a href={telHref(active.phone)} className="a-btn a-btn-secondary a-btn-sm"><Phone size={14} /> {t({ en: "Call", ar: "اتصال" })}</a>
                    <a href={waHref(active.phone)} target="_blank" className="a-btn a-btn-secondary a-btn-sm"><MessageCircle size={14} /> WhatsApp</a>
                    {active.email ? <a href={`mailto:${active.email}`} className="a-btn a-btn-secondary a-btn-sm"><Mail size={14} /></a> : null}
                    <Button size="sm" variant="ghost" className="!text-rose-600" onClick={() => remove(active)}><Trash2 size={14} /></Button>
                  </div>
                </div>
                <dl className="mb-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                  <dt className="text-slate-500">{t({ en: "Phone", ar: "الهاتف" })}</dt><dd dir="ltr" className="font-medium text-start">{active.phone}</dd>
                  {active.email ? <><dt className="text-slate-500">{t({ en: "Email", ar: "البريد" })}</dt><dd dir="ltr" className="text-start">{active.email}</dd></> : null}
                  {active.service ? <><dt className="text-slate-500">{t({ en: "Service", ar: "الخدمة" })}</dt><dd>{active.service}</dd></> : null}
                </dl>
                <div className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">{active.message || "—"}</div>
              </div>
            ) : (
              <div className="flex h-full min-h-40 items-center justify-center text-sm text-slate-400"><MailOpen className="me-2" size={18} /> {t({ en: "Select a message", ar: "اختر رسالة" })}</div>
            )}
          </Card>
        </div>
      )}
      {dialog}
    </>
  );
}
