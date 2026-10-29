import { test } from "node:test";
import assert from "node:assert/strict";
import { sampleEvent } from "../lib/seed.ts";
import { applyCommand } from "../lib/commands.ts";
import { approve, metrics } from "../lib/planner.ts";
import { culturalPoolKey } from "../lib/culture.ts";
import { canonicalDigest } from "../lib/integrity.ts";

// Synthetic source fixtures exercise live-mode policy, never establish API access.
async function policyFixture() {
  const d = sampleEvent();
  d.mode = "live";
  for (const c of d.candidates)
    Object.assign(c, {
      entityId: c.id,
      feeKnown: true,
      availabilityKnown: true,
      verified: true,
    });
  for (const co of d.brief.cohorts) {
    co.seeds = [{ id: "synthetic-interest", name: "Synthetic interest" }];
    for (const kind of ["artist", "vendor"] as const) {
      const roster = d.candidates.filter((c) => c.kind === kind);
      const entities = Object.fromEntries(roster.map((c) => [c.id, 0.5]));
      const rawResponse = {
        results: {
          entities: roster.map((c) => ({
            entity_id: c.id,
            query: { affinity: 0.5 },
          })),
        },
      };
      d.evidence.push({
        id: crypto.randomUUID(),
        provider: "qloo",
        origin: "https://hackathon.api.qloo.com",
        endpoint: "/v2/insights",
        at: new Date().toISOString(),
        params: { "signal.interests.entities": "synthetic-interest" },
        rawResponse,
        responseHash: await canonicalDigest(rawResponse),
        hashAlgorithm: "sha256-canonical-json-v2",
        entities,
        explainability: {},
        cohortId: co.id,
        kind,
        poolKey: culturalPoolKey(d.candidates, kind),
        normalization: "Synthetic policy fixture only",
      });
    }
  }
  return d;
}
function command(
  d: Awaited<ReturnType<typeof policyFixture>>,
  action: string,
  body: Record<string, unknown> = {},
) {
  const after = applyCommand(d, action, body).event;
  after.revision = d.revision + 1;
  return after;
}
test("staged terms resolution: blocked -> edit invalidates -> repropose -> approve -> reject duplicate", async () => {
  let d = await policyFixture();
  const original = structuredClone(d.plan);
  Object.assign(d.candidates[0], {
    feeKnown: false,
    availabilityKnown: false,
    verified: false,
  });
  d.draftPlan = structuredClone(d.plan);
  d = command(d, "proposeDraft");
  assert.throws(
    () => command(d, "approve", { optionId: "manual-draft" }),
    /Confirm unknown/,
  );
  assert.deepEqual(d.plan, original);
  d = command(d, "candidate", {
    candidateId: d.candidates[0].id,
    fields: {
      ...d.candidates[0],
      fee: 2100,
      feeKnown: true,
      availabilityKnown: true,
      verified: true,
    },
  });
  assert.equal(
    d.proposal,
    undefined,
    "terms edits must invalidate the earlier request",
  );
  d = command(d, "proposeDraft");
  assert.deepEqual(metrics(d, d.plan).unknowns, []);
  d = command(d, "approve", { optionId: "manual-draft" });
  assert.equal(d.reports?.length, 1);
  assert.equal(d.proposal?.status, "approved");
  assert.throws(
    () => command(d, "approve", { optionId: "manual-draft" }),
    /No pending/,
  );
  assert.equal(d.reports?.length, 1);
});
test("seeded generated approval invariants cover unknown flags, budget, stale revisions and duplicate approval", async () => {
  const base = await policyFixture();
  let seed = 0x4d454e44;
  const random = () =>
    (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32;
  let passed = 0,
    refused = 0;
  for (let i = 0; i < 512; i++) {
    const d = structuredClone(base);
    for (const a of d.plan) {
      const c = d.candidates.find((c) => c.id === a.candidateId)!;
      // Include an all-known positive stratum so always-refusing code cannot pass.
      for (const key of ["feeKnown", "availabilityKnown", "verified"] as const)
        Object.assign(c, {
          [key]:
            i % 8 === 0
              ? true
              : [true, false, undefined][Math.floor(random() * 3)],
        });
    }
    const overBudget = i % 11 === 0;
    if (overBudget) d.brief.budget = 100;
    d.draftPlan = structuredClone(d.plan);
    // proposeDraft refuses infeasible operational inputs, before approval is possible.
    if (overBudget) {
      assert.throws(() => command(d, "proposeDraft"), /budget/i);
      refused++;
      continue;
    }
    const pending = command(d, "proposeDraft");
    const stale = i % 13 === 0;
    if (stale) pending.revision++;
    const unknown = metrics(pending, pending.plan).unknowns.length > 0;
    const before = JSON.stringify(pending);
    if (unknown || stale) {
      assert.throws(
        () => approve(pending, "manual-draft"),
        stale ? /stale/ : /Confirm unknown/,
      );
      assert.equal(
        JSON.stringify(pending),
        before,
        `seed 0x4d454e44, case ${i}: refusal mutated input`,
      );
      refused++;
    } else {
      const result = approve(pending, "manual-draft");
      assert.deepEqual(metrics(result, result.plan).unknowns, []);
      assert.throws(() => approve(result, "manual-draft"), /No pending/);
      passed++;
    }
  }
  assert(
    passed > 30 && refused > 300,
    "both positive and negative strata must execute",
  );
});
