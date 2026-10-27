import { test } from "node:test";
import assert from "node:assert/strict";
import { sampleEvent } from "../lib/seed.ts";
import { applyCommand } from "../lib/commands.ts";
import { reportEvidence } from "../lib/report-evidence.ts";
import type { Evidence } from "../lib/model.ts";

test("approved reports retain detached receipts and decision inputs after evidence refresh", () => {
  const doc = sampleEvent();
  const receipt: Evidence = {
    id: crypto.randomUUID(),
    provider: "qloo",
    at: new Date().toISOString(),
    endpoint: "/v2/insights",
    params: {},
    responseHash: "synthetic-test-only",
    rawResponse: { syntheticTest: true },
    entities: { fixture: 0.7 },
    explainability: {},
    cohortId: "pulse",
    kind: "artist",
    normalization: "test fixture",
  };
  doc.evidence = [receipt];
  const proposed = applyCommand(doc, "propose", {
    scenario: { type: "cancellation", candidateId: "a1" },
  }).event;
  proposed.revision++;
  const approved = applyCommand(proposed, "approve", {
    optionId: proposed.proposal!.options[0].id,
  }).event;
  const report = approved.reports![0];
  approved.evidence = [];
  proposed.evidence[0].entities.fixture = 0;
  approved.plan[0].candidateId = "later-edit";
  assert.equal(report.evidenceSnapshot?.[0].entities.fixture, 0.7);
  assert.notEqual(report.after[0].candidateId, "later-edit");
  assert.equal(report.decisionSnapshot?.scenario.type, "cancellation");
  assert.equal(report.mode, "demo");
  assert.deepEqual(reportEvidence(report, []).missingIds, []);
});

test("legacy reports disclose lost receipts rather than imply evidence completeness", () => {
  const doc = sampleEvent();
  const proposed = applyCommand(doc, "propose", {
    scenario: { type: "none" },
  }).event;
  proposed.revision++;
  const approved = applyCommand(proposed, "approve", {
    optionId: proposed.proposal!.options[0].id,
  }).event;
  const report = approved.reports![0];
  delete report.evidenceSnapshot;
  report.evidenceIds = ["lost-receipt"];
  assert.deepEqual(reportEvidence(report, []), {
    receipts: [],
    missingIds: ["lost-receipt"],
  });
});
