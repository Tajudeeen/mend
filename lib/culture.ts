import type { Candidate } from "./model.ts";

export function culturalRefs(candidate: Candidate): string[] {
  if (candidate.entityId) return [candidate.entityId];
  if (candidate.kind !== "vendor") return [];
  return [
    ...new Set(candidate.culturalProfile?.entities.map((e) => e.id) ?? []),
  ];
}

export function culturalPoolKey(
  candidates: Candidate[],
  kind: Candidate["kind"],
) {
  return JSON.stringify(
    candidates
      .filter((c) => c.kind === kind)
      .map((c) => ({ id: c.id, refs: culturalRefs(c).sort() }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  );
}

export function midrank(value: number, pool: number[]) {
  if (pool.length < 2) return 0.5;
  const below = pool.filter((v) => v < value).length;
  const ties = pool.filter((v) => v === value).length;
  return (below + (ties - 1) / 2) / (pool.length - 1);
}
