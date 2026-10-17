import { runtimeEnv } from "@/lib/runtime";
export async function GET() {
  const e = runtimeEnv();
  return Response.json(
    {
      status: "ok",
      version: "0.2.0",
      runtime: e.MEND_SITE_COMPAT ? "sites-compatibility" : "next-node",
      qloo: !!e.QLOO_API_KEY,
      model: !!(e.LLM_API_KEY && e.LLM_BASE_URL && e.LLM_MODEL),
      persistence: e.DB
        ? "d1-compatibility"
        : process.env.DATABASE_URL
          ? "postgres-configured"
          : "not-configured",
      auth: e.MEND_SITE_COMPAT
        ? "chatgpt-compatibility"
        : process.env.NEXT_PUBLIC_SUPABASE_URL
          ? "supabase-configured"
          : "not-configured",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
