"use client";
import { useMemo, useState } from "react";
import type { LText } from "@/lib/types";
import { Button, Card, Input, PageHeader, Switch, Tabs } from "@/components/admin/ui";
import { ColorField } from "@/components/admin/fields";
import { useT, useAdminLang } from "@/components/admin/i18n";
import { Download, Globe, Contact, Printer, TriangleAlert } from "lucide-react";

export function QrPage({ siteUrl, brandColor, companyName, phone }: { siteUrl: string; brandColor: string; companyName: LText; phone: string }) {
  const t = useT();
  const lang = useAdminLang();
  const [type, setType] = useState<"url" | "vcard">("url");
  const [url, setUrl] = useState(siteUrl);
  const [fg, setFg] = useState(brandColor);
  const [bg, setBg] = useState("#ffffff");
  const [logo, setLogo] = useState(true);
  const [transparent, setTransparent] = useState(false);
  const [size, setSize] = useState(1024);

  const query = useMemo(() => {
    const p = new URLSearchParams({ type, fg: fg.replace("#", ""), bg: bg.replace("#", ""), logo: logo ? "1" : "0", transparent: transparent ? "1" : "0", size: String(size) });
    if (type === "url") p.set("url", url);
    return p.toString();
  }, [type, url, fg, bg, logo, transparent, size]);
  const svgSrc = `/api/admin/qr?${query}&format=svg`;
  const pngSrc = `/api/admin/qr?${query}&format=png`;
  const localhost = /localhost|127\.0\.0\.1/.test(url) || !url;

  const download = (src: string, ext: string) => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `qr-${type}.${ext}`;
    a.click();
  };
  const print = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>QR</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif}img{width:60mm;height:60mm}p{text-align:center}</style></head><body><div><img src="${location.origin}${svgSrc}" onload="setTimeout(()=>print(),300)"/><p>${companyName[lang] || companyName.en}</p></div></body></html>`);
    w.document.close();
  };

  return (
    <>
      <PageHeader title={t({ en: "QR code for the business card", ar: "رمز QR لكرت الشركة" })} description={t({ en: "Scanning it opens the website (or saves the company contact). Download as SVG for the printer, or PNG.", ar: "عند مسحه يفتح الموقع (أو يحفظ جهة اتصال الشركة). حمّله SVG للمطبعة أو PNG." })} />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <Tabs className="mb-5" tabs={[{ value: "url", label: t({ en: "Website link", ar: "رابط الموقع" }), icon: <Globe size={14} /> }, { value: "vcard", label: t({ en: "Contact card (vCard)", ar: "بطاقة اتصال (vCard)" }), icon: <Contact size={14} /> }]} value={type} onChange={setType} />
          <div className="grid gap-4">
            {type === "url" ? (
              <div>
                <label className="a-label">{t({ en: "Link the QR opens", ar: "الرابط الذي يفتحه الرمز" })}</label>
                <Input dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-domain.com" />
                {localhost ? <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800"><TriangleAlert size={14} className="mt-0.5 flex-none" />{t({ en: "This is a local address. Set the public site URL in Settings → SEO before printing.", ar: "هذا عنوان محلي. أدخل رابط الموقع العام في الإعدادات ← SEO قبل الطباعة." })}</p> : null}
              </div>
            ) : (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{t({ en: `The contact card includes the company name, phone numbers, email, address and website. Phone: ${phone || "—"}`, ar: `تتضمن بطاقة الاتصال اسم الشركة والأرقام والبريد والعنوان والموقع. الهاتف: ${phone || "—"}` })}</p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField label={t({ en: "Code color", ar: "لون الرمز" })} value={fg} onChange={(v) => setFg(v || brandColor)} allowEmpty={false} />
              <ColorField label={t({ en: "Background", ar: "الخلفية" })} value={bg} onChange={(v) => setBg(v || "#ffffff")} allowEmpty={false} />
            </div>
            <div className="grid gap-2 rounded-xl border border-slate-200 px-3 py-1 sm:grid-cols-2">
              <Switch label={t({ en: "Logo in the middle", ar: "الشعار في المنتصف" })} checked={logo} onChange={setLogo} />
              <Switch label={t({ en: "Transparent background (PNG)", ar: "خلفية شفافة (PNG)" })} checked={transparent} onChange={setTransparent} />
            </div>
            <div>
              <label className="a-label">{t({ en: "PNG size (pixels)", ar: "حجم PNG (بكسل)" })}</label>
              <Input type="number" dir="ltr" min={256} max={2048} step={128} value={size} onChange={(e) => setSize(Number(e.target.value) || 1024)} />
            </div>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-xs rounded-2xl border border-slate-200 p-4" style={{ background: transparent ? "repeating-conic-gradient(#e2e8f0 0 25%, #fff 0 50%) 50%/16px 16px" : bg }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={svgSrc} alt="QR" className="w-full" />
            </div>
            <div className="grid w-full max-w-xs gap-2">
              <Button variant="primary" onClick={() => download(svgSrc, "svg")}><Download size={15} /> SVG — {t({ en: "for print", ar: "للطباعة" })}</Button>
              <Button onClick={() => download(pngSrc, "png")}><Download size={15} /> PNG</Button>
              <Button variant="ghost" onClick={print}><Printer size={15} /> {t({ en: "Print test", ar: "طباعة تجريبية" })}</Button>
            </div>
            <p className="text-center text-xs text-slate-500">{t({ en: "Keep at least 2 cm wide on the card and test with a phone camera before printing.", ar: "اجعل عرضه 2 سم على الأقل على الكرت، وجرّبه بكاميرا الهاتف قبل الطباعة." })}</p>
          </div>
        </Card>
      </div>
    </>
  );
}
