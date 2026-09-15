import { getProjects, getSettings } from "@/lib/content";
import { CollectionList } from "@/components/admin/collection";

export const dynamic = "force-dynamic";

export default async function ProjectsAdmin() {
  const [projects, settings] = await Promise.all([getProjects(false), getSettings()]);
  return <CollectionList kind="project" items={projects} categories={settings.projectCategories} />;
}
