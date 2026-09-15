"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PageData } from "@/lib/types";
import { formatDate, slugify } from "@/lib/utils";
import { Badge, Button, Card, Input, Modal, PageHeader, Select, api, useConfirm, useToast } from "@/components/admin/ui";
import { LTextField } from "@/components/admin/fields";
import { useT, useAdminLang } from "@/components/admin/i18n";
import { Plus, Pencil, Trash2, Home, ExternalLink } from "lucide-react";

export function PagesList({ pages }: { pages: PageData[] }) {
  const t = useT();
  const lang = useAdminLang();
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState({ ar: "", en: "" });
  const [slug, setSlug] = useState("");
  const [template, setTemplate] = useState<"standard" | "blank">("standard");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    try {
      const d = await api<{ page: PageData }>("/api/admin/pages", { method: "POST", json: { slug: slug || slugify(title.en || title.ar), title, template } });
      router.push(`/admin/pages/${d.page.id}`);
    } catch (e: any) {
      toast(e.message, "error");
      setBusy(false);
    }
  };
  const remove = async (p: PageData) => {
    if (!(await confirm(t({ en: `Delete the page "${p.title.en || p.title.ar}"? This cannot be undone.`, ar: `حذف صفحة "${p.title.ar || p.title.en}"؟ لا يمكن التراجع.` })))) return;
    try {
      await api(`/api/admin/pages/${p.id}`, { method: "DELETE" });
      toast(t({ en: "Page deleted", ar: "تم حذف الصفحة" }));
      router.refresh();
    } catch (e: any) {
      toast(e.message, "error");
    }
  };
  const setHome = async (p: PageData) => {
    await api(`/api/admin/pages/${p.id}`, { method: "PUT", json: { isHome: true } });
    toast(t({ en: "Home page updated", ar: "تم تحديث الصفحة الرئيسية" }));
    router.refresh();
  };

  return (
    <>
      <PageHeader title={t({ en: "Pages & layout", ar: "الصفحات والتصميم" })} description={t({ en: "Every page is built from sections you can add, reorder, restyle and edit — with a live preview.", ar: "كل صفحة مكوّنة من أقسام يمكنك إضافتها وترتيبها وتنسيقها وتعديلها — مع معاينة مباشرة." })} actions={<Button variant="primary" onClick={() => setOpen(true)}><Plus size={16} /> {t({ en: "New page", ar: "صفحة جديدة" })}</Button>} />
      <Card padded={false}>
        <table className="w-full text-sm">
          <thead className="text-start text-xs uppercase tracking-wide text-slate-500">
            <tr className="border-b border-slate-100">
              <th className="px-5 py-3 text-start">{t({ en: "Page", ar: "الصفحة" })}</th>
              <th className="px-5 py-3 text-start">{t({ en: "URL", ar: "الرابط" })}</th>
              <th className="px-5 py-3 text-start">{t({ en: "Sections", ar: "الأقسام" })}</th>
              <th className="px-5 py-3 text-start">{t({ en: "Status", ar: "الحالة" })}</th>
              <th className="px-5 py-3 text-start">{t({ en: "Updated", ar: "آخر تعديل" })}</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pages.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/60">
                <td className="px-5 py-3">
                  <a href={`/admin/pages/${p.id}`} className="font-bold text-slate-900 hover:underline">{p.title[lang] || p.title.en || p.title.ar}</a>
                  {p.isHome ? <Badge tone="blue"><Home size={11} /> {t({ en: "Home", ar: "الرئيسية" })}</Badge> : null}
                </td>
                <td className="px-5 py-3 text-slate-500" dir="ltr">/{p.isHome ? "" : p.slug}</td>
                <td className="px-5 py-3 text-slate-500">{p.blocks.length}</td>
                <td className="px-5 py-3">{p.published ? <Badge tone="green">{t({ en: "Published", ar: "منشورة" })}</Badge> : <Badge tone="amber">{t({ en: "Draft", ar: "مسودة" })}</Badge>}</td>
                <td className="px-5 py-3 text-slate-500">{p.updatedAt ? formatDate(p.updatedAt, lang) : ""}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <a href={p.isHome ? "/" : `/${p.slug}`} target="_blank" className="a-btn a-btn-ghost a-btn-sm" title={t({ en: "Open", ar: "فتح" })}><ExternalLink size={14} /></a>
                    {!p.isHome ? <Button size="sm" variant="ghost" onClick={() => setHome(p)} title={t({ en: "Set as home page", ar: "تعيين كصفحة رئيسية" })}><Home size={14} /></Button> : null}
                    <a href={`/admin/pages/${p.id}`} className="a-btn a-btn-secondary a-btn-sm"><Pencil size={14} /> {t({ en: "Edit", ar: "تعديل" })}</a>
                    {!p.isHome ? <Button size="sm" variant="ghost" className="!text-rose-600" onClick={() => remove(p)}><Trash2 size={14} /></Button> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={t({ en: "New page", ar: "صفحة جديدة" })} size="sm" footer={<><Button onClick={() => setOpen(false)}>{t({ en: "Cancel", ar: "إلغاء" })}</Button><Button variant="primary" loading={busy} disabled={!title.en && !title.ar} onClick={create}>{t({ en: "Create", ar: "إنشاء" })}</Button></>}>
        <div className="grid gap-4">
          <LTextField label={t({ en: "Title", ar: "العنوان" })} value={title} onChange={(v) => { setTitle(v); if (!slug) setSlug(slugify(v.en || "")); }} />
          <div>
            <label className="a-label">{t({ en: "URL slug", ar: "رابط الصفحة" })}</label>
            <div className="flex items-center gap-1" dir="ltr"><span className="text-slate-400">/</span><Input value={slug} onChange={(e) => setSlug(slugify(e.target.value) || e.target.value)} placeholder={slugify(title.en) || "my-page"} /></div>
          </div>
          <div>
            <label className="a-label">{t({ en: "Start with", ar: "ابدأ بـ" })}</label>
            <Select value={template} onChange={(e) => setTemplate(e.target.value as any)} options={[{ value: "standard", label: t({ en: "Page header + text section", ar: "رأس صفحة + قسم نصي" }) }, { value: "blank", label: t({ en: "Empty page", ar: "صفحة فارغة" }) }]} />
          </div>
        </div>
      </Modal>
      {dialog}
    </>
  );
}
