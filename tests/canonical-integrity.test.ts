import { test } from "node:test";
import assert from "node:assert/strict";
import { digest, canonicalDigest, responseDigest } from "../lib/integrity.ts";
import { verifyReport } from "../lib/verify-report.ts";

test("versioned response integrity survives JSONB-style key reordering without ignoring value or array changes", async () => {
  const original = {
    z: 1,
    results: [
      {
        entity_id: "entity",
        query: { affinity: 0.7, explainability: { z: true, a: false } },
      },
    ],
    a: [1, 2],
  };
  const stored = {
    a: [1, 2],
    results: [
      {
        query: { explainability: { a: false, z: true }, affinity: 0.7 },
        entity_id: "entity",
      },
    ],
    z: 1,
  };
  assert.notEqual(await digest(original), await digest(stored));
  assert.equal(await canonicalDigest(original), await canonicalDigest(stored));
  assert.equal(
    await responseDigest(stored, "sha256-canonical-json-v2"),
    await canonicalDigest(original),
  );
  assert.notEqual(
    await canonicalDigest({ values: [1, 2] }),
    await canonicalDigest({ values: [2, 1] }),
  );
  assert.notEqual(
    await canonicalDigest(original),
    await canonicalDigest({ ...stored, z: 2 }),
  );
  assert.equal(await responseDigest(original), await digest(original));
});
test("report verification uses the recorded algorithm and retains legacy hash semantics", async () => {
  const original = { z: 1, a: { b: 2, a: 3 } };
  const stored = { a: { a: 3, b: 2 }, z: 1 };
  const report = {
    id: crypto.randomUUID(),
    summary: "Canonical fixture",
    status: "approved",
    mode: "live",
    evidenceIds: ["fixture"],
    evidenceSnapshot: [
      {
        id: "fixture",
        provider: "qloo",
        hashAlgorithm: "sha256-canonical-json-v2",
        responseHash: await canonicalDigest(original),
        rawResponse: stored,
      },
    ],
  };
  assert.equal(
    (await verifyReport(JSON.stringify(report))).status,
    "consistent",
  );
  report.evidenceSnapshot[0].rawResponse.z = 2;
  await assert.rejects(
    verifyReport(JSON.stringify(report)),
    /hash does not match/,
  );
  report.evidenceSnapshot[0].rawResponse.z = 1;
  report.evidenceSnapshot[0].hashAlgorithm = "sha256-json-v1";
  report.evidenceSnapshot[0].responseHash = await digest(original);
  await assert.rejects(
    verifyReport(JSON.stringify(report)),
    /hash does not match/,
  );
  report.evidenceSnapshot[0].hashAlgorithm = "unknown-hash";
  await assert.rejects(
    verifyReport(JSON.stringify(report)),
    /Invalid report structure/,
  );
});
