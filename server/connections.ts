import { generateText, tool } from "ai";
import { z } from "zod";
import type { RuntimeEnv } from "@/lib/runtime";
import { search } from "@/lib/qloo";
import { configuredModel } from "@/server/model-provider";
import {
  MissingConnectionToolCall,
  modelFailure,
  type ModelFailureCode,
} from "@/server/model-errors";

export type ConnectionResult = {
  state: "missing" | "passed" | "failed";
  detail: string;
  code?: ModelFailureCode;
};
export async function checkConnections(env: RuntimeEnv) {
  const qloo = async (): Promise<ConnectionResult> => {
    if (!env.QLOO_API_KEY)
      return {
        state: "missing",
        detail:
          "Set QLOO_API_KEY and the QLOO_API_BASE assigned with your key.",
      };
    try {
      const matches = await search(env, "Miles Davis", "artist");
      if (!matches.length)
        throw new Error(
          "Qloo returned no matching artist. Check the key's API access.",
        );
      return {
        state: "passed",
        detail:
          "Authenticated Qloo search returned resolved artists. Cohort insights still need event evidence collection.",
      };
    } catch (error) {
      // Only this adapter's controlled messages are safe to expose.
      const message = error instanceof Error ? error.message : "";
      return {
        state: "failed",
        detail: /^(Qloo |Unsupported Qloo|Unexpected Qloo)/.test(message)
          ? message
          : "Qloo could not complete the search. Check the key, assigned API host and network access.",
      };
    }
  };
  const model = async (): Promise<ConnectionResult> => {
    if (!env.LLM_API_KEY || !env.LLM_BASE_URL || !env.LLM_MODEL)
      return {
        state: "missing",
        detail: "Set LLM_API_KEY, LLM_BASE_URL and LLM_MODEL.",
      };
    try {
      const nonce = crypto.randomUUID();
      const result = await generateText({
        model: configuredModel(env),
        prompt: `Call confirm_connection with nonce ${nonce}.`,
        tools: {
          confirm_connection: tool({
            description:
              "Confirm this isolated connection check. Does not access events or perform actions.",
            inputSchema: z.object({ nonce: z.literal(nonce) }),
          }),
        },
        toolChoice: { type: "tool", toolName: "confirm_connection" },
        maxOutputTokens: 128,
        maxRetries: 0,
        abortSignal: AbortSignal.timeout(10000),
      });
      if (
        !result.toolCalls.some(
          (call) =>
            call.toolName === "confirm_connection" &&
            z.object({ nonce: z.literal(nonce) }).safeParse(call.input).success,
        )
      )
        throw new MissingConnectionToolCall();
      return {
        state: "passed",
        detail:
          "The configured model returned a valid tool call. Full event recovery remains a separate live test.",
      };
    } catch (error) {
      const failure = modelFailure(error);
      console.warn("MEND model connection check failed", {
        code: failure.code,
      });
      return { state: "failed", ...failure };
    }
  };
  const [qlooResult, modelResult] = await Promise.all([qloo(), model()]);
  return {
    checkedAt: new Date().toISOString(),
    qloo: qlooResult,
    model: modelResult,
  };
}
