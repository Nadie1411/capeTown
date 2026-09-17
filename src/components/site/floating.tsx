"use client";
import { useEffect, useState } from "react";
import type { Locale, SiteSettings } from "@/lib/types";
import { lt, t } from "@/lib/i18n";
import { cn, telHref, waHref } from "@/lib/utils";
import { ArrowUp, Phone } from "lucide-react";
import { SOCIAL_ICONS } from "./social-icons";

/**
 * Desktop: a single WhatsApp bubble (+ optional call bubble) and a back-to-top button.
 * Mobile: when the bottom bar is enabled it is the ONLY contact control shown (no duplicate bubbles).
 */
export function FloatingButtons({ settings, locale }: { settings: SiteSettings; locale: Locale }) {
  const f = settings.floating;
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const on = () => setShowTop(window.scrollY > 600);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const phone = settings.contact.phones[0]?.number;
  const wa = settings.contact.whatsapp;
  const side = f.position === "start" ? "start-5" : "end-5";
  const bar = f.mobileBar && (phone || wa);
  return (
    <>
      <div className={cn("fixed bottom-5 z-40 flex flex-col items-center gap-3", side, bar && "max-md:hidden")}>
        {f.whatsapp && wa ? (
          <a href={waHref(wa, lt(settings.contact.whatsappMessage, locale))} target="_blank" rel="noopener" className="flex h-13 w-13 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition hover:scale-105 [&_svg]:h-6 [&_svg]:w-6" aria-label={t(locale, "whatsapp")}>
            {SOCIAL_ICONS.whatsapp.icon}
          </a>
        ) : null}
        {f.call && phone ? (
          <a href={telHref(phone)} className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--c-primary)] text-white shadow-lg transition hover:scale-105" aria-label={t(locale, "callNow")}>
            <Phone size={26} />
          </a>
        ) : null}
        {f.backToTop ? (
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--c-primary)] shadow ring-1 ring-black/10 backdrop-blur transition", showTop ? "opacity-100" : "pointer-events-none opacity-0")} aria-label={t(locale, "backToTop")}>
            <ArrowUp size={20} />
          </button>
        ) : null}
      </div>
      {bar ? (
        <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-black/10 bg-white/95 p-2 backdrop-blur md:hidden" style={{ paddingBottom: "max(.5rem, env(safe-area-inset-bottom))" }}>
          {phone ? <a href={telHref(phone)} className="btn btn-primary"><Phone size={22} />{t(locale, "callNow")}</a> : null}
          {wa ? <a href={waHref(wa, lt(settings.contact.whatsappMessage, locale))} target="_blank" rel="noopener" className="btn btn-whatsapp [&_svg]:h-6 [&_svg]:w-6">{SOCIAL_ICONS.whatsapp.icon}{t(locale, "whatsapp")}</a> : null}
        </div>
      ) : null}
    </>
  );
}
