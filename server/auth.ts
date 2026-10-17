import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { runtimeEnv } from "@/lib/runtime";
export async function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error(
      "Supabase is not configured. The public demo is available without an account.",
    );
  const jar = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) =>
        values.forEach((v) => jar.set(v.name, v.value, v.options)),
    },
  });
}
export async function authenticatedOwner(request: Request) {
  if (runtimeEnv().MEND_SITE_COMPAT) {
    const id = request.headers.get("oai-authenticated-user-id");
    if (!id) throw new Error("Sign in to save and manage events.");
    return id;
  }
  const client = await supabaseServer();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user)
    throw new Error("Sign in to save and manage events.");
  return data.user.id;
}
