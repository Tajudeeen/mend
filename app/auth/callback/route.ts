import { supabaseServer } from "@/server/auth";
export async function GET(request: Request) {
  const u = new URL(request.url),
    code = u.searchParams.get("code");
  if (code) {
    const client = await supabaseServer();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return Response.redirect(new URL("/events", u));
  }
  return Response.redirect(new URL("/settings?auth=failed", u));
}
