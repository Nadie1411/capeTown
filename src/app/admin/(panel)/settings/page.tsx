import { getHomePage, getSettings } from "@/lib/content";
import { SettingsPage } from "./settings-page";

export const dynamic = "force-dynamic";

export default async function Settings({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [{ tab }, settings, home] = await Promise.all([searchParams, getSettings(), getHomePage()]);
  return <SettingsPage initial={settings} initialTab={tab} previewBlocks={home?.blocks || []} />;
}
