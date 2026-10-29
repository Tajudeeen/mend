import { test } from "node:test";
import assert from "node:assert/strict";
import { goldenCases } from "../scripts/evaluation/golden-cases.ts";
import { propose } from "../lib/planner.ts";
test("50 live-model golden prompts have unique IDs and independently feasible/infeasible expectations", () => {
  assert.equal(goldenCases.length, 50);
  assert.equal(new Set(goldenCases.map((c) => c.id)).size, 50);
  for (const c of goldenCases.filter((c) => c.id.split("-")[1] === "0"))
    assert.equal(
      propose(c.event(), c.scenario).options.length > 0,
      c.feasible,
      c.id,
    );
});
