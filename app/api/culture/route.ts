import { z } from "zod";
import { authenticatedOwner } from "@/server/auth";
import { runtimeEnv } from "@/lib/runtime";
import { rateLimit } from "@/lib/rate-limit";
import { search, searchTags, discover } from "@/lib/qloo";
export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin)
      return Response.json(
        { error: "Cross-origin request refused." },
        { status: 403 },
      );
    const user = await authenticatedOwner(request);
    rateLimit(user + ":culture", 12);
    const b = (await request.json()) as Record<string, unknown>,
      env = runtimeEnv();
    if (b.action === "tags")
      return Response.json({
        results: await searchTags(
          env,
          z.string().min(2).max(80).parse(b.query),
        ),
      });
    if (b.action === "discover")
      return Response.json(
        await discover(
          env,
          z.array(z.string().uuid()).min(1).max(8).parse(b.seeds),
          z.enum(["artist", "vendor"]).parse(b.kind),
          z.string().min(2).max(80).parse(b.city),
        ),
      );
    return Response.json({
      results: await search(
        env,
        z.string().min(2).max(80).parse(b.query),
        z.enum(["artist", "vendor", "brand"]).parse(b.kind),
      ),
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Request failed." },
      { status: 400 },
    );
  }
}
