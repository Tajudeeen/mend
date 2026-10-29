import { z } from "zod";
import { supabaseServer } from "@/server/auth";
import { organizerProfile } from "@/server/organizer-profile";
import { runtimeEnv } from "@/lib/runtime";
import { rateLimit } from "@/lib/rate-limit";
import { privateHeaders, sameOrigin, smallJson } from "@/server/http";
export const runtime = "nodejs";
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: privateHeaders });
const schema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[^\p{Cc}]+$/u),
    organization: z
      .string()
      .trim()
      .max(100)
      .regex(/^[^\p{Cc}]*$/u),
  })
  .strict();
export async function GET(request: Request) {
  if (runtimeEnv().MEND_SITE_COMPAT) {
    if (!request.headers.get("oai-authenticated-user-id"))
      return json({ error: "Sign in to view your profile." }, 401);
    // Compatibility identities are managed by their host, never by Supabase.
    return json({
      profile: {
        displayName: "ChatGPT organizer",
        organization: "",
        email: "",
        editable: false,
      },
    });
  }
  try {
    const client = await supabaseServer();
    const { data, error } = await client.auth.getUser();
    if (error || !data.user)
      return json({ error: "Sign in to view your profile." }, 401);
    return json({ profile: organizerProfile(data.user) });
  } catch {
    return json(
      { error: "Could not load your organizer profile. Try again." },
      503,
    );
  }
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return json({ error: "Cross-origin request refused." }, 403);
  if (runtimeEnv().MEND_SITE_COMPAT)
    return json(
      { error: "Your identity is managed by ChatGPT on this deployment." },
      409,
    );
  try {
    const client = await supabaseServer();
    const { data, error } = await client.auth.getUser();
    if (error || !data.user)
      return json({ error: "Sign in to edit your profile." }, 401);
    try {
      rateLimit(`profile:${data.user.id}`, 10);
    } catch {
      return json(
        { error: "Wait one minute before saving your profile again." },
        429,
      );
    }
    const input = schema.safeParse(await smallJson(request));
    if (!input.success)
      return json(
        {
          error:
            "Enter a name of 1–80 characters and an organization of up to 100 characters.",
        },
        400,
      );
    const result = await client.auth.updateUser({
      data: {
        display_name: input.data.displayName,
        organization: input.data.organization,
      },
    });
    if (result.error || !result.data.user)
      return json({ error: "Could not save your profile. Try again." }, 502);
    return json({ profile: organizerProfile(result.data.user) });
  } catch {
    return json({ error: "Could not save your profile. Try again." }, 400);
  }
}
