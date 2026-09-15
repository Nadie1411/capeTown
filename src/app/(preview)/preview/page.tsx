import { getSession } from "@/lib/auth";
import { getRenderContext } from "@/lib/content";
import { PreviewClient } from "./preview-client";

export const dynamic = "force-dynamic";

export default async function PreviewPage() {
  const session = await getSession();
  if (!session) return <div className="p-10 text-center">Unauthorized</div>;
  const ctx = await getRenderContext();
  return <PreviewClient settings={ctx.settings} services={ctx.services} projects={ctx.projects} />;
}
