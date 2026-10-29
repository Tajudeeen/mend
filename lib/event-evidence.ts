import type { EventDoc } from "./model.ts";
import { responseDigest } from "./integrity.ts";
import { culturalPoolKey } from "./culture.ts";
import { eventReadiness } from "./readiness.ts";

/** Local consistency checks, never provider authentication or impact proof. */
export async function inspectEventEvidence(doc: EventDoc) {
  const duplicateIds =
    doc.evidence.length !== new Set(doc.evidence.map((e) => e.id)).size;
  const receipts = await Promise.all(
    doc.evidence.map(async (receipt) => {
      const body = receipt.rawResponse as {
        results?: unknown[] | { entities?: unknown[] };
      } | null;
      const results = Array.isArray(body?.results)
        ? body.results
        : body?.results?.entities;
      const rawScores = new Map<string, number>();
      if (Array.isArray(results))
        for (const value of results) {
          const entity = value as {
            entity_id?: string;
            query?: { affinity?: number };
          } | null;
          if (entity?.entity_id && typeof entity.query?.affinity === "number")
            rawScores.set(entity.entity_id, entity.query.affinity);
        }
      const affinitiesMatch =
        Object.keys(receipt.entities).length > 0 &&
        Object.entries(receipt.entities).every(
          ([id, value]) =>
            Number.isFinite(value) &&
            value >= 0 &&
            value <= 1 &&
            rawScores.get(id) === value,
        );
      const cohort = doc.brief.cohorts.find((c) => c.id === receipt.cohortId);
      const interests = (receipt.params["signal.interests.entities"] ?? "")
        .split(",")
        .filter(Boolean)
        .sort();
      const currentContext =
        receipt.poolKey === culturalPoolKey(doc.candidates, receipt.kind) &&
        !!cohort?.seeds.length &&
        JSON.stringify(interests) ===
          JSON.stringify(cohort.seeds.map((s) => s.id).sort());
      let hashMatches = false;
      try {
        hashMatches =
          (await responseDigest(receipt.rawResponse, receipt.hashAlgorithm)) ===
          receipt.responseHash;
      } catch {
        /* Invalid body remains failed. */
      }
      return {
        id: receipt.id,
        at: receipt.at,
        origin: receipt.origin ?? null,
        endpoint: receipt.endpoint,
        hashAlgorithm: receipt.hashAlgorithm ?? "sha256-json-v1",
        hashMatches,
        affinitiesMatch,
        currentContext,
      };
    }),
  );
  return {
    checkedAt: new Date().toISOString(),
    eventId: doc.id,
    revision: doc.revision,
    mode: doc.mode,
    duplicateIds,
    receipts,
    consistent:
      receipts.length > 0 &&
      !duplicateIds &&
      receipts.every((r) => r.hashMatches && r.affinitiesMatch),
    coverageComplete:
      !duplicateIds &&
      receipts.length > 0 &&
      receipts.every(
        (r) => r.hashMatches && r.affinitiesMatch && r.currentContext,
      ) &&
      eventReadiness(doc).checks.find((c) => c.id === "evidence")?.done ===
        true,
    limitation:
      "Checks stored body hashes, derived affinity values and current event context. These checks do not authenticate Qloo as issuer, establish a new API call or prove organizer impact.",
  };
}
