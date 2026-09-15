import { getPages } from "@/lib/content";
import { PagesList } from "./pages-list";

export const dynamic = "force-dynamic";

export default async function PagesPage() {
  const pages = await getPages();
  return <PagesList pages={pages} />;
}
