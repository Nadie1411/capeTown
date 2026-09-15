"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { X, LoaderCircle, CircleCheck, TriangleAlert, Info } from "lucide-react";
import { useT } from "./i18n";

/* ------------------------------ buttons & inputs ------------------------------ */

export function Button({ variant = "secondary", size, loading, className, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "icon"; loading?: boolean }) {
  return (
    <button className={cn("a-btn", `a-btn-${variant}`, size === "sm" && "a-btn-sm", size === "icon" && "a-btn-icon", className)} disabled={loading || rest.disabled} {...rest}>
      {loading ? <LoaderCircle size={16} className="animate-spin" /> : null}
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("a-input", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("a-input", props.className)} />;
}

export function Select({ options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <select {...props} className={cn("a-input", props.className)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function Switch({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label?: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1">
      {label ? (
        <span>
          <span className="block text-[13px] font-semibold text-slate-700">{label}</span>
          {description ? <span className="block text-xs text-slate-500">{description}</span> : null}
        </span>
      ) : null}
      <button type="button" role="switch" aria-checked={checked} className="a-switch" data-on={checked} onClick={() => onChange(!checked)} />
    </label>
  );
}

export function Field({ label, help, children, className, required }: { label?: string; help?: string; children: React.ReactNode; className?: string; required?: boolean }) {
  return (
    <div className={className}>
      {label ? <label className="a-label">{label}{required ? <span className="text-rose-500"> *</span> : null}</label> : null}
      {children}
      {help ? <p className="mt-1 text-xs text-slate-500">{help}</p> : null}
    </div>
  );
}

export function Card({ className, children, title, actions, padded = true }: { className?: string; children: React.ReactNode; title?: React.ReactNode; actions?: React.ReactNode; padded?: boolean }) {
  return (
    <section className={cn("a-card", className)}>
      {title || actions ? (
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h3 className="text-[15px] font-bold text-slate-800">{title}</h3>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
      ) : null}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, description, actions, back }: { title: string; description?: string; actions?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back ? <a href={back.href} className="mb-1 inline-block text-xs font-semibold text-slate-500 hover:text-slate-800">← {back.label}</a> : null}
        <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: { value: T; label: string; icon?: React.ReactNode; badge?: number }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1", className)} role="tablist">
      {tabs.map((t) => (
        <button key={t.value} role="tab" aria-selected={t.value === value} className="a-tab inline-flex items-center gap-1.5" data-active={t.value === value} onClick={() => onChange(t.value)}>
          {t.icon}
          {t.label}
          {t.badge ? <span className="rounded-full bg-rose-500 px-1.5 text-[10px] text-white">{t.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" | "amber" | "rose" | "blue" }) {
  const tones = { slate: "bg-slate-100 text-slate-700", green: "bg-emerald-100 text-emerald-800", amber: "bg-amber-100 text-amber-800", rose: "bg-rose-100 text-rose-800", blue: "bg-blue-100 text-blue-800" };
  return <span className={cn("a-chip", tones[tone])}>{children}</span>;
}

export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
      {icon ? <div className="mb-3 text-slate-400">{icon}</div> : null}
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/* ------------------------------ modal ------------------------------ */

export function Modal({ open, onClose, title, children, footer, size = "md" }: { open: boolean; onClose: () => void; title?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; size?: "sm" | "md" | "lg" | "xl" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  const w = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-6xl" }[size];
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cn("flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl", w)} role="dialog" aria-modal="true">
        {title ? (
          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <h3 className="text-[15px] font-bold text-slate-800">{title}</h3>
            <button className="a-btn a-btn-ghost a-btn-icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
          </header>
        ) : null}
        <div className="a-scroll min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
        {footer ? <footer className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">{footer}</footer> : null}
      </div>
    </div>
  );
}

export function useConfirm() {
  const t = useT();
  const [state, setState] = useState<{ message: string; resolve: (v: boolean) => void } | null>(null);
  const confirm = useCallback((message: string) => new Promise<boolean>((resolve) => setState({ message, resolve })), []);
  const dialog = state ? (
    <Modal open onClose={() => { state.resolve(false); setState(null); }} size="sm" footer={<><Button onClick={() => { state.resolve(false); setState(null); }}>{t({ en: "Cancel", ar: "إلغاء" })}</Button><Button variant="danger" onClick={() => { state.resolve(true); setState(null); }}>{t({ en: "Yes, continue", ar: "نعم، متابعة" })}</Button></>}>
      <div className="flex items-start gap-3"><TriangleAlert className="mt-0.5 flex-none text-amber-500" /><p className="text-sm text-slate-700">{state.message}</p></div>
    </Modal>
  ) : null;
  return { confirm, dialog };
}

/* ------------------------------ toast ------------------------------ */

type Toast = { id: number; text: string; tone: "success" | "error" | "info" };
const ToastCtx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const idRef = useRef(1);
  const push = useCallback((text: string, tone: Toast["tone"] = "success") => {
    const id = idRef.current++;
    setItems((s) => [...s, { id, text, tone }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[120] flex -translate-x-1/2 flex-col gap-2">
        {items.map((i) => (
          <div key={i.id} className={cn("pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg", i.tone === "success" && "bg-emerald-600", i.tone === "error" && "bg-rose-600", i.tone === "info" && "bg-slate-800")}>
            {i.tone === "success" ? <CircleCheck size={16} /> : i.tone === "error" ? <TriangleAlert size={16} /> : <Info size={16} />}
            {i.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}

/* ------------------------------ fetch helper ------------------------------ */

export async function api<T = any>(url: string, init?: RequestInit & { json?: any }): Promise<T> {
  const { json, ...rest } = init || {};
  const res = await fetch(url, {
    ...rest,
    headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...(rest.headers || {}) },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}
