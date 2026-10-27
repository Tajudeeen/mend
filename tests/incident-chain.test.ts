import { test } from "node:test";
import assert from "node:assert/strict";
import { sampleEvent } from "../lib/seed.ts";
import { propose, approve, validate } from "../lib/planner.ts";
import { applyCommand } from "../lib/commands.ts";
import type { EventDoc, Scenario } from "../lib/model.ts";

function commit(doc: EventDoc, scenario: Scenario) {
  doc.proposal = propose(doc, scenario);
  assert(doc.proposal.options.length, "Fixture must have a successful repair");
  doc.revision++;
  return approve(doc, doc.proposal.options[0].id);
}

test("approved cancellations survive subsequent repairs and assignment restoration", () => {
  const original = sampleEvent();
  const repaired = commit(original, {
    type: "cancellation",
    candidateId: "a1",
  });
  assert.equal(
    repaired.candidates.find((c) => c.id === "a1")?.available,
    false,
  );
  assert.equal(original.candidates.find((c) => c.id === "a1")?.available, true);
  const next = propose(repaired, { type: "none" });
  assert(next.options.length);
  assert(
    next.options.every((o) =>
      o.assignments.every((a) => a.candidateId !== "a1"),
    ),
  );
  assert(
    validate(repaired, original.plan).some((e) => e.includes("unavailable")),
  );
});

test("approved rain closures remain closed when the next incident is a cancellation", () => {
  const repaired = commit(sampleEvent(), { type: "rain" });
  assert(repaired.zones.filter((z) => !z.covered).every((z) => z.blocked));
  const next = propose(repaired, {
    type: "cancellation",
    candidateId: repaired.plan[0].candidateId,
  });
  assert(next.options.length);
  const blocked = new Set(
    repaired.zones.filter((z) => z.blocked).map((z) => z.id),
  );
  assert(
    next.options.every((o) =>
      o.assignments.every((a) => !blocked.has(a.zoneId)),
    ),
  );
});

test("approved budget cuts remain the budget for later repairs", () => {
  const repaired = commit(sampleEvent(), { type: "budget", budget: 5000 });
  assert.equal(repaired.brief.budget, 5000);
  const next = propose(repaired, { type: "none" });
  assert(next.options.length);
  assert(next.options.every((o) => o.metrics.cost <= 5000));
});

test("substitution exclusions add to global restrictions and compare normalized allergen names", () => {
  const doc = sampleEvent();
  doc.constraints!.excludedAllergens = [" NUTS "];
  doc.candidates.find((c) => c.id === "v1")!.offerings![1].allergens = ["nuts"];
  const proposal = propose(doc, {
    type: "offering",
    candidateId: "v1",
    offeringId: "original",
    excludedAllergens: [],
  });
  assert.equal(proposal.options.length, 0);
});

test("approval rechecks a substitution against current inventory", () => {
  const doc = sampleEvent();
  doc.proposal = propose(doc, {
    type: "offering",
    candidateId: "v1",
    offeringId: "original",
  });
  assert(doc.proposal.options.length);
  doc.revision++;
  doc.candidates.find((c) => c.id === "v1")!.offerings![1].available = false;
  assert.throws(
    () => approve(doc, doc.proposal!.options[0].id),
    /offering substitution/,
  );
});

test("unsupported physical spacing is refused instead of silently ignored", () => {
  assert.throws(
    () =>
      applyCommand(sampleEvent(), "constraints", {
        constraints: { minimumSpacing: 2, excludedAllergens: [] },
      }),
    /scaled venue plan/,
  );
});

test("unknown incidents are refused at the planner boundary used by the agent", () => {
  assert.throws(
    () =>
      propose(sampleEvent(), { type: "cancellation", candidateId: "missing" }),
    /Participant not found/,
  );
  assert.throws(
    () => propose(sampleEvent(), { type: "closure", zoneId: "missing" }),
    /Zone not found/,
  );
  assert.throws(
    () =>
      propose(sampleEvent(), {
        type: "offering",
        candidateId: "a1",
        offeringId: "missing",
      }),
    /Vendor offering not found/,
  );
});

test("deliberate budget edits after approval are not overridden by the prior scenario", () => {
  const repaired = commit(sampleEvent(), { type: "budget", budget: 5000 });
  const edited = applyCommand(repaired, "brief", {
    brief: { ...repaired.brief, budget: 6000 },
  }).event;
  assert.equal(edited.scenario.type, "none");
  assert.equal(edited.brief.budget, 6000);
});
