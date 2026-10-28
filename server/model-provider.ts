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
    fetch: (url, options) => {
      let body = options?.body;
      // The compatible SDK replays reasoning as reasoning_content. Groq uses
      // a different response field and rejects this assistant-message field.
      // Preserve the actual content, tool calls and tool results unchanged.
      if (base.hostname === "api.groq.com" && typeof body === "string") {
        const request = JSON.parse(body);
        if (Array.isArray(request.messages)) {
          request.messages = request.messages.map(
            (message: Record<string, unknown>) => {
              if (message.role !== "assistant") return message;
              const cleaned = { ...message };
              delete cleaned.reasoning_content;
              return cleaned;
            },
          );
          body = JSON.stringify(request);
        }
      }
      return fetch(url, { ...options, body, redirect: "error" });
    },
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
            include_reasoning: false,
          },
        },
      }
    : {};
}
