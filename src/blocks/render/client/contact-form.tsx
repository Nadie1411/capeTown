"use client";
import { useState } from "react";
import type { Locale, ServiceData } from "@/lib/types";
import { lt, t } from "@/lib/i18n";
import { cn, waHref } from "@/lib/utils";
import { CircleCheck, Send, MessageCircle, LoaderCircle } from "lucide-react";

interface Props {
  locale: Locale;
  services: ServiceData[];
  showServiceSelect: boolean;
  showEmailField: boolean;
  formMode: "save" | "whatsapp" | "both";
  whatsapp: string;
  buttonLabel: string;
  successMessage: string;
  preview?: boolean;
}

export function ContactForm({ locale, services, showServiceSelect, showEmailField, formMode, whatsapp, buttonLabel, successMessage, preview }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", message: "" });
  const [website, setWebsite] = useState(""); // honeypot — bots fill it, humans never see it
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  const waMessage = () => {
    const lines = [
      `${t(locale, "name")}: ${form.name}`,
      `${t(locale, "phone")}: ${form.phone}`,
      form.email ? `${t(locale, "email")}: ${form.email}` : "",
      form.service ? `${t(locale, "service")}: ${form.service}` : "",
      "",
      form.message,
    ].filter((l) => l !== "");
    return lines.join("\n");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preview) return;
    if (formMode !== "whatsapp") {
      setState("sending");
      try {
        const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, website, locale }) });
        if (!res.ok) throw new Error("bad");
        setState("done");
      } catch {
        setState("error");
        return;
      }
    }
    if (formMode !== "save") {
      window.open(waHref(whatsapp, waMessage()), "_blank", "noopener");
      if (formMode === "whatsapp") setState("done");
    }
  };

  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius)] border border-green-200 bg-green-50 p-8 text-center text-green-900">
        <CircleCheck size={48} className="text-green-600" />
        <p className="text-lg font-medium">{successMessage}</p>
        <button className="btn btn-outline btn-sm mt-2" onClick={() => { setState("idle"); setForm({ name: "", phone: "", email: "", service: "", message: "" }); }}>
          {locale === "ar" ? "إرسال رسالة أخرى" : "Send another message"}
        </button>
      </div>
    );
  }

  const inputCls = "w-full rounded-[calc(var(--radius)*.7)] border-2 border-[var(--card-border)] bg-white px-4 py-3.5 text-[1.05em] text-[var(--c-text)] outline-none transition focus:border-[var(--c-primary)]";
  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <label className="block">
        <span className="mb-1.5 block font-medium">{t(locale, "name")} *</span>
        <input required className={inputCls} value={form.name} onChange={set("name")} autoComplete="name" />
      </label>
      <label className="block">
        <span className="mb-1.5 block font-medium">{t(locale, "phone")} *</span>
        <input required type="tel" dir="ltr" className={cn(inputCls, locale === "ar" && "text-right")} value={form.phone} onChange={set("phone")} autoComplete="tel" inputMode="tel" />
      </label>
      {showEmailField ? (
        <label className="block">
          <span className="mb-1.5 block font-medium">{t(locale, "email")}</span>
          <input type="email" dir="ltr" className={cn(inputCls, locale === "ar" && "text-right")} value={form.email} onChange={set("email")} autoComplete="email" />
        </label>
      ) : null}
      {showServiceSelect ? (
        <label className="block">
          <span className="mb-1.5 block font-medium">{t(locale, "service")}</span>
          <select className={inputCls} value={form.service} onChange={set("service")}>
            <option value="">{t(locale, "chooseService")}</option>
            {services.map((s) => (
              <option key={s.id} value={lt(s.title, locale)}>{lt(s.title, locale)}</option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block font-medium">{t(locale, "message")}</span>
        <textarea rows={5} className={inputCls} value={form.message} onChange={set("message")} />
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={state === "sending"} className={cn("btn btn-lg", formMode === "whatsapp" ? "btn-whatsapp" : "btn-primary")}>
          {state === "sending" ? <LoaderCircle className="animate-spin" size={20} /> : formMode === "whatsapp" ? <MessageCircle size={20} /> : <Send size={20} />}
          <span>{state === "sending" ? t(locale, "sending") : formMode === "whatsapp" ? t(locale, "sendWhatsapp") : buttonLabel}</span>
        </button>
        {state === "error" ? <span className="font-bold text-red-600">{t(locale, "error")}</span> : null}
      </div>
    </form>
  );
}
