import { getServices, getSettings } from "@/lib/content";
import { CollectionList } from "@/components/admin/collection";

export const dynamic = "force-dynamic";

export default async function ServicesAdmin() {
  const [services, settings] = await Promise.all([getServices(false), getSettings()]);
  return <CollectionList kind="service" items={services} categories={settings.projectCategories} />;
}
