import { getProjects } from "@/lib/content";
import { handle, ok, parseBody } from "@/lib/api";
import { createProject, projectSchema } from "@/lib/api-collections";

export const GET = handle(async () => ok({ projects: await getProjects(false) }));

export const POST = handle(async (req) => {
  const parsed = await parseBody(req, projectSchema);
  if ("error" in parsed) return parsed.error;
  return ok({ project: await createProject(parsed.data) });
});
