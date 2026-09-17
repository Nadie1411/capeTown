"use client";
import { withBase } from "@/lib/base";
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
    let saved = false;
    if (formMode !== "whatsapp") {
      setState("sending");
      try {
        const res = await fetch(withBase("/api/contact"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, website, locale }) });
        if (!res.ok) throw new Error("bad");
        saved = true;
      } catch {
        // no server available (static hosting) — fall back to WhatsApp if we can
        if (!whatsapp) {
          setState("error");
          return;
        }
      }
    }
    if (formMode !== "save" || !saved) {
      if (whatsapp) window.open(waHref(whatsapp, waMessage()), "_blank", "noopener");
    }
    setState(saved || whatsapp ? "done" : "error");
  };

  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-3 border border-[var(--line-cur)] p-8 text-center">
        <CircleCheck size={40} className="text-[var(--c-accent)]" />
        <p className="text-lg font-medium">{successMessage}</p>
        <button className="btn btn-outline btn-sm mt-2" onClick={() => { setState("idle"); setForm({ name: "", phone: "", email: "", service: "", message: "" }); }}>
          {locale === "ar" ? "إرسال رسالة أخرى" : "Send another message"}
        </button>
      </div>
    );
  }

  const inputCls = "w-full border-0 border-b border-[var(--line-cur-strong,rgba(0,0,0,.3))] bg-transparent px-0 py-3 text-[1.05em] text-[var(--fg)] outline-none transition focus:border-[var(--c-primary)] placeholder:text-[var(--fg-muted)]";
  return (
    <form onSubmit={submit} className="relative grid grid-cols-1 gap-5 sm:grid-cols-2">
      <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <label className="block">
        <span className="mono mb-1 block text-[var(--fg-muted)]">{t(locale, "name")} *</span>
        <input required className={inputCls} value={form.name} onChange={set("name")} autoComplete="name" />
      </label>
      <label className="block">
        <span className="mono mb-1 block text-[var(--fg-muted)]">{t(locale, "phone")} *</span>
        <input required type="tel" dir="ltr" className={cn(inputCls, locale === "ar" && "text-right")} value={form.phone} onChange={set("phone")} autoComplete="tel" inputMode="tel" />
      </label>
      {showEmailField ? (
        <label className="block">
          <span className="mono mb-1 block text-[var(--fg-muted)]">{t(locale, "email")}</span>
          <input type="email" dir="ltr" className={cn(inputCls, locale === "ar" && "text-right")} value={form.email} onChange={set("email")} autoComplete="email" />
        </label>
      ) : null}
      {showServiceSelect ? (
        <label className="block">
          <span className="mono mb-1 block text-[var(--fg-muted)]">{t(locale, "service")}</span>
          <select className={inputCls} value={form.service} onChange={set("service")}>
            <option value="">{t(locale, "chooseService")}</option>
            {services.map((s) => (
              <option key={s.id} value={lt(s.title, locale)}>{lt(s.title, locale)}</option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="block sm:col-span-2">
        <span className="mono mb-1 block text-[var(--fg-muted)]">{t(locale, "message")}</span>
        <textarea rows={4} className={inputCls} value={form.message} onChange={set("message")} />
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={state === "sending"} className={cn("btn btn-lg", formMode === "whatsapp" ? "btn-whatsapp" : "btn-primary")}>
          {state === "sending" ? <LoaderCircle className="animate-spin" size={20} /> : formMode === "whatsapp" ? <MessageCircle size={20} /> : <Send size={20} />}
          <span>{state === "sending" ? t(locale, "sending") : formMode === "whatsapp" ? t(locale, "sendWhatsapp") : buttonLabel}</span>
          <span className="arrow">→</span>
        </button>
        {state === "error" ? <span className="font-bold text-red-600">{t(locale, "error")}</span> : null}
      </div>
    </form>
  );
}
