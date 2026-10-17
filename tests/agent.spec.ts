import { test, expect, vi, afterEach } from "vitest";
import { investigate } from "../server/agent";
import { sampleEvent } from "../lib/seed";
const env = {
  LLM_API_KEY: "contract-test-key",
  LLM_BASE_URL: "https://configured-provider.invalid/v1",
  LLM_MODEL: "contract-model",
};
afterEach(() => vi.unstubAllGlobals());
const response = (content: string | null, calls?: unknown[]) =>
  Response.json({
    id: "contract-completion",
    object: "chat.completion",
    created: 1,
    model: "contract-model",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content, tool_calls: calls },
        finish_reason: calls ? "tool_calls" : "stop",
      },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
  });
test("provider adapter refuses missing configuration without making a network call", async () => {
  const f = vi.fn();
  vi.stubGlobal("fetch", f);
  await expect(
    investigate(sampleEvent(), "Replace the opening act", {}),
  ).rejects.toThrow("not configured");
  expect(f).not.toHaveBeenCalled();
});
test("structured language workflow uses registered tools and never applies a proposed repair", async () => {
  const d = sampleEvent(),
    original = structuredClone(d.plan);
  let i = 0;
  const calls = [
    ["get_event_plan", {}],
    ["get_event_constraints", {}],
    [
      "generate_feasible_allocations",
      { type: "cancellation", candidateId: "a1" },
    ],
    ["prepare_approval_request", {}],
  ] as const;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      if (i < calls.length) {
        const [name, args] = calls[i++];
        return response(null, [
          {
            id: "call-" + i,
            type: "function",
            function: { name, arguments: JSON.stringify(args) },
          },
        ]);
      }
      return response(
        JSON.stringify({
          status: "awaiting_approval",
          claims: [
            {
              kind: "operational",
              text: "A proposal is ready for organizer review.",
              evidenceIds: [],
            },
          ],
        }),
      );
    }),
  );
  const out = await investigate(
    d,
    "Our opening performer a1 has cancelled. Find feasible repairs and ask for approval.",
    env,
  );
  expect(out.run.error).toBeUndefined();
  expect(out.run.state).toBe("awaiting_approval");
  expect(out.run.steps.map((s) => s.tool)).toEqual(calls.map((c) => c[0]));
  expect(out.event.plan).toEqual(original);
  expect(out.event.proposal?.status).toBe("pending");
  expect(out.event.proposal?.options.length).toBeGreaterThan(0);
});
test("model-authored ungrounded cultural claims fail closed", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      response(
        JSON.stringify({
          status: "needs_information",
          claims: [
            {
              kind: "cultural",
              text: "This performer guarantees attendance.",
              evidenceIds: [],
            },
          ],
        }),
      ),
    ),
  );
  const out = await investigate(
    sampleEvent(),
    "Make a cultural recommendation",
    env,
  );
  expect(out.run.state).toBe("failed");
  expect(out.event.proposal).toBeUndefined();
});

test("failed provider responses do not persist raw upstream secrets in a run", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json(
        { error: { message: "contract-test-key echoed by upstream" } },
        { status: 401 },
      ),
    ),
  );
  const result = await investigate(
    sampleEvent(),
    "Investigate this event",
    env,
  );
  expect(result.run.state).toBe("failed");
  expect(result.event.proposal).toBeUndefined();
  expect(JSON.stringify(result.run)).not.toContain("contract-test-key");
});
