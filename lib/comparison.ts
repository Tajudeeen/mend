import { defaultOptimizer, type EventDoc, type Scenario } from "./model.ts";
import { propose, validate } from "./planner.ts";

/** Read-only comparison. Neither result is an approval request. */
export function compareRepairs(input: EventDoc, scenario: Scenario) {
  const doc = structuredClone(input);
  doc.optimizer = {
    ...(doc.optimizer ?? defaultOptimizer),
    maxNodes: Math.min(
      doc.optimizer?.maxNodes ?? defaultOptimizer.maxNodes,
      5000,
    ),
  };
  const cultural = propose(doc, scenario);
  const rules = propose(doc, scenario, "rules-only");
  const key = (plan: typeof doc.plan | undefined) =>
    JSON.stringify(
      plan
        ?.map((a) => ({ ...a }))
        .sort((a, b) => a.slotId.localeCompare(b.slotId)) ?? null,
    );
  for (const proposal of [cultural, rules])
    for (const option of proposal.options) {
      if (validate(doc, option.assignments, scenario).length)
        throw new Error("Comparison returned an invalid allocation.");
    }
  return {
    format: "mend-comparison-v1",
    mode: doc.mode,
    revision: doc.revision,
    scenario,
    cultural: {
      assignments: cultural.options[0]?.assignments ?? null,
      cost: cultural.options[0]?.metrics.cost ?? null,
      truncated: cultural.truncated ?? false,
      examined: cultural.examined,
    },
    rulesOnly: {
      assignments: rules.options[0]?.assignments ?? null,
      cost: rules.options[0]?.metrics.cost ?? null,
      truncated: rules.truncated ?? false,
      examined: rules.examined,
    },
    assignmentChanged:
      key(cultural.options[0]?.assignments) !==
      key(rules.options[0]?.assignments),
    maxNodes: doc.optimizer.maxNodes,
    evidenceIds: doc.mode === "live" ? doc.evidence.map((e) => e.id) : [],
    inputSnapshot: {
      id: doc.id,
      revision: doc.revision,
      createdAt: doc.createdAt,
      brief: doc.brief,
      candidates: doc.candidates,
      slots: doc.slots,
      zones: doc.zones,
      plan: doc.plan,
      referencePlan: doc.referencePlan,
      constraints: doc.constraints,
      locks: doc.locks,
      mode: doc.mode,
      evidence: doc.evidence,
      optimizer: doc.optimizer,
      scenario: doc.scenario,
    },
    limitation:
      "Both searches use the same roster, operational constraints and node limit. Rules-only ignores cultural ranking and prioritizes existing assignments. Search ordering can affect truncated results. A different assignment is not proof of a better outcome. This is not an LLM-only benchmark or an optimality claim.",
  };
}
