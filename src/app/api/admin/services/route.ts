import { getServices } from "@/lib/content";
import { handle, ok, parseBody } from "@/lib/api";
import { createService, serviceSchema } from "@/lib/api-collections";

export const GET = handle(async () => ok({ services: await getServices(false) }));

export const POST = handle(async (req) => {
  const parsed = await parseBody(req, serviceSchema);
  if ("error" in parsed) return parsed.error;
  return ok({ service: await createService(parsed.data) });
});
