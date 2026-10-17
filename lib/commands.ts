import { z } from "zod";
import { approve, propose, validate, metrics, objective } from "./planner.ts";
import {
  briefSchema,
  candidateFieldsSchema,
  zoneSchema,
  slotSchema,
  scenarioSchema,
  type EventDoc,
  type Candidate,
} from "./model.ts";
import { recoveryReport } from "./reports.ts";
export function applyCommand(
  before: EventDoc,
  action: string,
  body: Record<string, unknown>,
): { event: EventDoc; detail: string } {
  let after = structuredClone(before),
    detail = "";
  switch (action) {
    case "brief":
      after.brief = briefSchema.parse(body.brief);
      after.evidence = [];
      detail = "Updated event brief. Previous evidence invalidated.";
      break;
    case "mode":
      after.mode = z.enum(["demo", "live"]).parse(body.mode);
      detail = `Switched to ${after.mode}.`;
      break;
    case "candidate":
    case "addCandidate": {
      const fields = candidateFieldsSchema.parse({
        ...z.record(z.unknown()).parse(body.fields),
        kind:
          z.record(z.unknown()).parse(body.fields).kind ??
          after.candidates.find((c) => c.id === body.candidateId)?.kind,
      });
      let c = after.candidates.find((c) => c.id === body.candidateId);
      if (action === "addCandidate") {
        if (after.candidates.length >= 40)
          throw new Error("Maximum 40 participants.");
        c = {
          ...fields,
          id: crypto.randomUUID(),
          affinity: {},
          note: "Organizer supplied participant. Cultural evidence unresolved.",
          color: "#bcc99e",
        } as Candidate;
        after.candidates.push(c);
      } else if (!c) throw new Error("Participant not found.");
      if (
        action === "addCandidate" ||
        c!.name !== fields.name ||
        c!.kind !== fields.kind
      ) {
        c!.entityId = undefined;
        c!.culturalProfile = undefined;
        c!.proxyEntityIds = [];
        after.evidence = [];
      }
      Object.assign(c!, fields);
      detail = `Saved ${fields.name}. Terms are organizer supplied.`;
      break;
    }
    case "removeCandidate": {
      if (after.plan.some((a) => a.candidateId === body.candidateId))
        throw new Error(
          "Remove this participant from the plan before deleting it.",
        );
      after.candidates = after.candidates.filter(
        (c) => c.id !== body.candidateId,
      );
      after.evidence = [];
      detail = "Removed reserve participant.";
      break;
    }
    case "layout": {
      const zones = z.array(zoneSchema).max(30).parse(body.zones);
      if (new Set(zones.map((z) => z.id)).size !== zones.length)
        throw new Error("Zone IDs must be unique.");
      for (const old of before.zones) {
        if (
          before.plan.some(
            (a) => a.zoneId === old.id && before.locks?.includes(a.slotId),
          )
        ) {
          const next = zones.find((z) => z.id === old.id);
          if (
            !next ||
            JSON.stringify(next) !== JSON.stringify(zoneSchema.parse(old))
          )
            throw new Error(
              "Unlock placements before changing their zone geometry.",
            );
        }
      }
      after.zones = zones;
      detail = "Saved conceptual venue geometry.";
      break;
    }
    case "zone": {
      const zone = zoneSchema.parse(body.zone);
      const i = after.zones.findIndex((z) => z.id === zone.id);
      if (i >= 0) after.zones[i] = zone;
      else {
        if (after.zones.length >= 30) throw new Error("Maximum 30 zones.");
        after.zones.push(zone);
      }
      detail = `Saved ${zone.name}. Existing assignments need revalidation.`;
      break;
    }
    case "removeZone":
      if (after.plan.some((a) => a.zoneId === body.zoneId))
        throw new Error("Reassign participants before removing this zone.");
      after.zones = after.zones.filter((z) => z.id !== body.zoneId);
      detail = "Removed empty zone.";
      break;
    case "slot": {
      const slot = slotSchema.parse(body.slot),
        i = after.slots.findIndex((s) => s.id === slot.id);
      if (i >= 0) after.slots[i] = slot;
      else {
        if (after.slots.length >= 18)
          throw new Error("Maximum 18 program slots.");
        after.slots.push(slot);
      }
      detail = `Saved ${slot.name}.`;
      break;
    }
    case "removeSlot": {
      if (after.plan.some((a) => a.slotId === body.slotId))
        throw new Error(
          "An active program slot must be retained. Edit its schedule or propose a replacement assignment.",
        );
      after.slots = after.slots.filter((s) => s.id !== body.slotId);
      after.plan = after.plan.filter((a) => a.slotId !== body.slotId);
      detail = "Removed slot and draft assignment.";
      break;
    }
    case "lock": {
      const id = z.string().parse(body.slotId);
      if (!after.plan.some((a) => a.slotId === id))
        throw new Error("Assign the slot before locking it.");
      const locked = z.boolean().parse(body.locked);
      after.locks = locked
        ? [...new Set([...(after.locks ?? []), id])]
        : (after.locks ?? []).filter((v) => v !== id);
      detail = `${locked ? "Locked" : "Unlocked"} commitment ${id}.`;
      break;
    }
    case "assignment": {
      const a = z
        .object({
          slotId: z.string(),
          candidateId: z.string(),
          zoneId: z.string(),
        })
        .parse(body.assignment);
      const plan = [
        ...(after.draftPlan ?? after.plan).filter((b) => b.slotId !== a.slotId),
        a,
      ];
      const partial = {
        ...after,
        slots: after.slots.filter((s) => plan.some((a) => a.slotId === s.id)),
      };
      const errors = validate(partial, plan);
      if (errors.length) throw new Error(errors.join(" "));
      after.draftPlan = plan;
      detail =
        "Saved a draft assignment. Active plan unchanged. Submit the draft for approval.";
      break;
    }
    case "proposeDraft": {
      const plan = before.draftPlan;
      if (!plan) throw new Error("No assignment draft to review.");
      const errors = validate(before, plan);
      if (errors.length) throw new Error(errors.join(" "));
      const m = metrics(before, plan);
      after.proposal = {
        id: crypto.randomUUID(),
        baseRevision: before.revision,
        scenario: before.scenario,
        options: [
          {
            id: "manual-draft",
            assignments: plan,
            metrics: m,
            violations: [],
            objective: objective(before, m),
            conditional: m.unknowns.length > 0,
          },
        ],
        mode: before.mode,
        evidenceIds: before.evidence.map((e) => e.id),
        at: new Date().toISOString(),
        durationMs: 0,
        examined: 1,
        trace: [
          {
            tool: "validate_manual_draft",
            detail:
              "Validated organizer-supplied assignments. Active plan unchanged.",
          },
        ],
        status: "pending",
      };
      detail = "Submitted manual draft for approval.";
      break;
    }
    case "optimizer": {
      after.optimizer = z
        .object({
          version: z.literal("rank-v2"),
          relevance: z.number().min(0).max(100),
          balance: z.number().min(0).max(100),
          continuity: z.number().min(0).max(100),
          stability: z.number().min(0).max(100),
          maxNodes: z.number().int().min(100).max(50000),
        })
        .parse(body.optimizer);
      if (
        Object.entries(after.optimizer)
          .filter(([k]) => !["version", "maxNodes"].includes(k))
          .reduce((n, [, v]) => n + Number(v), 0) === 0
      )
        throw new Error("At least one objective needs positive weight.");
      detail = "Saved versioned ordinal-rank objective weights.";
      break;
    }
    case "offerings": {
      const c = after.candidates.find((c) => c.id === body.candidateId);
      if (!c || c.kind !== "vendor") throw new Error("Vendor not found.");
      c.offerings = z
        .array(
          z.object({
            id: z.string().min(1),
            name: z.string().min(1).max(100),
            available: z.boolean(),
            allergens: z.array(z.string().max(80)).max(30),
            restrictions: z.array(z.string().max(80)).max(30),
          }),
        )
        .max(30)
        .parse(body.offerings);
      if (new Set(c.offerings.map((o) => o.id)).size !== c.offerings.length)
        throw new Error("Offering IDs must be unique.");
      detail =
        "Saved organizer-declared menu inventory. No inferred ingredients.";
      break;
    }
    case "constraints":
      after.constraints = z
        .object({
          excludedAllergens: z.array(z.string().max(80)).max(30),
          minimumSpacing: z.number().min(0).max(20),
        })
        .parse(body.constraints);
      detail = "Saved organizer-supplied planning restrictions.";
      break;
    case "propose": {
      const scenario = scenarioSchema.parse(body.scenario);
      if (
        scenario.type === "cancellation" &&
        !before.candidates.some((c) => c.id === scenario.candidateId)
      )
        throw new Error("Participant not found.");
      if (
        scenario.type === "closure" &&
        !before.zones.some((z) => z.id === scenario.zoneId)
      )
        throw new Error("Zone not found.");
      after.proposal = propose(before, scenario);
      detail = `Proposed ${after.proposal.options.length} alternatives. Active plan unchanged.`;
      break;
    }
    case "approve":
      after = approve(before, z.string().parse(body.optionId));
      after.reports = [...(after.reports ?? []), recoveryReport(before, after)];
      detail = `Organizer approved proposal ${before.proposal?.id}, ${body.optionId}. Report saved.`;
      break;
    case "reject":
      if (!after.proposal || after.proposal.status !== "pending")
        throw new Error("No pending proposal.");
      after.proposal.status = "rejected";
      detail = "Organizer rejected proposal. Active plan unchanged.";
      break;
    default:
      throw new Error("Unknown command.");
  }
  if (!["propose", "proposeDraft", "approve", "reject"].includes(action))
    after.proposal = undefined;
  return { event: after, detail };
}
