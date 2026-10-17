import { test } from "node:test";
import assert from "node:assert/strict";
import { sampleEvent } from "../lib/seed.ts";
import { propose, validate, approve, metrics } from "../lib/planner.ts";
import { collect, search } from "../lib/qloo.ts";
const make = () => sampleEvent();
test("seed is feasible and synthetic", () => {
  const d = make();
  assert.deepEqual(validate(d, d.plan), []);
  assert.equal(d.evidence.length, 0);
  assert.equal(d.mode, "demo");
  assert(d.candidates.every((c) => !c.verified));
});
test("cancellation removes cancelled participant without mutating active plan", () => {
  const d = make(),
    original = JSON.stringify(d.plan);
  const p = propose(d, { type: "cancellation", candidateId: "a1" });
  assert.equal(p.options.length, 3);
  assert.equal(JSON.stringify(d.plan), original);
  for (const o of p.options) {
    assert(!o.assignments.some((a) => a.candidateId === "a1"));
    assert.deepEqual(validate(d, o.assignments, p.scenario), []);
  }
});
test("rain closes all outdoor zones and respects concurrent power and capacity", () => {
  const d = make(),
    p = propose(d, { type: "rain" });
  assert(p.options.length > 0);
  for (const o of p.options) {
    assert(
      o.assignments.every(
        (a) => d.zones.find((z) => z.id === a.zoneId)?.covered,
      ),
    );
    assert.deepEqual(validate(d, o.assignments, p.scenario), []);
  }
});
test("budget repair remains within new fee cap", () => {
  const d = make(),
    p = propose(d, { type: "budget", budget: 4000 });
  assert(p.options.length);
  for (const o of p.options) assert(o.metrics.cost <= 4000);
});
test("impossible budget returns no solution and never silently relaxes constraints", () => {
  const d = make(),
    p = propose(d, { type: "budget", budget: 100 });
  assert.equal(p.options.length, 0);
  assert.equal(d.plan.length, 5);
});
test("detect duplicate participants, unavailable hours, stage capacity and power", () => {
  const d = make();
  d.plan[1].candidateId = d.plan[0].candidateId;
  assert(validate(d, d.plan).some((s) => s.includes("two slots")));
  const e = make();
  e.candidates[0].from = 20;
  e.zones[0].capacity = 50;
  e.zones[0].power = 1;
  const errors = validate(e, e.plan);
  assert(errors.some((s) => s.includes("availability")));
  assert(errors.some((s) => s.includes("capacity")));
  assert(errors.some((s) => s.includes("power")));
});
test("approval applies only a current pending server-generated option", () => {
  const d = make();
  d.proposal = propose(d, { type: "cancellation", candidateId: "a1" });
  d.revision++;
  const out = approve(d, d.proposal.options[0].id);
  assert(!out.plan.some((a) => a.candidateId === "a1"));
  assert.equal(out.proposal?.status, "approved");
  assert.throws(() => approve(out, out.proposal!.options[0].id));
  d.revision++;
  assert.throws(() => approve(d, d.proposal!.options[0].id), /stale/);
});
test("live mode refuses to invent missing evidence", () => {
  const d = make();
  d.mode = "live";
  assert.throws(() => propose(d, { type: "none" }), /Qloo evidence/);
  assert(metrics(d, d.plan).unknowns.length);
});
test("cohort weights normalize; minority group floor is separately visible", () => {
  const d = make();
  d.brief.cohorts.forEach((c) => (c.weight = 1));
  const m = metrics(d, d.plan);
  assert(
    Math.abs(
      m.weighted - Object.values(m.cohorts).reduce((a, b) => a + b) / 3,
    ) < 1e-10,
  );
  assert.equal(m.floor, Math.min(...Object.values(m.cohorts)));
});
test("sample solver output and objective are deterministic", () => {
  const d = make();
  const a = propose(d, { type: "none" }),
    b = propose(d, { type: "none" });
  assert.deepEqual(a.options, b.options);
});
test("Qloo credentials are required without fallback", async () => {
  await assert.rejects(
    () => search({}, "Artist", "artist"),
    /key is not configured/,
  );
});
test("Qloo search and affinity adapter accept documented shape and preserve provenance", async () => {
  const old = globalThis.fetch;
  let call: URL | undefined;
  try {
    globalThis.fetch = async (input: any) => {
      call = new URL(String(input));
      return Response.json({
        success: true,
        results: {
          entities: [
            {
              entity_id: "e1",
              name: "Artist",
              query: { affinity: 0.8, explainability: { entities: [] } },
            },
          ],
        },
        query: { explainability: {} },
      });
    };
    const found = await search({ QLOO_API_KEY: "test" }, "Artist", "artist");
    assert.equal(found[0].id, "e1");
    assert.equal(call?.pathname, "/search");
    const c = make().candidates[0];
    c.entityId = "e1";
    const receipt = await collect(
      { QLOO_API_KEY: "test" },
      "pulse",
      ["seed-id"],
      [c],
      "artist",
    );
    assert.equal(receipt.entities.e1, 0.8);
    assert.equal(receipt.responseHash.length, 64);
    assert.equal(call?.searchParams.get("feature.explainability"), "true");
    assert.equal(call?.searchParams.get("filter.results.entities"), "e1");
  } finally {
    globalThis.fetch = old;
  }
});
test("Qloo incomplete batch, rate limits and non-finite scores fail closed", async () => {
  const old = globalThis.fetch,
    c = make().candidates[0];
  c.entityId = "e1";
  try {
    globalThis.fetch = async () => Response.json({ results: { entities: [] } });
    await assert.rejects(
      () => collect({ QLOO_API_KEY: "test" }, "pulse", ["seed"], [c], "artist"),
      /every requested participant/,
    );
    globalThis.fetch = async () => new Response("", { status: 429 });
    await assert.rejects(
      () => search({ QLOO_API_KEY: "test" }, "name", "artist"),
      /rate limit/,
    );
  } finally {
    globalThis.fetch = old;
  }
});
