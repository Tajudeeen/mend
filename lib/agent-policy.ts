import { z } from "zod";
import type { EventDoc, AgentRun, AgentStep } from "./model.ts";
export const groundedClaimSchema = z.object({
  kind: z.enum(["operational", "cultural", "limitation"]),
  text: z.string().min(1).max(500),
  evidenceIds: z.array(z.string().uuid()).max(8),
});
export function supportedCulturalStatements(doc: EventDoc) {
  return doc.evidence.flatMap((e) => [
    {
      text: `Qloo receipt ${e.id} contains ${Object.keys(e.entities).length} query-relative ${e.kind} affinities for audience ${e.cohortId}.`,
      evidenceIds: [e.id],
    },
    ...Object.entries(e.entities).map(([id, value]) => ({
      text: `Qloo reported query-relative affinity ${value} for entity ${id} in receipt ${e.id}.`,
      evidenceIds: [e.id],
    })),
  ]);
}
export function groundedClaims(input: unknown, doc: EventDoc) {
  const claims = z.array(groundedClaimSchema).max(10).parse(input);
  for (const c of claims) {
    if (c.evidenceIds.some((id) => !doc.evidence.some((e) => e.id === id)))
      throw new Error("Claim references unknown evidence.");
    if (
      c.kind === "cultural" &&
      c.evidenceIds.length &&
      !supportedCulturalStatements(doc).some(
        (v) =>
          v.text === c.text &&
          v.evidenceIds.every((id) => c.evidenceIds.includes(id)),
      )
    )
      throw new Error(
        "Cultural claim is not supported by a reproducible source statement.",
      );
    if (c.kind === "cultural" && !c.evidenceIds.length)
      throw new Error("Cultural claims require source evidence.");
    if (
      /guarantee|predict.*attendance|will sell|food.safe|legally approved/i.test(
        c.text,
      )
    )
      throw new Error("Unsupported outcome or certification claim.");
  }
  return claims;
}
export const agentTools = [
  "get_event_plan",
  "get_event_constraints",
  "resolve_cultural_entity",
  "search_cultural_tags",
  "get_cultural_insights",
  "find_replacement_candidates",
  "generate_feasible_allocations",
  "validate_hard_constraints",
  "evaluate_cultural_continuity",
  "inspect_evidence",
  "prepare_approval_request",
  "finish_investigation",
] as const;
export function recordStep(
  run: AgentRun,
  tool: string,
  input: unknown,
  output: unknown,
  trigger: "model" | "server" = "model",
) {
  if (!agentTools.includes(tool as (typeof agentTools)[number]))
    throw new Error("Tool is outside the allowed registry.");
  if (run.steps.length >= 16) throw new Error("Agent tool budget exhausted.");
  const step: AgentStep = {
    trigger,
    id: crypto.randomUUID(),
    tool,
    input,
    output,
    at: new Date().toISOString(),
  };
  run.steps.push(step);
  return output;
}
export function newRun(instruction: string): AgentRun {
  return {
    id: crypto.randomUUID(),
    state: "validating",
    at: new Date().toISOString(),
    instruction,
    steps: [],
  };
}
