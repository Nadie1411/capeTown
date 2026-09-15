import { getSettings } from "@/lib/content";
import { QrPage } from "./qr-page";

export const dynamic = "force-dynamic";

export default async function Qr() {
  const settings = await getSettings();
  const siteUrl = settings.seo.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "";
  return <QrPage siteUrl={siteUrl} brandColor={settings.brand.primaryColor} companyName={settings.brand.name} phone={settings.contact.phones[0]?.number || ""} />;
}
