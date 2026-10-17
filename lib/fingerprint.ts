import type { Assignment, EventDoc } from "./model.ts";
import { rankScore } from "./planner.ts";

export type CulturalFingerprint = {
  version: "fingerprint-v1";
  mode: "demo" | "live";
  covered: number;
  total: number;
  contexts: {
    cohort: string;
    domain: string;
    covered: number;
    total: number;
    index: number | null;
    referenceIndex: number | null;
    drift: number | null;
  }[];
  tags: { name: string; before: number; after: number; delta: number }[];
  proxies: { name: string; rationale: string; references: string[] }[];
};

export function fingerprint(
  doc: EventDoc,
  plan: Assignment[] = doc.plan,
): CulturalFingerprint {
  const reference = doc.referencePlan ?? doc.plan;
  const contexts: CulturalFingerprint["contexts"] = [];
  for (const cohort of doc.brief.cohorts) {
    for (const kind of ["artist", "vendor"] as const) {
      const values = (assignments: Assignment[]) =>
        assignments
          .filter(
            (a) =>
              doc.candidates.find((c) => c.id === a.candidateId)?.kind === kind,
          )
          .map((a) => rankScore(doc, a.candidateId, cohort.id));
      const current = values(plan),
        prior = values(reference);
      if (!current.length && !prior.length) continue;
      const mean = (v: (number | undefined)[]) =>
        v.length && v.every((n) => n !== undefined)
          ? v.reduce<number>((sum, n) => sum + n!, 0) / v.length
          : null;
      const index = mean(current),
        referenceIndex = mean(prior);
      contexts.push({
        cohort: cohort.name,
        domain: kind,
        covered: current.filter((v) => v !== undefined).length,
        total: current.length,
        index,
        referenceIndex,
        drift:
          index === null || referenceIndex === null
            ? null
            : index - referenceIndex,
      });
    }
  }
  const tags = (assignments: Assignment[]) => {
    const counts = new Map<string, number>();
    for (const a of assignments) {
      const c = doc.candidates.find((c) => c.id === a.candidateId);
      for (const tag of new Set(
        (c?.tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean),
      ))
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return counts;
  };
  const before = tags(reference),
    after = tags(plan);
  return {
    version: "fingerprint-v1",
    mode: doc.mode,
    covered: contexts.reduce((n, c) => n + c.covered, 0),
    total: contexts.reduce((n, c) => n + c.total, 0),
    contexts,
    tags: [...new Set([...before.keys(), ...after.keys()])]
      .sort()
      .map((name) => ({
        name,
        before: before.get(name) ?? 0,
        after: after.get(name) ?? 0,
        delta: (after.get(name) ?? 0) - (before.get(name) ?? 0),
      })),
    proxies: plan.flatMap((a) => {
      const c = doc.candidates.find((c) => c.id === a.candidateId);
      return c && !c.entityId && c.culturalProfile
        ? [
            {
              name: c.name,
              rationale: c.culturalProfile.rationale,
              references: c.culturalProfile.entities.map((e) => e.name),
            },
          ]
        : [];
    }),
  };
}
