import { authenticatedOwner } from "@/server/auth";
import { verifyPostgresIsolation } from "@/server/postgres";
import { runtimeEnv } from "@/lib/runtime";
import { rateLimit } from "@/lib/rate-limit";
import { sameOrigin, privateHeaders } from "@/server/http";
export const runtime = "nodejs";
export const maxDuration = 30;
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: privateHeaders });
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return json({ error: "Cross-origin request refused." }, 403);
  let owner: string;
  try {
    owner = await authenticatedOwner(request);
  } catch {
    return json({ error: "Sign in to check private storage." }, 401);
  }
  if (runtimeEnv().MEND_SITE_COMPAT)
    return json(
      {
        error:
          "This check is for the PostgreSQL deployment. Worker/D1 verification is separate.",
      },
      409,
    );
  try {
    rateLimit(`storage-probe:${owner}`, 1);
    rateLimit("storage-probe:global", 3);
  } catch {
    return json(
      { error: "Wait one minute before another storage check." },
      429,
    );
  }
  try {
    return json(await verifyPostgresIsolation());
  } catch {
    return json(
      {
        error:
          "The storage isolation check did not pass. No organizer records were targeted; inspect the runtime role and RLS configuration.",
      },
      503,
    );
  }
}
