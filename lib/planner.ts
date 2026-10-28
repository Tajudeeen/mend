import { culturalRefs, culturalPoolKey, midrank } from "./culture.ts";
import {
  effective,
  defaultOptimizer,
  type Assignment,
  type EventDoc,
  type Metrics,
  type Option,
  type Proposal,
  type Scenario,
} from "./model.ts";
export function score(
  doc: EventDoc,
  id: string,
  cohortId: string,
): number | undefined {
  const c = doc.candidates.find((c) => c.id === id);
  if (!c) return;
  if (doc.mode === "demo") return c.affinity[cohortId];
  if (!c.entityId) return;
  const e = [...doc.evidence]
    .reverse()
    .find((e) => e.cohortId === cohortId && e.kind === c.kind);
  return e?.entities[c.entityId];
}
/** Ordinal aggregation never mixes raw values from independent query contexts. */
export function rankScore(
  doc: EventDoc,
  id: string,
  cohortId: string,
): number | undefined {
  const candidate = doc.candidates.find((c) => c.id === id);
  if (!candidate) return;
  if (doc.mode === "demo") {
    const value = candidate.affinity[cohortId];
    if (value === undefined) return;
    const pool = doc.candidates
      .filter((c) => c.kind === candidate.kind)
      .map((c) => c.affinity[cohortId])
      .filter((v): v is number => v !== undefined);
    return midrank(value, pool);
  }
  const receipt = [...doc.evidence]
    .reverse()
    .find((e) => e.cohortId === cohortId && e.kind === candidate.kind);
  if (
    !receipt ||
    (receipt.poolKey &&
      receipt.poolKey !== culturalPoolKey(doc.candidates, candidate.kind))
  )
    return;
  const entityPool = Object.values(receipt.entities);
  const profileIndex = (c: typeof candidate) => {
    const refs = culturalRefs(c);
    if (!refs.length || refs.some((ref) => receipt.entities[ref] === undefined))
      return undefined;
    return (
      refs.reduce(
        (sum, ref) => sum + midrank(receipt.entities[ref], entityPool),
        0,
      ) / refs.length
    );
  };
  const value = profileIndex(candidate);
  if (value === undefined) return;
  const pool = doc.candidates
    .filter((c) => c.kind === candidate.kind)
    .map(profileIndex)
    .filter((v): v is number => v !== undefined);
  return midrank(value, pool);
}
export function validate(
  doc: EventDoc,
  plan: Assignment[],
  scenario: Scenario = doc.scenario,
): string[] {
  const r = effective(doc, scenario),
    errors: string[] = [];
  if ((doc.constraints?.minimumSpacing ?? 0) > 0)
    errors.push(
      "Spacing checks need a scaled venue plan. Remove the unsupported spacing requirement before planning.",
    );
  if (plan.length !== doc.slots.length)
    errors.push("Every program slot needs an assignment.");
  if (new Set(plan.map((a) => a.slotId)).size !== plan.length)
    errors.push("Duplicate program slot.");
  if (new Set(plan.map((a) => a.candidateId)).size !== plan.length)
    errors.push("A participant cannot fill two slots.");
  let cost = 0;
  for (const a of plan) {
    const s = doc.slots.find((s) => s.id === a.slotId),
      c = doc.candidates.find((c) => c.id === a.candidateId),
      z = doc.zones.find((z) => z.id === a.zoneId);
    if (!s || !c || !z) {
      errors.push("Unknown slot, participant or zone.");
      continue;
    }
    cost += c.feeKnown === false ? 0 : c.fee;
    if (s.kind !== c.kind || z.kind !== s.kind)
      errors.push(`${c.name}: incompatible slot or zone.`);
    if (c.excluded || !c.available || r.unavailable.includes(c.id))
      errors.push(`${c.name}: unavailable or excluded.`);
    if (c.from > s.from || c.to < s.to)
      errors.push(`${c.name}: outside availability window.`);
    if (r.closedZones.includes(z.id))
      errors.push(`${z.name}: closed by this scenario.`);
    if (z.kind === "artist" && z.capacity < doc.brief.attendees)
      errors.push(`${z.name}: audience exceeds capacity.`);
    if ((c.width ?? 2) > (z.width ?? 100) || (c.depth ?? 2) > (z.depth ?? 100))
      errors.push(`${c.name}: footprint exceeds ${z.name}.`);
    if (
      z.allowedCategories?.length &&
      !z.allowedCategories.includes(c.category)
    )
      errors.push(`${c.name}: category not permitted in ${z.name}.`);
    if (doc.locks?.includes(a.slotId)) {
      const old = doc.plan.find((v) => v.slotId === a.slotId);
      if (old && (old.candidateId !== a.candidateId || old.zoneId !== a.zoneId))
        errors.push(`${s.name}: locked commitment changed.`);
    }
  }
  if (cost > r.budget) errors.push(`Budget exceeded by $${cost - r.budget}.`);
  for (const z of doc.zones) {
    const aa = plan.filter((a) => a.zoneId === z.id);
    for (const t of doc.slots.flatMap((s) => [s.from, s.to])) {
      const active = aa.filter((a) => {
        const s = doc.slots.find((s) => s.id === a.slotId);
        return s && s.from <= t && s.to > t;
      });
      const power = active.reduce(
        (n, a) =>
          n + (doc.candidates.find((c) => c.id === a.candidateId)?.power ?? 0),
        0,
      );
      if (power > z.power)
        errors.push(
          `${z.name}: simultaneous power demand exceeds ${z.power} kW.`,
        );
      if (active.length > (z.kind === "artist" ? 1 : z.capacity))
        errors.push(`${z.name}: concurrent occupancy exceeds capacity.`);
    }
  }
  return [...new Set(errors)];
}
export function metrics(doc: EventDoc, plan: Assignment[]): Metrics {
  const cohorts: Record<string, number> = {},
    domains: Record<string, number> = {},
    unknowns: string[] = [];
  const reference = doc.referencePlan ?? doc.plan;
  let displacement = 0,
    contexts = 0;
  for (const co of doc.brief.cohorts) {
    const domainValues: number[] = [];
    for (const kind of ["artist", "vendor"] as const) {
      const aa = plan.filter(
        (a) =>
          doc.candidates.find((c) => c.id === a.candidateId)?.kind === kind,
      );
      if (!aa.length) continue;
      const ss = aa.map((a) => rankScore(doc, a.candidateId, co.id));
      if (ss.some((s) => s === undefined))
        unknowns.push(`Missing ${kind} evidence for ${co.name}`);
      const v = ss.reduce<number>((n, s) => n + (s ?? 0), 0) / aa.length;
      domains[co.id + ":" + kind] = v;
      domainValues.push(v);
      const rr = reference
        .filter(
          (a) =>
            doc.candidates.find((c) => c.id === a.candidateId)?.kind === kind,
        )
        .map((a) => rankScore(doc, a.candidateId, co.id));
      if (
        rr.length &&
        rr.every((s) => s !== undefined) &&
        ss.every((s) => s !== undefined)
      ) {
        const old = rr.reduce<number>((n, s) => n + s!, 0) / rr.length;
        displacement += Math.abs(old - v);
        contexts++;
      }
    }
    cohorts[co.id] = domainValues.length
      ? domainValues.reduce((a, b) => a + b, 0) / domainValues.length
      : 0;
  }
  for (const a of plan) {
    const c = doc.candidates.find((c) => c.id === a.candidateId);
    if (c?.feeKnown === false) unknowns.push(`${c.name}: fee unknown`);
    if (c?.availabilityKnown === false || c?.verified === false)
      unknowns.push(`${c.name}: availability/terms unconfirmed`);
  }
  const total = doc.brief.cohorts.reduce((n, c) => n + c.weight, 0) || 1,
    changes = plan.filter((a) => {
      const old = doc.plan.find((o) => o.slotId === a.slotId);
      return old?.candidateId !== a.candidateId || old?.zoneId !== a.zoneId;
    }).length;
  return {
    cost: plan.reduce((n, a) => {
      const c = doc.candidates.find((c) => c.id === a.candidateId);
      return n + (c?.feeKnown === false ? 0 : (c?.fee ?? 0));
    }, 0),
    weighted: doc.brief.cohorts.reduce(
      (n, c) => n + (cohorts[c.id] * c.weight) / total,
      0,
    ),
    floor: Math.min(...Object.values(cohorts), 1),
    cohorts,
    domains,
    changes,
    unknowns: [...new Set(unknowns)],
    continuity: contexts ? 1 - displacement / contexts : 0,
    stability: 1 - changes / Math.max(1, plan.length),
  };
}
export function objective(doc: EventDoc, m: Metrics) {
  const c = doc.optimizer ?? defaultOptimizer,
    total = c.relevance + c.balance + c.continuity + c.stability || 1;
  return (
    (c.relevance * m.weighted +
      c.balance * m.floor +
      c.continuity * m.continuity +
      c.stability * m.stability) /
    total
  );
}
function excludedAllergens(doc: EventDoc, scenario: Scenario) {
  return new Set(
    [
      ...(doc.constraints?.excludedAllergens ?? []),
      ...(scenario.excludedAllergens ?? []),
    ].map((value) => value.trim().toLowerCase()),
  );
}

