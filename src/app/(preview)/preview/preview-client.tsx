"use client";
import { useEffect, useState } from "react";
import type { Block, Locale, ProjectData, ServiceData, SiteSettings } from "@/lib/types";
import { normalizeBlocks } from "@/blocks/registry";
import { mergeSettings } from "@/lib/settings-defaults";
import { PageRenderer } from "@/blocks/render";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { FloatingButtons } from "@/components/site/floating";
import { RevealObserver } from "@/components/site/reveal";
import { fontHref, pageFonts, themeVars } from "@/lib/theme";
import { dirOf } from "@/lib/i18n";

interface PreviewState {
  blocks: Block[];
  settings: SiteSettings;
  locale: Locale;
  selectedId: string | null;
  showChrome: boolean;
  pageTitle?: { ar: string; en: string };
}

export function PreviewClient({ settings, services, projects }: { settings: SiteSettings; services: ServiceData[]; projects: ProjectData[] }) {
  const [state, setState] = useState<PreviewState>({ blocks: [], settings, locale: "en", selectedId: null, showChrome: true });
  const [data, setData] = useState({ services, projects });

  useEffect(() => {
    let acknowledged = false;
    const onMsg = (e: MessageEvent) => {
      const msg = e.data;
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "cape:preview") {
        acknowledged = true;
        setState((s) => ({
          ...s,
          blocks: msg.blocks ? normalizeBlocks(msg.blocks) : s.blocks,
          settings: msg.settings ? mergeSettings(msg.settings) : s.settings,
          locale: msg.locale || s.locale,
          selectedId: msg.selectedId === undefined ? s.selectedId : msg.selectedId,
          showChrome: msg.showChrome === undefined ? s.showChrome : msg.showChrome,
          pageTitle: msg.pageTitle || s.pageTitle,
        }));
      }
      if (msg.type === "cape:data") setData({ services: msg.services || services, projects: msg.projects || projects });
      if (msg.type === "cape:scrollTo" && msg.id) {
        document.querySelector(`[data-block-id="${msg.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("message", onMsg);
    // keep announcing until the parent editor answers (it may still be loading)
    const announce = () => window.parent?.postMessage({ type: "cape:ready" }, "*");
    announce();
    const timer = setInterval(() => { if (acknowledged) clearInterval(timer); else announce(); }, 400);
    return () => { window.removeEventListener("message", onMsg); clearInterval(timer); };
  }, [services, projects]);

  // apply theme + direction to the document
  useEffect(() => {
    const vars = themeVars(state.settings, state.locale);
    const el = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v));
    el.setAttribute("lang", state.locale);
    el.setAttribute("dir", dirOf(state.locale));
    document.body.setAttribute("dir", dirOf(state.locale));
    let link = document.getElementById("preview-font") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = "preview-font";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    const href = fontHref(...pageFonts(state.settings, state.locale));
    if (link.href !== href) link.href = href;
  }, [state.settings, state.locale]);

  // click to select block, block link navigation
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (a) e.preventDefault();
      const blockEl = (e.target as HTMLElement).closest("[data-block-id]") as HTMLElement | null;
      if (blockEl) window.parent?.postMessage({ type: "cape:select", id: blockEl.dataset.blockId }, "*");
    };
    document.addEventListener("click", onClick, true);
    const onSubmit = (e: Event) => e.preventDefault();
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  const ctx = { locale: state.locale, settings: state.settings, services: data.services, projects: data.projects, preview: true, pageTitle: state.pageTitle };
  return (
    <div className="site-root flex min-h-screen flex-col" dir={dirOf(state.locale)}>
      <RevealObserver />
      <style>{`
        [data-block-id] { position: relative; cursor: pointer; }
        [data-block-id]:hover { outline: 2px dashed rgba(35,50,131,.45); outline-offset: -2px; }
        ${state.selectedId ? `[data-block-id="${state.selectedId}"] { outline: 3px solid #d4a12a !important; outline-offset: -3px; }` : ""}
      `}</style>
      {state.showChrome ? <SiteHeader settings={state.settings} locale={state.locale} /> : null}
      <main className="flex-1">
        {state.blocks.length ? <PageRenderer blocks={state.blocks} ctx={ctx} /> : <div className="p-20 text-center text-[var(--c-muted)]">{state.locale === "ar" ? "أضف أول قسم من القائمة" : "Add your first block from the list"}</div>}
      </main>
      {state.showChrome ? (
        <>
          <SiteFooter settings={state.settings} locale={state.locale} services={data.services} />
          <FloatingButtons settings={state.settings} locale={state.locale} />
        </>
      ) : null}
    </div>
  );
}
