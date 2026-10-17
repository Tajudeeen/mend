import { z } from "zod";
import { authenticatedOwner, supabaseServer } from "@/server/auth";
import { runtimeEnv } from "@/lib/runtime";
import { privateHeaders, sameOrigin, smallJson } from "@/server/http";
export const runtime = "nodejs";
const credentials = {
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
};
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("signin"), ...credentials }),
  z.object({
    action: z.literal("signup"),
    ...credentials,
    password: z.string().min(8).max(128),
  }),
  z.object({ action: z.literal("signout") }),
]);
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: privateHeaders });
export async function GET(request: Request) {
  try {
    await authenticatedOwner(request);
    return json({ signedIn: true });
  } catch {
    return json({ signedIn: false });
  }
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return json({ error: "Cross-origin request refused." }, 403);
  if (runtimeEnv().MEND_SITE_COMPAT)
    return json({ error: "This deployment uses Sign in with ChatGPT." }, 409);
  let input: z.infer<typeof schema>;
  try {
    input = schema.parse(await smallJson(request));
  } catch {
    return json(
      {
        error:
          "Enter a valid email and password. New accounts require at least 8 password characters.",
      },
      400,
    );
  }
  try {
    const client = await supabaseServer();
    if (input.action === "signout") {
      const { error } = await client.auth.signOut({ scope: "local" });
      return error
        ? json({ error: "Could not sign out. Try again." }, 502)
        : json({ ok: true });
    }
    const { email, password } = input;
    const result =
      input.action === "signin"
        ? await client.auth.signInWithPassword({ email, password })
        : await client.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: new URL(
                "/auth/callback",
                request.url,
              ).toString(),
            },
          });
    if (result.error)
      return json(
        { error: result.error.message },
        result.error.status === 429 ? 429 : 400,
      );
    return json({ ok: true, confirmationRequired: !result.data.session });
  } catch {
    return json(
      {
        error:
          "Authentication is unavailable. Check the server's Supabase connection.",
      },
      503,
    );
  }
}
