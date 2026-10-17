import { test, expect, vi, afterEach } from "vitest";
import { checkConnections } from "../server/connections";
import { qloo } from "../lib/qloo";
const env = {
  QLOO_API_KEY: "secret-qloo",
  LLM_API_KEY: "secret-model",
  LLM_BASE_URL: "https://provider.invalid/v1",
  LLM_MODEL: "contract-model",
};
afterEach(() => vi.unstubAllGlobals());
test("missing credentials make no network calls", async () => {
  const f = vi.fn();
  vi.stubGlobal("fetch", f);
  const result = await checkConnections({});
  expect(result.qloo.state).toBe("missing");
  expect(result.model.state).toBe("missing");
  expect(f).not.toHaveBeenCalled();
});
test("live checks require Qloo results and a model tool call with the correct nonce", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options) => {
      expect(options.redirect).toBe("error");
      if (String(url).includes("api.qloo.com"))
        return Response.json({
          results: [{ entity_id: "artist-id", name: "Miles Davis" }],
        });
      const body = JSON.parse(options.body);
      const nonce = JSON.stringify(body.messages).match(
        /[0-9a-f]{8}-[0-9a-f-]{27}/,
      )?.[0];
      expect(nonce).toBeTruthy();
      return Response.json({
        id: "probe",
        object: "chat.completion",
        created: 1,
        model: "contract-model",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: null,
              tool_calls: [
                {
                  id: "probe-call",
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
        usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
      });
    }),
  );
  const result = await checkConnections(env);
  expect(result.qloo.state).toBe("passed");
  expect(result.model.state).toBe("passed");
});
test("provider failures are redacted and cannot pass as sample evidence", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) =>
      String(url).includes("api.qloo.com")
        ? new Response("secret-qloo", { status: 401 })
        : Promise.reject(new Error("secret-model")),
    ),
  );
  const result = await checkConnections(env);
  expect(result.qloo.state).toBe("failed");
  expect(result.qloo.detail).toContain("QLOO_API_BASE");
  expect(result.model.state).toBe("failed");
  expect(JSON.stringify(result)).not.toMatch(/secret-/);
});
test("Qloo refuses off-host paths before exposing its key", async () => {
  const f = vi.fn();
  vi.stubGlobal("fetch", f);
  await expect(qloo(env, "https://evil.test/steal", {})).rejects.toThrow(
    "Unsupported Qloo path",
  );
  await expect(qloo(env, "//evil.test/steal", {})).rejects.toThrow(
    "Unsupported Qloo path",
  );
  expect(f).not.toHaveBeenCalled();
});
