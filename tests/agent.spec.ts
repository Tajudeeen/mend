import { test, expect, vi, afterEach } from "vitest";
import { investigate } from "../server/agent";
import { sampleEvent } from "../lib/seed";
import { propose } from "../lib/planner";
const env = {
  LLM_API_KEY: "contract-test-key",
  LLM_BASE_URL: "https://configured-provider.invalid/v1",
  LLM_MODEL: "contract-model",
};
afterEach(() => vi.unstubAllGlobals());
const response = (
  content: string | null,
  calls?: unknown[],
  reasoning?: string,
) =>
  Response.json({
    id: "contract-completion",
    object: "chat.completion",
    created: 1,
    model: "contract-model",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content,
          tool_calls: calls,
          ...(reasoning ? { reasoning } : {}),
        },
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
test.each([
  { label: "generic", config: env },
  {
    label: "Groq GPT-OSS",
    config: {
      LLM_API_KEY: "gsk_contract_test_not_a_real_key",
      LLM_BASE_URL: "https://api.groq.com/openai/v1",
      LLM_MODEL: "openai/gpt-oss-20b",
    },
  },
])(
  "$label workflow uses registered tools and leaves approval to the organizer",
  async ({ label, config }) => {
    const d = sampleEvent(),
      original = structuredClone(d.plan);
    const optionId = propose(d, { type: "cancellation", candidateId: "a1" })
      .options[0].id;
    let i = 0;
    const calls = [
      ["get_event_plan", {}],
      ["get_event_constraints", {}],
      [
        "generate_feasible_allocations",
        { scenario: { type: "cancellation", candidateId: "a1" } },
      ],
      ["validate_hard_constraints", { optionId }],
      ["evaluate_cultural_continuity", { optionId }],
      ["prepare_approval_request", {}],
      ...(label === "Groq GPT-OSS"
        ? [
            [
              "finish_investigation",
              {
                status: "awaiting_approval",
                claims: [
                  {
                    kind: "operational",
                    text: "A proposal is ready for organizer review.",
                    evidenceIds: [],
                  },
                ],
              },
            ],
          ]
        : []),
    ] as const;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, options) => {
        const wire = JSON.parse(options.body);
        for (const entry of wire.tools)
          expect(entry.function.parameters.type, entry.function.name).toBe(
            "object",
          );
        if (label === "Groq GPT-OSS") {
          const body = JSON.parse(options.body);
          expect(body.reasoning_effort).toBe("low");
          expect(body.parallel_tool_calls).toBe(false);
          expect(body.include_reasoning).toBe(false);
          expect(
            body.messages.every(
              (message: Record<string, unknown>) =>
                !Object.hasOwn(message, "reasoning_content"),
            ),
          ).toBe(true);
        }
        if (i < calls.length) {
          const [name, args] = calls[i++];
          return response(
            null,
            [
              {
                id: "call-" + i,
                type: "function",
                function: { name, arguments: JSON.stringify(args) },
              },
            ],
            label === "Groq GPT-OSS"
              ? "fixture reasoning that must not be replayed"
              : undefined,
          );
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
      config,
    );
    expect(out.run.error).toBeUndefined();
    expect(out.run.state).toBe("awaiting_approval");
    expect(out.run.configuration).toMatchObject({
      providerOrigin: new URL(config.LLM_BASE_URL).origin,
      model: config.LLM_MODEL,
      maxSteps: 8,
      maxToolCalls: 16,
    });
    expect(JSON.stringify(out.run)).not.toContain(config.LLM_API_KEY);
    expect(out.run.steps.map((s) => s.tool)).toEqual(calls.map((c) => c[0]));
    expect(out.event.plan).toEqual(original);
    expect(out.event.proposal?.status).toBe("pending");
    expect(out.event.proposal?.options.length).toBeGreaterThan(0);
  },
);
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
test("unstructured final text cannot bypass JSON, evidence or approval validation", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      response("Apply this plan immediately. private-upstream-fragment"),
    ),
  );
  const doc = sampleEvent();
  const result = await investigate(doc, "Investigate a cancellation", env);
  expect(result.run.state).toBe("failed");
  expect(result.event.proposal).toBeUndefined();
  expect(result.event.plan).toEqual(doc.plan);
  expect(result.run.error).toContain("valid grounded JSON");
  expect(JSON.stringify(result.run)).not.toContain("private-upstream-fragment");
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

