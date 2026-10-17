import { supabaseServer } from "@/server/auth";
import { privateHeaders } from "@/server/http";
export async function GET(request: Request) {
  const url = new URL(request.url);
  let success = false;
  try {
    const code = url.searchParams.get("code");
    const tokenHash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type");
    if (code) {
      const client = await supabaseServer();
      success = !(await client.auth.exchangeCodeForSession(code)).error;
    } else if (tokenHash && type === "email") {
      const client = await supabaseServer();
      success = !(
        await client.auth.verifyOtp({ token_hash: tokenHash, type: "email" })
      ).error;
    }
  } catch {
    /* Expired links and unavailable auth return to sign-in. */
  }
  return new Response(null, {
    status: 303,
    headers: {
      ...privateHeaders,
      Location: new URL(
        success ? "/events" : "/settings?auth=failed",
        url,
      ).toString(),
    },
  });
}
