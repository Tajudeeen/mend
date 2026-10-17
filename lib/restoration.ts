import type { EventDoc } from "./model.ts";
import { applyCommand } from "./commands.ts";

// Restore assignments as a new approval request, never historical booking facts or evidence.
export function proposeRestoration(current: EventDoc, historical: EventDoc) {
  if (historical.id !== current.id || historical.revision >= current.revision)
    throw new Error("Choose an earlier revision of this event.");
  const result = applyCommand(
    { ...current, draftPlan: structuredClone(historical.plan) },
    "proposeDraft",
    {},
  );
  result.event.proposal!.originRevision = historical.revision;
  result.event.proposal!.trace.push({
    tool: "restore_assignments",
    detail: `Assignments from revision ${historical.revision} were checked against current budget, terms, constraints and locks. Current facts and evidence retained.`,
  });
  result.detail = `Proposed assignments from revision ${historical.revision}. Current active plan unchanged; approval required.`;
  return result;
}