export function propose(
  doc: EventDoc,
  scenario: Scenario,
  strategy: "cultural" | "rules-only" = "cultural",
): Proposal {
  if (
    scenario.type === "cancellation" &&
    !doc.candidates.some((c) => c.id === scenario.candidateId)
  )
    throw new Error("Participant not found.");
  if (
    scenario.type === "closure" &&
    !doc.zones.some((z) => z.id === scenario.zoneId)
  )
    throw new Error("Zone not found.");
  if (
    scenario.type === "offering" &&
    !doc.candidates.some(
      (c) =>
        c.id === scenario.candidateId &&
        c.kind === "vendor" &&
        c.offerings?.some((o) => o.id === scenario.offeringId),
    )
  )
    throw new Error("Vendor offering not found.");
  if (strategy === "rules-only")
    doc = {
      ...doc,
      optimizer: {
        ...(doc.optimizer ?? defaultOptimizer),
        relevance: 0,
        balance: 0,
        continuity: 0,
        stability: 100,
      },
    };
  const start = performance.now(),
    r = effective(doc, scenario),
    config = doc.optimizer ?? defaultOptimizer;
  let examined = 0,
    nodes = 0,
    truncated = false;
  const choices: Option[] = [],
    reasons: string[] = [];
  if (!doc.slots.length)
    throw new Error("Add at least one program slot before planning.");
  const supported = (id: string) =>
    doc.brief.cohorts.every((co) => rankScore(doc, id, co.id) !== undefined);
  if (
    strategy === "cultural" &&
    doc.mode === "live" &&
    !doc.candidates.some((c) => supported(c.id))
  )
    throw new Error(
      "Resolve participants and collect Qloo evidence before planning in live mode.",
    );
  const rank = (id: string) =>
    strategy === "rules-only"
      ? 0
      : doc.brief.cohorts.reduce(
          (n, c) => n + (rankScore(doc, id, c.id) ?? 0) * c.weight,
          0,
        );
  const eligible = doc.slots.map((s) => {
    const old = doc.plan.find((a) => a.slotId === s.id);
    return doc.candidates
      .filter(
        (c) =>
          c.kind === s.kind &&
          c.available &&
          !c.excluded &&
          !r.unavailable.includes(c.id) &&
          c.from <= s.from &&
          c.to >= s.to &&
          (strategy === "rules-only" ||
            doc.mode === "demo" ||
            supported(c.id)) &&
          (!doc.locks?.includes(s.id) || c.id === old?.candidateId),
      )
      .sort(
        (a, b) =>
          Number(b.id === old?.candidateId) -
            Number(a.id === old?.candidateId) ||
          rank(b.id) - rank(a.id) ||
          a.id.localeCompare(b.id),
      );
  });
  doc.slots.forEach((s, i) => {
    if (!eligible[i].length)
      reasons.push(
        `${s.name}: no eligible participant, or a locked participant is unavailable.`,
      );
  });
  const feasible = new Set<string>();
  function walk(i: number, plan: Assignment[], cost: number) {
    if (++nodes > config.maxNodes) {
      truncated = true;
      return;
    }
    if (cost > r.budget) return;
    if (i === doc.slots.length) {
      examined++;
      const m = metrics(doc, plan);
      let offeringChange: Option["offeringChange"];
      if (scenario.type === "offering") {
        const c = doc.candidates.find((c) => c.id === scenario.candidateId),
          old = c?.offerings?.find((o) => o.id === scenario.offeringId);
        if (!plan.some((a) => a.candidateId === c?.id)) return;
        const excluded = excludedAllergens(doc, scenario);
        const alternatives = c?.offerings?.filter(
          (o) =>
            o.available &&
            o.id !== old?.id &&
            (!scenario.replacementOfferingId ||
              o.id === scenario.replacementOfferingId) &&
            !o.allergens.some((a) => excluded.has(a.trim().toLowerCase())),
        );
        if (!old || !alternatives?.length) return;
        offeringChange = {
          candidateId: c!.id,
          from: old.id,
          to: alternatives[0].id,
        };
      }
      const key = plan
        .map((a) => a.candidateId)
        .sort()
        .join("|");
      const o: Option = {
        id: "option-" + examined,
        assignments: plan,
        metrics: m,
        violations: [],
        objective: objective(doc, m),
        conditional: m.unknowns.length > 0,
        offeringChange,
      };
      const existing = choices.findIndex(
        (v) =>
          v.assignments
            .map((a) => a.candidateId)
            .sort()
            .join("|") === key,
      );
      if (existing >= 0) {
        if (o.objective > choices[existing].objective) choices[existing] = o;
      } else choices.push(o);
      choices.sort(
        (a, b) =>
          b.objective - a.objective ||
          a.metrics.cost - b.metrics.cost ||
          a.id.localeCompare(b.id),
      );
      if (choices.length > 8) choices.pop();
      feasible.add(key);
      return;
    }
    const s = doc.slots[i],
      old = doc.plan.find((a) => a.slotId === s.id);
    const zones = doc.zones
      .filter(
        (z) =>
          z.kind === s.kind &&
          !r.closedZones.includes(z.id) &&
          (!doc.locks?.includes(s.id) || z.id === old?.zoneId),
      )
      .sort(
        (a, b) =>
          Number(b.id === old?.zoneId) - Number(a.id === old?.zoneId) ||
          a.id.localeCompare(b.id),
      );
    for (const c of eligible[i]) {
      if (plan.some((a) => a.candidateId === c.id)) continue;
      for (const z of zones) {
        const next = [
          ...plan,
          { slotId: s.id, candidateId: c.id, zoneId: z.id },
        ];
        if (
          validate({ ...doc, slots: doc.slots.slice(0, i + 1) }, next, scenario)
            .length
        )
          continue;
        walk(i + 1, next, cost + (c.feeKnown === false ? 0 : c.fee));
        if (truncated) return;
      }
    }
  }
  walk(0, [], 0);
  if (!choices.length)
    reasons.push(
      "No complete plan found within the supplied constraints and search limit. Locked placements are never moved automatically.",
    );
  return {
    id: crypto.randomUUID(),
    baseRevision: doc.revision,
    scenario,
    options: choices.slice(0, 3),
    mode: doc.mode,
    evidenceIds: doc.evidence.map((e) => e.id),
    at: new Date().toISOString(),
    durationMs: Math.round(performance.now() - start),
    examined,
    status: "pending",
    optimizer: config,
    truncated,
    reasons,
    trace: [
      {
        tool: "get_event_plan",
        detail: `Read revision ${doc.revision} and ${doc.locks?.length ?? 0} locked commitments.`,
      },
      {
        tool: "inspect_evidence",
        detail:
          doc.mode === "demo"
            ? "Explicitly synthetic fixture, no Qloo response."
            : `${doc.evidence.length} query receipts. Unsupported participants excluded from cultural ranking.`,
      },
      {
        tool: "evaluate_cultural_continuity",
        detail:
          "rank-v2: fractional midranks within each fixed cohort/domain pool. Equal domain weighting. Continuity measures rank-vector displacement from the approved reference, not attendance.",
      },
      {
        tool: "generate_feasible_allocations",
        detail: `${nodes} nodes, ${examined} complete allocations, ${feasible.size} participant mixes. ${truncated ? "Bound reached; not an optimality or infeasibility proof." : "Bound not reached."}`,
      },
      {
        tool: "validate_hard_constraints",
        detail:
          "Budget, hours, exclusions, locked commitments, footprint, permitted category, simultaneous power and occupancy. Unknown terms produce conditional proposals.",
      },
      {
        tool: "prepare_approval_request",
        detail: choices.length
          ? "Review the alternatives. Live approval requires confirmed operational terms."
          : reasons.join(" "),
      },
    ],
  };
}
export function approve(doc: EventDoc, optionId: string): EventDoc {
  const p = doc.proposal;
  if (!p || p.status !== "pending") throw new Error("No pending proposal.");
  if (p.baseRevision !== doc.revision - 1)
    throw new Error("Proposal is stale. Run the planner again.");
  const o = p.options.find((o) => o.id === optionId);
  if (!o) throw new Error("Unknown option.");
  const errors = validate(doc, o.assignments, p.scenario);
  if (errors.length) throw new Error(errors.join(" "));
  if (doc.mode === "live" && metrics(doc, o.assignments).unknowns.length)
    throw new Error(
      "Confirm unknown fees, availability and terms before approving a live plan.",
    );
  const candidates = structuredClone(doc.candidates);
  const zones = structuredClone(doc.zones);
  const brief = structuredClone(doc.brief);
  // An approved incident becomes a current fact for every subsequent repair.
  // Otherwise a later cancellation could reopen a rain-closed zone or revive an act.
  const restrictions = effective(doc, p.scenario);
  for (const candidate of candidates) {
    if (restrictions.unavailable.includes(candidate.id))
      candidate.available = false;
  }
  for (const zone of zones) {
    if (restrictions.closedZones.includes(zone.id)) zone.blocked = true;
  }
  brief.budget = restrictions.budget;
  if (o.offeringChange) {
    const c = candidates.find((c) => c.id === o.offeringChange!.candidateId);
    const old = c?.offerings?.find((v) => v.id === o.offeringChange!.from);
    const replacement = c?.offerings?.find(
      (v) => v.id === o.offeringChange!.to,
    );
    if (
      !old ||
      !replacement?.available ||
      old.id === replacement.id ||
      !o.assignments.some((a) => a.candidateId === c!.id) ||
      replacement.allergens.some((a) =>
        excludedAllergens(doc, p.scenario).has(a.trim().toLowerCase()),
      )
    )
      throw new Error(
        "The offering substitution no longer satisfies the declared inventory and allergen restrictions.",
      );
    old.available = false;
  }
  return {
    ...doc,
    candidates,
    zones,
    brief,
    draftPlan: undefined,
    referencePlan: o.assignments,
    plan: o.assignments,
    // The incident is retained in the approved proposal/report. Current facts
    // above now represent it, so a future editor can deliberately revise them.
    scenario: { type: "none" },
    proposal: { ...p, status: "approved", selectedId: optionId },
  };
}
