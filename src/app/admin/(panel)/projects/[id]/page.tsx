import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getProjects, getServices, getSettings, mapProject } from "@/lib/content";
import { CollectionEditor } from "@/components/admin/collection";

export const dynamic = "force-dynamic";

export default async function ProjectEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [settings, services, projects] = await Promise.all([getSettings(), getServices(false), getProjects(false)]);
  let item = null;
  if (id !== "new") {
    const row = await prisma.project.findUnique({ where: { id } });
    if (!row) notFound();
    item = mapProject(row);
  }
  return <CollectionEditor kind="project" item={item} categories={settings.projectCategories} services={services} projects={projects} />;
}
