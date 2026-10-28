import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { sampleEvent } from "../lib/seed.ts";
import { compareRepairs } from "../lib/comparison.ts";
import { validate } from "../lib/planner.ts";

function fixture() {
  const doc = sampleEvent();
  doc.candidates = doc.candidates
    .filter((c) => c.kind === "artist")
    .slice(0, 3);
  doc.slots = doc.slots.slice(0, 1);
  doc.plan = doc.plan.slice(0, 1);
  doc.zones = doc.zones.filter((z) => z.kind === "artist");
  return doc;
}
test("comparison preserves event/approval state and checks both returned allocations", () => {
  const doc = fixture();
  const before = JSON.stringify(doc);
  const result = compareRepairs(doc, {
    type: "cancellation",
    candidateId: "a1",
  });
  assert.equal(JSON.stringify(doc), before);
  assert(result.cultural.assignments);
  assert(result.rulesOnly.assignments);
  for (const plan of [
    result.cultural.assignments,
    result.rulesOnly.assignments,
  ])
    assert.deepEqual(validate(doc, plan, result.scenario), []);
  assert.equal(result.mode, "demo");
  assert.deepEqual(result.evidenceIds, []);
  assert(result.maxNodes <= 5000);
});
test("live comparison refuses absent cultural evidence instead of using fixture values", () => {
  const doc = fixture();
  doc.mode = "live";
  assert.throws(
    () => compareRepairs(doc, { type: "none" }),
    /collect Qloo evidence/,
  );
});
test("comparison export reproduces offline and modified assignments are rejected", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "mend-comparison-"));
  try {
    const result = compareRepairs(fixture(), {
      type: "cancellation",
      candidateId: "a1",
    });
    const file = path.join(dir, "comparison.json");
    const run = () =>
      execFileSync(
        process.execPath,
        ["--experimental-strip-types", "scripts/reproduce-comparison.ts", file],
        { encoding: "utf8", stdio: "pipe" },
      );
    await writeFile(file, JSON.stringify(result));
    assert.equal(JSON.parse(run()).status, "reproduced");
    result.cultural.assignments![0].candidateId = "a1";
    await writeFile(file, JSON.stringify(result));
    assert.throws(
      run,
      (error: unknown) => (error as { status?: number }).status === 1,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("rules-only choices ignore changes to preference values", () => {
  const doc = fixture();
  doc.optimizer = {
    version: "rank-v2",
    relevance: 100,
    balance: 0,
    continuity: 0,
    stability: 0,
    maxNodes: 1000,
  };
  const scenario = { type: "cancellation" as const, candidateId: "a1" };
  doc.candidates[1].affinity = { pulse: 1, soul: 1, explore: 1 };
  doc.candidates[2].affinity = { pulse: 0, soul: 0, explore: 0 };
  const before = compareRepairs(doc, scenario);
  doc.candidates[1].affinity = { pulse: 0, soul: 0, explore: 0 };
  doc.candidates[2].affinity = { pulse: 1, soul: 1, explore: 1 };
  const after = compareRepairs(doc, scenario);
  assert.deepEqual(before.rulesOnly.assignments, after.rulesOnly.assignments);
  assert.notDeepEqual(before.cultural.assignments, after.cultural.assignments);
});
