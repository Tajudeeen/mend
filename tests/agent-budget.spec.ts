import { test, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({ search: vi.fn().mockResolvedValue([]) }));
vi.mock("@/lib/qloo", () => ({
  search: mocks.search,
  searchTags: vi.fn(),
  collect: vi.fn(),
  discover: vi.fn(),
}));
import { investigate } from "../server/agent";
import { sampleEvent } from "../lib/seed";

test("parallel tool requests reserve the budget before touching the provider", async () => {
  let completions = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      const calls =
        completions++ === 0
          ? Array.from({ length: 20 }, (_, i) => ({
              id: "search-" + i,
              type: "function",
              function: {
                name: "resolve_cultural_entity",
                arguments: JSON.stringify({
                  query: "fixture artist " + i,
                  kind: "artist",
                }),
              },
            }))
          : undefined;
      return Response.json({
        id: "budget-completion",
        object: "chat.completion",
        created: 1,
        model: "contract-model",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: calls
                ? null
                : JSON.stringify({ status: "needs_information", claims: [] }),
              tool_calls: calls,
            },
            finish_reason: calls ? "tool_calls" : "stop",
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
      });
    }),
  );
  try {
    const doc = sampleEvent();
    const result = await investigate(
      doc,
      "Investigate replacement identities",
      {
        LLM_API_KEY: "test-key",
        LLM_BASE_URL: "https://model.invalid/v1",
        LLM_MODEL: "contract-model",
      },
    );
    expect(mocks.search).toHaveBeenCalledTimes(16);
    expect(result.run.steps).toHaveLength(16);
    expect(result.event.plan).toEqual(doc.plan);
  } finally {
    vi.unstubAllGlobals();
  }
});
