import { test, expect, vi, afterEach } from "vitest";
import { checkConnections } from "../server/connections";
import { configuredModel, modelCallOptions } from "../server/model-provider";
import { investigate } from "../server/agent";
import { sampleEvent } from "../lib/seed";
const env = {
  LLM_API_KEY: "gsk_contract_test_not_a_real_key",
  LLM_BASE_URL: "https://api.groq.com/openai/v1",
  LLM_MODEL: "openai/gpt-oss-20b",
};
afterEach(() => vi.unstubAllGlobals());
test("Groq agent avoids native response formatting during tools and validates final JSON without changing the plan", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, options) => {
      const body = JSON.parse(String(options.body));
      expect(body.response_format).toBeUndefined();
      for (const entry of body.tools)
        expect(entry.function.parameters.type, entry.function.name).toBe(
          "object",
        );
      expect(
        body.messages.some(
          (m: { content?: string }) =>
            typeof m.content === "string" && m.content.includes("JSON object"),
        ),
      ).toBe(true);
      return Response.json({
        id: "groq-output",
        object: "chat.completion",
        created: 1,
        model: env.LLM_MODEL,
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: JSON.stringify({
                status: "needs_information",
                claims: [
                  {
                    kind: "limitation",
                    text: "Booking information is missing.",
                    evidenceIds: [],
                  },
                ],
              }),
            },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      });
    }),
  );
  const doc = sampleEvent();
  const result = await investigate(
    doc,
    "Report missing booking information",
    env,
  );
  expect(result.run.state).toBe("needs_information");
  expect(result.event.plan).toEqual(doc.plan);
});
test("Groq probe sends sequential low-effort tools with a bounded reasoning budget", async () => {
  const fetcher = vi.fn(async (url: unknown, options: RequestInit) => {
    expect(String(url)).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(options.redirect).toBe("error");
    const body = JSON.parse(String(options.body));
    expect(body.model).toBe(env.LLM_MODEL);
    expect(body.reasoning_effort).toBe("low");
    expect(body.parallel_tool_calls).toBe(false);
    expect(body.max_tokens).toBe(1024);
    const nonce = JSON.stringify(body.messages).match(
      /[0-9a-f]{8}-[0-9a-f-]{27}/,
    )?.[0];
    expect(nonce).toBeTruthy();
    return Response.json({
      id: "groq-contract",
      object: "chat.completion",
      created: 1,
      model: env.LLM_MODEL,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: "probe",
                type: "function",
                function: {
                  name: "confirm_connection",
                  arguments: JSON.stringify({ nonce }),
                },
              },
            ],
          },
          finish_reason: "tool_calls",
        },
      ],
      usage: { prompt_tokens: 10, completion_tokens: 30, total_tokens: 40 },
    });
  });
  vi.stubGlobal("fetch", fetcher);
  expect((await checkConnections(env)).model.state).toBe("passed");
  expect(fetcher).toHaveBeenCalledTimes(1);
});
test("switching to Groq never sends an existing OpenAI key to Groq", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  const result = await checkConnections({
    ...env,
    LLM_API_KEY: "sk-contract-openai-key",
  });
  expect(result.model.code).toBe("invalid_credentials");
  expect(result.model.detail).toContain("Groq API key");
  expect(JSON.stringify(result)).not.toContain("sk-contract");
  expect(fetcher).not.toHaveBeenCalled();
});
test("Groq keys are refused on OpenAI and Groq options do not leak into other providers", () => {
  expect(() =>
    configuredModel({ ...env, LLM_BASE_URL: "https://api.openai.com/v1" }),
  ).toThrow("Provider key mismatch");
  expect(
    modelCallOptions({ ...env, LLM_BASE_URL: "https://provider.invalid/v1" }),
  ).toEqual({});
  expect(modelCallOptions({ ...env, LLM_MODEL: "another-model" })).toEqual({});
});
