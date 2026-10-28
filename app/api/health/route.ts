import { runtimeEnv } from "@/lib/runtime";
export async function GET(request?: Request) {
  const e = runtimeEnv();
  const probe =
    !!request && new URL(request.url).searchParams.get("probe") === "database";
  const databaseReady =
    probe && !e.MEND_SITE_COMPAT
      ? await (await import("@/server/postgres")).postgresReady()
      : undefined;
  return Response.json(
    {
      status: databaseReady === false ? "degraded" : "ok",
      ...(databaseReady !== undefined ? { databaseReady } : {}),
      version: "0.3.0",
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
        : process.env.NEXT_PUBLIC_SUPABASE_URL &&
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          ? "supabase-configured"
          : "not-configured",
    },
    {
      status: databaseReady === false ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
