import { fingerprint } from "./fingerprint.ts";
import {
  defaultOptimizer,
  type EventDoc,
  type RecoveryReport,
} from "./model.ts";
export function recoveryReport(
  before: EventDoc,
  after: EventDoc,
): RecoveryReport {
  const p = after.proposal!,
    o = p.options.find((o) => o.id === p.selectedId)!;
  return {
    id: crypto.randomUUID(),
    mode: after.mode,
    evidenceSnapshot: structuredClone(
      before.evidence.filter((e) => p.evidenceIds.includes(e.id)),
    ),
    decisionSnapshot: structuredClone({
      scenario: p.scenario,
      optimizer: p.optimizer ?? before.optimizer ?? defaultOptimizer,
      metrics: o.metrics,
      revision: before.revision,
    }),
    proposalId: p.id,
    at: new Date().toISOString(),
    status: "approved",
    summary: `${before.brief.name}: organizer approved ${o.metrics.changes} assignment changes after ${p.scenario.type}.`,
    before: structuredClone(before.plan),
    after: structuredClone(after.plan),
    changes: after.plan.flatMap((a) => {
      const old = before.plan.find((b) => b.slotId === a.slotId);
      if (old?.candidateId === a.candidateId && old.zoneId === a.zoneId)
        return [];
      return [
        {
          slot: after.slots.find((s) => s.id === a.slotId)?.name ?? a.slotId,
          from:
            before.candidates.find((c) => c.id === old?.candidateId)?.name ??
            "Unassigned",
          to:
            after.candidates.find((c) => c.id === a.candidateId)?.name ??
            a.candidateId,
          location:
            after.zones.find((z) => z.id === a.zoneId)?.name ?? a.zoneId,
        },
      ];
    }),
    checks: [
      "Budget",
      "Schedule",
      "Power",
      "Capacity",
      "Footprint",
      "Category restrictions",
      "Locked commitments",
    ],
    unknowns: o.metrics.unknowns,
    evidenceIds: p.evidenceIds,
    fingerprint: fingerprint(before, after.plan),
    limitations: [
      after.mode === "demo"
        ? "Synthetic cultural data. This is a demonstration report."
        : "Query-relative ordinal ranks are planning heuristics, not outcome predictions.",
      p.truncated
        ? "Search bound reached. No optimality claim."
        : "Bounded search completed for this roster.",
      "Organizer-supplied layout does not certify venue safety.",
    ],
  };
}
