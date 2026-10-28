import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { RuntimeEnv } from "@/lib/runtime";
import { ModelProviderKeyMismatch } from "@/server/model-errors";

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
  const apiKey = env.LLM_API_KEY.trim();
  if (base.hostname === "api.groq.com" && apiKey.startsWith("sk-"))
    throw new ModelProviderKeyMismatch("Groq");
  if (base.hostname === "api.openai.com" && apiKey.startsWith("gsk_"))
    throw new ModelProviderKeyMismatch("OpenAI");
  return createOpenAICompatible({
    name: "mend-configured-provider",
    baseURL: base.toString().replace(/\/$/, ""),
    apiKey,
    fetch: (url, options) => fetch(url, { ...options, redirect: "error" }),
  }).chatModel(env.LLM_MODEL);
}

export function groqReasoningModel(env: RuntimeEnv): boolean {
  try {
    return (
      new URL(env.LLM_BASE_URL ?? "").hostname === "api.groq.com" &&
      /^openai\/gpt-oss-(20b|120b)$/.test(env.LLM_MODEL ?? "")
    );
  } catch {
    return false;
  }
}

export function modelCallOptions(env: RuntimeEnv) {
  // Groq GPT-OSS supports low reasoning effort and sequential tool calling.
  return groqReasoningModel(env)
    ? {
        providerOptions: {
          mendConfiguredProvider: {
            reasoningEffort: "low",
            parallel_tool_calls: false,
          },
        },
      }
    : {};
}
