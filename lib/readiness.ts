import { culturalRefs } from "./culture.ts";
import { rankScore, validate } from "./planner.ts";
import type { EventDoc } from "./model.ts";

export function eventReadiness(doc: EventDoc) {
  const kinds = [...new Set(doc.slots.map((s) => s.kind))];
  const active = doc.plan.map((a) =>
    doc.candidates.find((c) => c.id === a.candidateId),
  );
  const checks = [
    {
      id: "structure",
      label: "Add participants, programme slots and zones",
      view: "lineup",
      done:
        doc.slots.length > 0 &&
        doc.candidates.length > 0 &&
        doc.zones.length > 0,
    },
    {
      id: "audience",
      label: "Resolve interests for every audience group",
      view: "brief",
      done: doc.brief.cohorts.every((c) => c.seeds.length > 0),
    },
    {
      id: "identities",
      label: "Resolve participants or explicit vendor references",
      view: "lineup",
      done:
        doc.candidates.length > 0 &&
        doc.candidates.every((c) => culturalRefs(c).length > 0),
    },
    {
      id: "evidence",
      label: "Collect comparable evidence for every audience and domain",
      view: "evidence",
      done:
        doc.mode === "live" &&
        kinds.length > 0 &&
        doc.brief.cohorts.every((co) =>
          kinds.every((kind) => {
            const roster = doc.candidates.filter((c) => c.kind === kind);
            return (
              roster.length > 0 &&
              roster.every((c) => rankScore(doc, c.id, co.id) !== undefined)
            );
          }),
        ),
    },
    {
      id: "plan",
      label: "Build a complete plan that passes operational checks",
      view: "lineup",
      done: doc.slots.length > 0 && validate(doc, doc.plan).length === 0,
    },
    {
      id: "terms",
      label: "Confirm fees and availability for the active plan",
      view: "lineup",
      done:
        active.length > 0 &&
        active.every(
          (c) =>
            c &&
            c.feeKnown === true &&
            c.availabilityKnown === true &&
            c.verified === true,
        ),
    },
  ];
  return {
    checks,
    completed: checks.filter((c) => c.done).length,
    total: checks.length,
  };
}
