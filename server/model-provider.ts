import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { RuntimeEnv } from "@/lib/runtime";

export function configuredModel(env: RuntimeEnv) {
  if (!env.LLM_API_KEY || !env.LLM_BASE_URL || !env.LLM_MODEL)
    throw new Error(
      "Language provider is not configured. Use the structured scenario controls.",
    );
  const base = new URL(env.LLM_BASE_URL);
  if (
    base.protocol !== "https:" ||
    base.username ||
    base.password ||
    base.search ||
    base.hash
  )
    throw new Error(
      "The configured model endpoint must be HTTPS without embedded credentials, query or fragment.",
    );
  return createOpenAICompatible({
    name: "mend-configured-provider",
    baseURL: base.toString().replace(/\/$/, ""),
    apiKey: env.LLM_API_KEY,
    fetch: (url, options) => fetch(url, { ...options, redirect: "error" }),
  }).chatModel(env.LLM_MODEL);
}
