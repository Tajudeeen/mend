import { culturalRefs, culturalPoolKey } from "./culture.ts";
import { z } from "zod";
import { boundedRequest } from "./rate-limit.ts";
import type { Candidate, Evidence } from "./model";
const entitySchema = z
  .object({
    entity_id: z.string().min(1),
    name: z.string().optional(),
    subtype: z.string().optional(),
    properties: z
      .object({
        short_description: z.string().optional(),
        address: z.string().optional(),
      })
      .passthrough()
      .optional(),
    query: z
      .object({
        affinity: z.number().min(0).max(1).optional(),
        explainability: z.unknown().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();
const tagSchema = z
  .object({ tag_id: z.string(), name: z.string() })
  .passthrough();
export type QlooEnv = { QLOO_API_KEY?: string; QLOO_API_BASE?: string };
export async function digest(value: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
export async function qloo(
  env: QlooEnv,
  path: string,
  params: Record<string, string>,
) {
  if (!env.QLOO_API_KEY)
    throw new Error(
      "Qloo API key is not configured. Demo data remains available.",
    );
  const origin = env.QLOO_API_BASE ?? "https://api.qloo.com";
  if (
    ![
      "https://api.qloo.com",
      "https://staging.api.qloo.com",
      "https://hackathon.api.qloo.com",
    ].includes(origin)
  )
    throw new Error("Unsupported Qloo origin.");
  const url = new URL(path, origin);
  if (url.origin !== origin || !path.startsWith("/") || path.startsWith("//"))
    throw new Error("Unsupported Qloo path.");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const response = await boundedRequest(async () => {
    let response: Response | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(url, {
        redirect: "error",
        headers: { "x-api-key": env.QLOO_API_KEY!, Accept: "application/json" },
        signal: AbortSignal.timeout(12000),
      });
      if (
        response.ok ||
        ![429, 500, 502, 503, 504].includes(response.status) ||
        attempt === 2
      )
        break;
      await response.body?.cancel();
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          Math.min(1200, 250 * 2 ** attempt) + Math.floor(Math.random() * 100),
        ),
      );
    }
    return response!;
  });
  if (!response.ok)
    throw new Error(
      response.status === 429
        ? "Qloo rate limit reached. Try again later."
        : [401, 403].includes(response.status)
          ? "Qloo rejected the credentials. Check the API key and its assigned QLOO_API_BASE."
          : `Qloo returned HTTP ${response.status}. No sample results were substituted.`,
    );
  const raw = await response.text();
  if (raw.length > 100000)
    throw new Error(
      "Qloo response exceeded the evidence size limit. No batch was saved.",
    );
  const body = z
    .object({
      success: z.boolean().optional(),
      error: z.unknown().optional(),
      results: z
        .union([
          z.array(z.unknown()),
          z
            .object({
              entities: z.array(z.unknown()).optional(),
              tags: z.array(z.unknown()).optional(),
            })
            .passthrough(),
        ])
        .optional(),
      query: z
        .object({ explainability: z.unknown().optional() })
        .passthrough()
        .optional(),
    })
    .passthrough()
    .parse(JSON.parse(raw));
  if (body.success === false || body.error)
    throw new Error(
      "Qloo returned an unsuccessful response. No sample results were substituted.",
    );
  return body;
}
export async function search(
  env: QlooEnv,
  query: string,
  kind: "artist" | "vendor" | "brand",
) {
  const data = await qloo(env, "/search", {
    query,
    types:
      kind === "artist"
        ? "urn:entity:artist"
        : kind === "brand"
          ? "urn:entity:brand"
          : "urn:entity:place",
    take: "8",
  });
  const entities = Array.isArray(data.results)
    ? data.results
    : data.results?.entities;
  if (!Array.isArray(entities))
    throw new Error("Unexpected Qloo search response shape.");
  return entities
    .map((e) => entitySchema.parse(e))
    .filter(
      (e) => typeof e.entity_id === "string" && typeof e.name === "string",
    )
    .map((e) => ({
      id: e.entity_id,
      name: e.name,
      kind,
      description:
        e.properties?.short_description ?? e.properties?.address ?? "",
    }));
}
export async function collect(
  env: QlooEnv,
  cohortId: string,
  seeds: string[],
  candidates: Candidate[],
  kind: "artist" | "vendor",
): Promise<Evidence> {
  if (!seeds.length) throw new Error("Add resolved audience interests first.");
  const roster = candidates.filter((c) => c.kind === kind);
  if (!roster.length) throw new Error("Add participants to this domain first.");
  if (roster.some((c) => !culturalRefs(c).length))
    throw new Error(
      "Resolve every participant directly or supply a verified vendor proxy profile first.",
    );
  const ids = [...new Set(roster.flatMap(culturalRefs))].sort();
  if (ids.length > 50)
    throw new Error(
      "This fixed evidence pool exceeds 50 entities. Reduce the roster or proxy references before collecting one comparable batch.",
    );
  const params = {
    "filter.type": kind === "artist" ? "urn:entity:artist" : "urn:entity:place",
    "signal.interests.entities": seeds.join(","),
    "filter.results.entities": ids.join(","),
    "feature.explainability": "true",
    take: String(Math.max(20, ids.length)),
  };
  const body = await qloo(env, "/v2/insights", params);
  const list = Array.isArray(body.results)
    ? body.results
    : body.results?.entities;
  if (!Array.isArray(list))
    throw new Error("Unexpected Qloo insights response shape.");
  const entities: Record<string, number> = {};
  const parsedList = list.map((e) => entitySchema.parse(e));
  for (const e of parsedList) {
    const affinity = e.query?.affinity;
    if (
      ids.includes(e.entity_id) &&
      typeof affinity === "number" &&
      Number.isFinite(affinity) &&
      affinity >= 0 &&
      affinity <= 1
    )
      entities[e.entity_id] = affinity;
  }
  if (ids.some((id) => entities[id!] === undefined))
    throw new Error(
      "Qloo did not return a valid affinity for every requested participant. This batch was not saved.",
    );
  return {
    id: crypto.randomUUID(),
    provider: "qloo",
    at: new Date().toISOString(),
    endpoint: "/v2/insights",
    params,
    responseHash: await digest(body),
    rawResponse: body,
    entities,
    explainability: {
      aggregate: body.query?.explainability ?? null,
      entities: parsedList.map((e) => ({
        id: e.entity_id,
        explainability: e.query?.explainability ?? null,
      })),
    },
    cohortId,
    kind,
    poolKey: culturalPoolKey(candidates, kind),
    candidateProfiles: Object.fromEntries(
      roster.map((c) => [
        c.id,
        {
          source: c.entityId ? "direct" : "proxy",
          entityIds: culturalRefs(c),
          ...(c.entityId ? {} : { rationale: c.culturalProfile?.rationale }),
        },
      ]),
    ),
    normalization:
      "Fixed-context entity midranks, mean ordinal rank within a vendor proxy profile, then candidate-profile midranks. Proxy evidence describes selected references, not a direct Qloo identity for the vendor. No probability or attendance forecast.",
  };
}

export async function searchTags(env: QlooEnv, query: string) {
  const body = await qloo(env, "/v2/tags", {
    "filter.query": query,
    take: "12",
  });
  const tags = Array.isArray(body.results) ? body.results : body.results?.tags;
  if (!Array.isArray(tags)) throw new Error("Unexpected Qloo tags response.");
  return tags
    .map((t) => tagSchema.parse(t))
    .filter(
      (t) => typeof t.tag_id === "string" && t.tag_id.startsWith("urn:tag:"),
    )
    .map((t) => ({ id: t.tag_id, name: t.name }));
}
export async function discover(
  env: QlooEnv,
  seeds: string[],
  kind: "artist" | "vendor",
  city: string,
) {
  if (!seeds.length)
    throw new Error("Resolved interests are required for discovery.");
  const params: Record<string, string> = {
    "filter.type": kind === "artist" ? "urn:entity:artist" : "urn:entity:place",
    "signal.interests.entities": seeds.join(","),
    "feature.explainability": "true",
    take: "12",
  };
  if (kind === "vendor") params["filter.location.query"] = city;
  const raw = await qloo(env, "/v2/insights", params);
  const entities = Array.isArray(raw.results)
    ? raw.results
    : raw.results?.entities;
  if (!Array.isArray(entities))
    throw new Error("Unexpected discovery response.");
  return {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    params,
    responseHash: await digest(raw),
    rawResponse: raw,
    entities: entities
      .map((e) => entitySchema.parse(e))
      .map((e) => ({
        id: e.entity_id,
        name: e.name,
        kind,
        description: e.properties?.short_description ?? "",
        explainability: e.query?.explainability ?? null,
      })),
    disclosure:
      "Discovery is cultural relevance, not a fee quote, booking offer or local vending eligibility.",
  };
}
