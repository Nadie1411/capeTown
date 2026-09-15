import { notFound } from "next/navigation";
import { getPageById, getPages, getRenderContext } from "@/lib/content";
import { PageEditor } from "@/components/admin/page-editor";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [page, ctx, pages] = await Promise.all([getPageById(id), getRenderContext(), getPages()]);
  if (!page) notFound();
  return <PageEditor initialPage={page} ctx={{ ...ctx, pages }} />;
}
