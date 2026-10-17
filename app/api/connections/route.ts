import { authenticatedOwner } from "@/server/auth";
import { checkConnections } from "@/server/connections";
import { runtimeEnv } from "@/lib/runtime";
import { rateLimit } from "@/lib/rate-limit";
import { privateHeaders, sameOrigin } from "@/server/http";
export const runtime = "nodejs";
export const maxDuration = 45;
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json(
      { error: "Cross-origin request refused." },
      { status: 403, headers: privateHeaders },
    );
  let owner: string;
  try {
    owner = await authenticatedOwner(request);
  } catch {
    return Response.json(
      { error: "Sign in to test connections." },
      { status: 401, headers: privateHeaders },
    );
  }
  try {
    rateLimit(`connections:${owner}`, 3);
  } catch {
    return Response.json(
      { error: "Wait one minute before another connection check." },
      { status: 429, headers: privateHeaders },
    );
  }
  return Response.json(await checkConnections(runtimeEnv()), {
    headers: privateHeaders,
  });
}
