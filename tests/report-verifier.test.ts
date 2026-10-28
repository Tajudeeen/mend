import { test } from "node:test";
import assert from "node:assert/strict";
import { verifyReport } from "../lib/verify-report.ts";
import { digest } from "../lib/integrity.ts";

const base = () => ({
  id: crypto.randomUUID(),
  summary: "Fixture approval record",
  status: "approved",
  mode: "demo",
  evidenceIds: [] as string[],
});
async function fixture() {
  const rawResponse = { fixture: true, results: { entities: [] } };
  const receipt = {
    id: "fixture",
    provider: "qloo",
    rawResponse,
    responseHash: await digest(rawResponse),
  };
  return { ...base(), evidenceIds: [receipt.id], evidenceSnapshot: [receipt] };
}
test("browser and CLI verifier distinguishes no evidence from matching stored responses", async () => {
  assert.equal(
    (await verifyReport(JSON.stringify(base()))).status,
    "no-evidence",
  );
  const checked = await verifyReport(JSON.stringify(await fixture()));
  assert.equal(checked.status, "consistent");
  assert.equal(checked.checkedReceipts, 1);
  assert.match(checked.limitation, /does not authenticate/);
});
test("modified stored responses, missing receipts and duplicate references fail explicitly", async () => {
  const data = await fixture();
  data.evidenceSnapshot[0].rawResponse.fixture = false;
  await assert.rejects(
    () => verifyReport(JSON.stringify(data)),
    /hash does not match/,
  );
  await assert.rejects(
    () => verifyReport(JSON.stringify({ ...base(), evidenceIds: ["missing"] })),
    /receipts are missing/,
  );
  const duplicate = await fixture();
  await assert.rejects(
    () =>
      verifyReport(
        JSON.stringify({
          ...duplicate,
          evidenceIds: ["fixture", "fixture"],
        }),
      ),
    /Duplicate/,
  );
});
test("arbitrary JSON, absent raw bodies and unreferenced receipts cannot pass", async () => {
  await assert.rejects(
    () => verifyReport('{"evidenceIds":[]}'),
    /Invalid report structure/,
  );
  const data = await fixture();
  await assert.rejects(
    () => verifyReport(JSON.stringify({ ...data, evidenceIds: [] })),
    /Unreferenced/,
  );
  delete (data.evidenceSnapshot[0] as { rawResponse?: unknown }).rawResponse;
  await assert.rejects(
    () => verifyReport(JSON.stringify(data)),
    /Invalid report structure/,
  );
});
