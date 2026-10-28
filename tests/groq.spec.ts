import { test, expect, vi, afterEach } from "vitest";
import { checkConnections } from "../server/connections";
import {
  configuredModel,
  modelCallOptions,
  availableModels,
} from "../server/model-provider";
import { investigate } from "../server/agent";
import { sampleEvent } from "../lib/seed";
import { newEvent } from "../lib/new-event";
const env = {
  LLM_API_KEY: "gsk_contract_test_not_a_real_key",
  LLM_BASE_URL: "https://api.groq.com/openai/v1",
  LLM_MODEL: "openai/gpt-oss-20b",
};
afterEach(() => vi.unstubAllGlobals());
test("model catalogue uses only the configured provider and returns safe unique IDs", async () => {
  const fetcher = vi.fn(async (url, options) => {
    expect(String(url)).toBe("https://api.groq.com/openai/v1/models");
    expect(options.redirect).toBe("error");
    return Response.json({
      data: [
        { id: "model-a" },
        { id: "model-a" },
        { id: "model-b" },
        { id: "sk-private-echo" },
        { id: "<bad>" },
      ],
    });
  });
  vi.stubGlobal("fetch", fetcher);
  expect(await availableModels(env)).toEqual(["model-a", "model-b"]);
  expect(fetcher).toHaveBeenCalledTimes(1);
});
test("model catalogue rejects oversized responses and cancels downloading", async () => {
  let cancelled = false;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new Uint8Array(128001));
            },
            cancel() {
              cancelled = true;
            },
          }),
        ),
    ),
  );
  await expect(availableModels(env)).rejects.toThrow("size limit");
  expect(cancelled).toBe(true);
});
test("Groq reads an incomplete event before submitting a typed missing-information report", async () => {
  const names = [
    "get_event_plan",
    "get_event_constraints",
    "finish_investigation",
  ];
  let calls = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, options) => {
      const body = JSON.parse(String(options.body));
      const name = names[calls++];
      expect(
        body.tools.map((t: { function: { name: string } }) => t.function.name),
      ).toEqual([name]);
      expect(body.tool_choice).toEqual({
        type: "function",
        function: { name },
      });
      const args =
        name === "finish_investigation"
          ? {
              status: "needs_information",
              claims: [
                {
                  kind: "limitation",
                  text: "Programme slots and zones are missing. Booking terms remain unconfirmed.",
                  evidenceIds: [],
                },
              ],
            }
          : {};
      return Response.json({
        id: "groq-step",
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
                  id: `call-${calls}`,
                  type: "function",
                  function: { name, arguments: JSON.stringify(args) },
                },
              ],
            },
            finish_reason: "tool_calls",
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      });
    }),
  );
  const doc = newEvent(sampleEvent().brief);
  const result = await investigate(
    doc,
    "Read the event and report missing inputs",
    env,
  );
  expect(calls).toBe(3);
  expect(result.run.steps.map((s) => s.tool)).toEqual(names);
  expect(result.run.state).toBe("needs_information");
  expect(result.run.error).toBeUndefined();
  expect(result.event.plan).toEqual(doc.plan);
  expect(result.event.proposal).toBeUndefined();
});
test("compatible agent validates final JSON without native response formatting or plan changes", async () => {
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
  const result = await investigate(doc, "Report missing booking information", {
    ...env,
    LLM_BASE_URL: "https://configured-provider.invalid/v1",
    LLM_API_KEY: "contract-test-key",
    LLM_MODEL: "contract-model",
  });
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
    expect(body.include_reasoning).toBe(false);
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
