"use client";
import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { LText } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered, Link2, Undo2, Redo2, Quote, RemoveFormatting, Unlink } from "lucide-react";
import { useT, useAdminLang } from "./i18n";

function Btn({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); onClick(); }} className={cn("rounded-md p-1.5 text-slate-600 hover:bg-slate-200", active && "bg-[#233283]/10 text-[#233283]")}>
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange, dir = "ltr", placeholder }: { value: string; onChange: (html: string) => void; dir?: "rtl" | "ltr"; placeholder?: string }) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true } })],
    content: value || "",
    immediatelyRender: false,
    editorProps: { attributes: { class: "tiptap text-sm", dir } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // keep in sync if the value is replaced from outside (e.g. switching item)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || "") !== current && !(value === "" && current === "<p></p>")) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return <div className="h-40 animate-pulse rounded-xl bg-slate-100" />;
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev || "https://");
    if (url === null) return;
    if (!url) return editor.chain().focus().extendMarkRange("link").unsetLink().run();
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white focus-within:border-[#233283] focus-within:ring-2 focus-within:ring-[#233283]/15">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-100 px-1.5 py-1" dir="ltr">
        <Btn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></Btn>
        <Btn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></Btn>
        <Btn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline size={16} /></Btn>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <Btn title="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></Btn>
        <Btn title="Sub-heading" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={16} /></Btn>
        <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></Btn>
        <Btn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></Btn>
        <Btn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></Btn>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <Btn title="Link" active={editor.isActive("link")} onClick={setLink}><Link2 size={16} /></Btn>
        {editor.isActive("link") ? <Btn title="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}><Unlink size={16} /></Btn> : null}
        <Btn title="Clear formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}><RemoveFormatting size={16} /></Btn>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo2 size={16} /></Btn>
        <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo2 size={16} /></Btn>
      </div>
      <EditorContent editor={editor} />
      {placeholder && editor.isEmpty ? <div className="pointer-events-none -mt-8 px-4 pb-3 text-sm text-slate-400" dir={dir}>{placeholder}</div> : null}
    </div>
  );
}

/** Bilingual rich text: AR / EN tabs */
export function LRichTextField({ value, onChange, label, instanceKey }: { value: LText; onChange: (v: LText) => void; label?: string; instanceKey?: string }) {
  const t = useT();
  const adminLang = useAdminLang();
  const [lang, setLang] = useState<"ar" | "en">(adminLang);
  const v = value || { ar: "", en: "" };
  const order = adminLang === "ar" ? (["ar", "en"] as const) : (["en", "ar"] as const);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        {label ? <label className="a-label !mb-0">{label}</label> : <span />}
        <div className="flex rounded-lg bg-slate-100 p-0.5">
          {order.map((l) => (
            <button key={l} type="button" className={cn("rounded-md px-2 py-0.5 text-[11px] font-bold", lang === l ? "bg-white text-[#233283] shadow-sm" : "text-slate-500")} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <RichTextEditor key={`${instanceKey || ""}:${lang}`} value={v[lang] || ""} onChange={(html) => onChange({ ...v, [lang]: html })} dir={lang === "ar" ? "rtl" : "ltr"} placeholder={t({ en: "Write here…", ar: "اكتب هنا…" })} />
    </div>
  );
}
