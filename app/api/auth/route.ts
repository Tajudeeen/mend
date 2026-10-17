import { z } from "zod";
import { supabaseServer } from "@/server/auth";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin)
      return Response.json(
        { error: "Cross-origin request refused." },
        { status: 403 },
      );
    const input = z
      .object({
        email: z.string().email(),
        password: z.string().min(8).max(128),
        action: z.enum(["signin", "signup"]),
      })
      .parse(await request.json());
    const client = await supabaseServer();
    const result =
      input.action === "signin"
        ? await client.auth.signInWithPassword(input)
        : await client.auth.signUp(input);
    if (result.error)
      return Response.json({ error: result.error.message }, { status: 400 });
    return Response.json({
      ok: true,
      confirmationRequired: !result.data.session,
    });
  } catch {
    return Response.json(
      {
        error:
          "Authentication is unavailable or the supplied fields are invalid.",
      },
      { status: 400 },
    );
  }
}
