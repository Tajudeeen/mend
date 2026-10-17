import { test } from "node:test";
import assert from "node:assert/strict";
import { sampleEvent } from "../lib/seed.ts";
import { culturalPoolKey } from "../lib/culture.ts";
import { collect } from "../lib/qloo.ts";
import { rankScore } from "../lib/planner.ts";
import { fingerprint } from "../lib/fingerprint.ts";
import { proposeRestoration } from "../lib/restoration.ts";
import { applyCommand } from "../lib/commands.ts";

function profileFixture() {
  const doc = sampleEvent();
  doc.mode = "live";
  doc.candidates = doc.candidates
    .filter((c) => c.kind === "vendor")
    .slice(0, 3);
  doc.candidates[0].entityId = "place-a";
  doc.candidates[1].culturalProfile = {
    version: "proxy-v1",
    rationale:
      "Organizer-selected plant-based places, used only as cuisine and format references.",
    entities: [
      { id: "place-b", name: "Reference B" },
      { id: "place-c", name: "Reference C" },
    ],
    resolvedAt: new Date().toISOString(),
  };
  doc.candidates[2].entityId = "place-d";
  return doc;
}
test("vendor collection records one fixed pool and explicit independent proxy provenance", async () => {
  const doc = profileFixture(),
    old = globalThis.fetch;
  let url: URL | undefined;
  try {
    globalThis.fetch = async (input) => {
      url = new URL(String(input));
      return Response.json({
        results: {
          entities: [
            { entity_id: "place-a", query: { affinity: 0.9 } },
            { entity_id: "place-b", query: { affinity: 0.2 } },
            { entity_id: "place-c", query: { affinity: 0.8 } },
            { entity_id: "place-d", query: { affinity: 0.5 } },
          ],
        },
      });
    };
    const e = await collect(
      { QLOO_API_KEY: "test" },
      "pulse",
      ["seed"],
      doc.candidates,
      "vendor",
    );
    assert.equal(url?.searchParams.get("filter.type"), "urn:entity:place");
    assert.equal(
      url?.searchParams.get("filter.results.entities"),
      "place-a,place-b,place-c,place-d",
    );
    assert.equal(e.candidateProfiles?.[doc.candidates[1].id].source, "proxy");
    assert.equal(doc.candidates[1].name, "The Green Table");
    assert.equal(doc.candidates[1].entityId, undefined);
    assert.equal(e.poolKey, culturalPoolKey(doc.candidates, "vendor"));
    doc.evidence = [e];
    assert.equal(rankScore(doc, doc.candidates[0].id, "pulse"), 1);
    assert(rankScore(doc, doc.candidates[1].id, "pulse") !== undefined);
  } finally {
    globalThis.fetch = old;
  }
});
test("proxy ordinal aggregation is invariant under a monotone rescaling and rejects stale pools", async () => {
  const doc = profileFixture();
  doc.evidence = [
    {
      id: crypto.randomUUID(),
      provider: "qloo",
      cohortId: "pulse",
      kind: "vendor",
      at: new Date().toISOString(),
      endpoint: "/v2/insights",
      params: {},
      responseHash: "test",
      rawResponse: {},
      explainability: {},
      normalization: "fixture",
      poolKey: culturalPoolKey(doc.candidates, "vendor"),
      entities: {
        "place-a": 0.9,
        "place-b": 0.2,
        "place-c": 0.8,
        "place-d": 0.5,
      },
    },
  ];
  const before = doc.candidates.map((c) => rankScore(doc, c.id, "pulse"));
  for (const id of Object.keys(doc.evidence[0].entities))
    doc.evidence[0].entities[id] **= 8;
  assert.deepEqual(
    doc.candidates.map((c) => rankScore(doc, c.id, "pulse")),
    before,
  );
  doc.candidates[1].culturalProfile!.entities.push({
    id: "place-e",
    name: "New reference",
  });
  assert.equal(rankScore(doc, doc.candidates[0].id, "pulse"), undefined);
});
test("an incomplete proxy response fails closed and a pool over 50 is never split across contexts", async () => {
  const doc = profileFixture(),
    old = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      Response.json({
        results: {
          entities: [{ entity_id: "place-a", query: { affinity: 0.9 } }],
        },
      });
    await assert.rejects(
      () =>
        collect(
          { QLOO_API_KEY: "test" },
          "pulse",
          ["seed"],
          doc.candidates,
          "vendor",
        ),
      /every requested participant/,
    );
    doc.candidates = Array.from({ length: 51 }, (_, i) => ({
      ...doc.candidates[0],
      id: "v" + i,
      entityId: "place-" + i,
    }));
    await assert.rejects(
      () =>
        collect(
          { QLOO_API_KEY: "test" },
          "pulse",
          ["seed"],
          doc.candidates,
          "vendor",
        ),
      /exceeds 50/,
    );
  } finally {
    globalThis.fetch = old;
  }
});
test("cultural fingerprint keeps missing evidence null and counts normalized organizer tags once per participant", () => {
  const doc = sampleEvent();
  doc.mode = "live";
  doc.candidates[0].tags = [" Soul ", "soul"];
  doc.referencePlan = structuredClone(doc.plan);
  const f = fingerprint(doc);
  assert.equal(f.covered, 0);
  assert(f.contexts.every((c) => c.index === null && c.drift === null));
  assert.equal(f.tags.find((t) => t.name === "soul")?.after, 1);
});
test("restoration preserves current facts, creates an approval request and writes a fingerprint on approval", () => {
  const historical = sampleEvent(),
    current = structuredClone(historical);
  current.revision = 2;
  current.plan[0].candidateId = "a3";
  current.candidates[0].fee = 500;
  const result = proposeRestoration(current, historical);
  assert.equal(result.event.plan[0].candidateId, "a3");
  assert.equal(result.event.candidates[0].fee, 500);
  assert.equal(result.event.proposal?.originRevision, 0);
  assert.equal(
    result.event.proposal?.options[0].assignments[0].candidateId,
    "a1",
  );
  result.event.revision = 3;
  const approved = applyCommand(result.event, "approve", {
    optionId: "manual-draft",
  }).event;
  assert.equal(approved.plan[0].candidateId, "a1");
  assert.equal(approved.candidates[0].fee, 500);
  assert(approved.reports?.[0].fingerprint);
});
test("restoration cannot revive unavailable or locked-out historical participants or cross event IDs", () => {
  const historical = sampleEvent(),
    current = structuredClone(historical);
  current.revision = 2;
  current.plan[0].candidateId = "a3";
  current.candidates[0].available = false;
  assert.throws(() => proposeRestoration(current, historical), /unavailable/);
  current.candidates[0].available = true;
  current.locks = ["opening"];
  assert.throws(() => proposeRestoration(current, historical), /locked/);
  historical.id = crypto.randomUUID();
  assert.throws(
    () => proposeRestoration(current, historical),
    /earlier revision/,
  );
});
