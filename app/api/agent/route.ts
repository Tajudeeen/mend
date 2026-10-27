import { smallJson, privateHeaders, RequestBodyError } from "@/server/http";
import { z } from "zod";
import { authenticatedOwner } from "@/server/auth";
import { runtimeEnv } from "@/lib/runtime";
import { loadEvent, saveEvent, auditFor } from "@/lib/repository";
import { rateLimit } from "@/lib/rate-limit";
import { investigate } from "@/server/agent";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin)
      return Response.json(
        { error: "Cross-origin request refused." },
        { status: 403 },
      );
    const user = await authenticatedOwner(request);
    rateLimit(user + ":agent", 4);
    const b = z
      .object({
        id: z.string().uuid(),
        revision: z.number().int(),
        instruction: z.string().min(5).max(1500),
      })
      .parse(await smallJson(request, 5000));
    const before = await loadEvent(user, b.id);
    if (before.revision !== b.revision)
      throw new Error("The event changed. Reload before investigating.");
    const result = await investigate(before, b.instruction, runtimeEnv());
    const event = await saveEvent(
      user,
      before,
      result.event,
      "agent.run",
      `Run ${result.run.id}: ${result.run.state}. Active assignments unchanged.`,
    );
    return Response.json(
      { event, audit: await auditFor(user, b.id), run: result.run },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Investigation failed." },
      {
        status: e instanceof RequestBodyError ? e.status : 400,
        headers: privateHeaders,
      },
    );
  }
}
