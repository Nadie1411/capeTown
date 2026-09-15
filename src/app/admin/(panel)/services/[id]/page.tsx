import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getProjects, getServices, getSettings, mapService } from "@/lib/content";
import { CollectionEditor } from "@/components/admin/collection";

export const dynamic = "force-dynamic";

export default async function ServiceEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [settings, services, projects] = await Promise.all([getSettings(), getServices(false), getProjects(false)]);
  let item = null;
  if (id !== "new") {
    const row = await prisma.service.findUnique({ where: { id } });
    if (!row) notFound();
    item = mapService(row);
  }
  return <CollectionEditor kind="service" item={item} categories={settings.projectCategories} services={services} projects={projects} />;
}
