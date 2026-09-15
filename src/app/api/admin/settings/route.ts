import { getSettings, saveSettings } from "@/lib/content";
import { handle, ok, bad } from "@/lib/api";

export const GET = handle(async () => ok({ settings: await getSettings() }));

export const PUT = handle(async (req) => {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON");
  }
  if (!body || typeof body !== "object") return bad("Invalid settings");
  const settings = await saveSettings(body.settings ?? body);
  return ok({ settings });
});
