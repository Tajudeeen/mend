import { dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { writeFile, mkdir } from "node:fs/promises";
import { sampleEvent } from "../../lib/seed.ts";
import { propose, validate } from "../../lib/planner.ts";
import {
  defaultOptimizer,
  type EventDoc,
  type Scenario,
} from "../../lib/model.ts";
const cases: {
  name: string;
  scenario: Scenario;
  change?: (d: EventDoc) => void;
}[] = [
  ...["a1", "a2", "v1", "v2", "v3"].map((candidateId) => ({
    name: "withdrawal-" + candidateId,
    scenario: { type: "cancellation" as const, candidateId },
  })),
  ...["main", "grove", "east", "court", "west"].map((zoneId) => ({
    name: "closure-" + zoneId,
    scenario: { type: "closure" as const, zoneId },
  })),
  { name: "rain", scenario: { type: "rain" } },
  ...[100, 3500, 5000].map((budget) => ({
    name: "budget-" + budget,
    scenario: { type: "budget" as const, budget },
  })),
  {
    name: "locked-cancelled-headliner",
    scenario: { type: "cancellation", candidateId: "a1" },
    change: (d) => {
      d.locks = ["opening"];
    },
  },
  {
    name: "capacity-shortfall",
    scenario: { type: "none" },
    change: (d) => {
      d.brief.attendees = 1000;
    },
  },
  {
    name: "power-loss",
    scenario: { type: "none" },
    change: (d) => {
      d.zones.forEach((z) => (z.power = 1));
    },
  },
  {
    name: "footprint-conflict",
    scenario: { type: "none" },
    change: (d) => {
      d.candidates.forEach((c) => (c.width = 60));
      d.zones.forEach((z) => (z.width = 5));
    },
  },
  {
    name: "unknown-fee",
    scenario: { type: "none" },
    change: (d) => {
      d.candidates[0].feeKnown = false;
    },
  },
  {
    name: "offering-loss",
    scenario: {
      type: "offering",
      candidateId: "v1",
      offeringId: "original",
      excludedAllergens: ["nuts"],
    },
  },
];
const results = [];
for (const test of cases) {
  for (const method of ["rules-only", "synthetic-rank-planner"] as const) {
    const d = sampleEvent();
    test.change?.(d);
    d.optimizer = {
      ...defaultOptimizer,
      maxNodes: 5000,
      ...(method === "rules-only"
        ? { relevance: 0, balance: 0, continuity: 0, stability: 100 }
        : {}),
    };
    const p = propose(
      d,
      test.scenario,
      method === "rules-only" ? "rules-only" : "cultural",
    );
    results.push({
      scenario: test.name,
      method,
      options: p.options.length,
      violations: p.options.reduce(
        (n, o) => n + validate(d, o.assignments, p.scenario).length,
        0,
      ),
      durationMs: p.durationMs,
      examined: p.examined,
      truncated: p.truncated,
      changes: p.options[0]?.metrics.changes ?? null,
      conditional: p.options[0]?.conditional ?? null,
    });
  }
}
const report = {
  createdAt: new Date().toISOString(),
  sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  fixture: "lib/seed.ts",
  maxNodesPerRun: 5000,
  mode: "synthetic fixtures only",
  scenarioCount: cases.length,
  claim:
    "This measures software behavior, not the real-world value of Qloo or organizer impact.",
  unrun: [
    "LLM without Qloo: provider credentials unavailable",
    "MEND with live Qloo: key and feasibility data unavailable",
  ],
  results,
};
const output = process.argv[2] ?? "outputs/synthetic-results.json";
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + "\n");
if (
  results.some((r) => r.violations > 0) ||
  !results.some((r) => r.options > 0)
)
  process.exitCode = 1;
console.log(
  JSON.stringify({
    scenarios: cases.length,
    runs: results.length,
    violations: results.reduce((n, r) => n + r.violations, 0),
    liveQlooVerified: false,
  }),
);
