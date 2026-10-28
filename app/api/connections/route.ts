import { authenticatedOwner } from "@/server/auth";
import { checkConnections } from "@/server/connections";
import { runtimeEnv } from "@/lib/runtime";
import { rateLimit } from "@/lib/rate-limit";
import { privateHeaders, sameOrigin } from "@/server/http";
import { availableModels } from "@/server/model-provider";
export const runtime = "nodejs";
export const maxDuration = 45;
export async function GET(request: Request) {
  let owner: string;
  try {
    owner = await authenticatedOwner(request);
  } catch {
    return Response.json(
      { error: "Sign in to inspect available models." },
      { status: 401, headers: privateHeaders },
    );
  }
  try {
    rateLimit(`model-catalogue:${owner}`, 3);
  } catch {
    return Response.json(
      { error: "Wait one minute before listing models again." },
      { status: 429, headers: privateHeaders },
    );
  }
  try {
    const models = await availableModels(runtimeEnv());
    return Response.json(
      {
        models,
        checkedAt: new Date().toISOString(),
        limitation:
          "A listed model still needs a tool-call check and event workflow test.",
      },
      { headers: privateHeaders },
    );
  } catch {
    return Response.json(
      {
        error:
          "Could not read the configured provider's model catalogue. Check its HTTPS base and key access.",
      },
      { status: 400, headers: privateHeaders },
    );
  }
}
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
