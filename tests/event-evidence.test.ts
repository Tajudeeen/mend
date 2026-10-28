import { test } from "node:test";
import assert from "node:assert/strict";
import { sampleEvent } from "../lib/seed.ts";
import { inspectEventEvidence } from "../lib/event-evidence.ts";
import { culturalPoolKey } from "../lib/culture.ts";
import { digest } from "../lib/integrity.ts";

async function fixture() {
  const doc = sampleEvent();
  doc.mode = "live";
  doc.candidates.forEach((c) => {
    c.entityId = c.id;
  });
  for (const co of doc.brief.cohorts) {
    co.seeds = [{ id: "fixture-interest", name: "Fixture interest" }];
    for (const kind of ["artist", "vendor"] as const) {
      const roster = doc.candidates.filter((c) => c.kind === kind);
      const rawResponse = {
        results: {
          entities: roster.map((c) => ({
            entity_id: c.id,
            query: { affinity: 0.5 },
          })),
        },
      };
      doc.evidence.push({
        id: crypto.randomUUID(),
        provider: "qloo",
        origin: "https://hackathon.api.qloo.com",
        at: new Date().toISOString(),
        endpoint: "/v2/insights",
        params: { "signal.interests.entities": "fixture-interest" },
        responseHash: await digest(rawResponse),
        rawResponse,
        entities: Object.fromEntries(roster.map((c) => [c.id, 0.5])),
        explainability: {},
        cohortId: co.id,
        kind,
        normalization: "Test fixture only",
        poolKey: culturalPoolKey(doc.candidates, kind),
      });
    }
  }
  return doc;
}
test("sample interactions cannot establish source consistency or live coverage", async () => {
  const checked = await inspectEventEvidence(sampleEvent());
  assert.equal(checked.consistent, false);
  assert.equal(checked.coverageComplete, false);
  assert.equal(checked.receipts.length, 0);
});
test("receipt inspection checks body hashes, derived affinities and current context independently", async () => {
  const doc = await fixture();
  const good = await inspectEventEvidence(doc);
  assert.equal(good.consistent, true);
  assert.equal(good.coverageComplete, true);
  assert(good.receipts.every((r) => r.currentContext));
  doc.evidence[0].entities[doc.candidates[0].id] = 0.9;
  const changedScores = await inspectEventEvidence(doc);
  assert.equal(changedScores.receipts[0].hashMatches, true);
  assert.equal(changedScores.receipts[0].affinitiesMatch, false);
  assert.equal(changedScores.consistent, false);
  assert.equal(changedScores.coverageComplete, false);
  doc.evidence[0].rawResponse = { results: [] };
  assert.equal(
    (await inspectEventEvidence(doc)).receipts[0].hashMatches,
    false,
  );
});
test("duplicate receipts and edited audience or roster references remain visible", async () => {
  const doc = await fixture();
  doc.brief.cohorts[0].seeds[0].id = "changed-interest";
  assert.equal(
    (await inspectEventEvidence(doc)).receipts[0].currentContext,
    false,
  );
  assert.equal((await inspectEventEvidence(doc)).coverageComplete, false);
  doc.candidates[0].entityId = "changed-roster-reference";
  assert.equal(
    (await inspectEventEvidence(doc)).receipts[2].currentContext,
    false,
  );
  doc.evidence.push(structuredClone(doc.evidence[0]));
  const duplicates = await inspectEventEvidence(doc);
  assert.equal(duplicates.duplicateIds, true);
  assert.equal(duplicates.consistent, false);
});