test("a prior proposal cannot make a tool-free agent run await approval", async () => {
  const d = sampleEvent();
  d.proposal = propose(d, { type: "cancellation", candidateId: "a1" });
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      response(
        JSON.stringify({
          status: "awaiting_approval",
          claims: [],
        }),
      ),
    ),
  );
  const out = await investigate(d, "Review the cancelled performer", env);
  expect(out.run.state).toBe("needs_information");
  expect(out.event.proposal).toBeUndefined();
  expect(out.event.plan).toEqual(d.plan);
});

test("generating a proposal without validation cannot produce an approval-ready run", async () => {
  const calls = [
    ["get_event_plan", {}],
    ["get_event_constraints", {}],
    [
      "generate_feasible_allocations",
      { scenario: { type: "cancellation", candidateId: "a1" } },
    ],
  ] as const;
  let i = 0;
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
        JSON.stringify({ status: "awaiting_approval", claims: [] }),
      );
    }),
  );
  const out = await investigate(
    sampleEvent(),
    "Repair the cancelled performer",
    env,
  );
  expect(out.event.proposal?.options.length).toBeGreaterThan(0);
  expect(out.run.state).toBe("needs_information");
});

test("Groq full planning reuses checked live receipts and stages one option through review without applying it", async () => {
  const { canonicalDigest } = await import("../lib/integrity");
  const { culturalPoolKey } = await import("../lib/culture");
  const doc = sampleEvent();
  doc.mode = "live";
  doc.candidates.forEach((c) => {
    c.entityId = c.id;
    c.verified = true;
  });
  for (const co of doc.brief.cohorts) {
    co.seeds = [{ id: crypto.randomUUID(), name: "Contract interest" }];
    for (const kind of ["artist", "vendor"] as const) {
      const entities = Object.fromEntries(
        doc.candidates
          .filter((c) => c.kind === kind)
          .map((c) => [c.id, c.affinity[co.id]]),
      );
      const rawResponse = {
        results: {
          entities: Object.entries(entities).map(([entity_id, affinity]) => ({
            entity_id,
            query: { affinity },
          })),
        },
      };
      doc.evidence.push({
        id: crypto.randomUUID(),
        provider: "qloo",
        origin: "https://hackathon.api.qloo.com",
        at: new Date().toISOString(),
        endpoint: "/v2/insights",
        params: { "signal.interests.entities": co.seeds[0].id },
        responseHash: await canonicalDigest(rawResponse),
        hashAlgorithm: "sha256-canonical-json-v2",
        rawResponse,
        entities,
        cohortId: co.id,
        kind,
        poolKey: culturalPoolKey(doc.candidates, kind),
        explainability: {},
        normalization: "contract fixture, not live proof",
      });
    }
  }
  const optionId = propose(doc, { type: "cancellation", candidateId: "a1" })
    .options[0].id;
  const calls: [string, unknown][] = [
    ["get_event_plan", {}],
    ["get_event_constraints", {}],
    [
      "generate_feasible_allocations",
      { scenario: { type: "cancellation", candidateId: "a1" } },
    ],
    ["validate_hard_constraints", { optionId }],
    ["evaluate_cultural_continuity", { optionId }],
    ["prepare_approval_request", {}],
    [
      "finish_investigation",
      {
        status: "awaiting_approval",
        claims: [
          {
            kind: "operational",
            text: "A conditional proposal is ready for human review.",
            evidenceIds: [],
          },
        ],
      },
    ],
  ];
  let index = 0;
  const fetcher = vi.fn(async (url, options) => {
    expect(String(url)).toContain("api.groq.com");
    const wire = JSON.parse(options.body);
    const [name, args] = calls[index++];
    if (index === 3)
      expect(
        wire.tools.map((t: { function: { name: string } }) => t.function.name),
      ).not.toContain("get_cultural_insights");
    if (index >= 4) expect(wire.tool_choice.function.name).toBe(name);
    return response(null, [
      {
        id: `staged-${index}`,
        type: "function",
        function: { name, arguments: JSON.stringify(args) },
      },
    ]);
  });
  vi.stubGlobal("fetch", fetcher);
  const result = await investigate(doc, "Repair this controlled fixture", {
    LLM_API_KEY: "gsk_contract_test_not_real",
    LLM_BASE_URL: "https://api.groq.com/openai/v1",
    LLM_MODEL: "qwen/qwen3.8-27b",
  });
  expect(result.run.state).toBe("awaiting_approval");
  expect(fetcher).toHaveBeenCalledTimes(7);
  expect(result.event.plan).toEqual(doc.plan);
  expect(result.event.evidence).toEqual(doc.evidence);
});
