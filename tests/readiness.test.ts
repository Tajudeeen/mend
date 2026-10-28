import { test } from "node:test";
import assert from "node:assert/strict";
import { eventReadiness } from "../lib/readiness.ts";
import { sampleEvent } from "../lib/seed.ts";
import { newEvent } from "../lib/new-event.ts";
import { culturalPoolKey } from "../lib/culture.ts";

test("blank events show all required event inputs and samples never establish live evidence", () => {
  assert.equal(eventReadiness(newEvent(sampleEvent().brief)).completed, 0);
  assert.equal(
    eventReadiness(sampleEvent()).checks.find((c) => c.id === "evidence")?.done,
    false,
  );
});
test("readiness matches planner coverage and responds to stale roster or unknown terms", () => {
  const doc = sampleEvent();
  doc.mode = "live";
  doc.candidates.forEach((c) => {
    c.entityId = c.id;
    c.verified = true;
  });
  doc.brief.cohorts.forEach((co) => {
    co.seeds = [{ id: "fixture-interest", name: "Fixture interest" }];
  });
  doc.evidence = doc.brief.cohorts.flatMap((co) =>
    (["artist", "vendor"] as const).map((kind) => ({
      id: crypto.randomUUID(),
      provider: "qloo" as const,
      at: new Date().toISOString(),
      endpoint: "/v2/insights",
      params: {},
      responseHash: "fixture-not-live",
      rawResponse: {},
      entities: Object.fromEntries(
        doc.candidates
          .filter((c) => c.kind === kind)
          .map((c) => [c.id, c.affinity[co.id]]),
      ),
      cohortId: co.id,
      kind,
      explainability: {},
      normalization: "fixture",
      poolKey: culturalPoolKey(doc.candidates, kind),
    })),
  );
  assert.equal(eventReadiness(doc).completed, 6);
  doc.candidates[0].feeKnown = false;
  assert.equal(
    eventReadiness(doc).checks.find((c) => c.id === "terms")?.done,
    false,
  );
  doc.candidates[0].entityId = "changed-reference";
  assert.equal(
    eventReadiness(doc).checks.find((c) => c.id === "evidence")?.done,
    false,
  );
});
