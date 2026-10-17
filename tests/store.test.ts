import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile, readdir } from "node:fs/promises";
import { sampleEvent } from "../lib/seed.ts";
import {
  createEvent,
  loadEvent,
  saveEvent,
  auditFor,
  revisionsFor,
  listEvents,
  operationResult,
} from "../lib/store.ts";
import { propose, approve } from "../lib/planner.ts";
const require = createRequire(import.meta.url),
  wranglerRequire = createRequire(require.resolve("wrangler/package.json"));
const { Miniflare } = wranglerRequire("miniflare");
test("D1 workflow persists repairs, approvals and revision history with tenant isolation and CAS", async () => {
  const mf = new Miniflare({
    modules: true,
    script: 'export default {fetch(){return new Response("ok")}}',
    d1Databases: ["DB"],
    compatibilityDate: "2026-05-15",
  });
  try {
    const db = await mf.getD1Database("DB");
    const files = (await readdir("drizzle"))
      .filter((f) => f.endsWith(".sql"))
      .sort();
    for (const f of files) {
      const sql = await readFile("drizzle/" + f, "utf8");
      for (const statement of sql.split("--> statement-breakpoint")) {
        if (statement.trim()) await db.prepare(statement.trim()).run();
      }
    }
    const creationKey=crypto.randomUUID();
    const d = await createEvent(db, "owner", sampleEvent(),creationKey);
    assert.equal((await operationResult(db,"owner",creationKey))?.id,d.id);
    assert.equal(await operationResult(db,"other",creationKey),null);
    await assert.rejects(()=>createEvent(db,"owner",sampleEvent(),creationKey));
    assert.equal((await listEvents(db, "owner")).length, 1);
    assert.deepEqual(await listEvents(db, "other"), []);
    await assert.rejects(() => loadEvent(db, "other", d.id), /not found/);
    const proposed = {
      ...d,
      proposal: propose(d, { type: "cancellation", candidateId: "a1" }),
    };
    const stored = await saveEvent(
      db,
      "owner",
      d,
      proposed,
      "propose",
      "Generated repair",
    );
    assert.equal(stored.revision, 1);
    assert.equal(
      (await loadEvent(db, "owner", d.id)).plan[0].candidateId,
      "a1",
    );
    const approved = approve(stored, stored.proposal!.options[0].id);
    await saveEvent(
      db,
      "owner",
      stored,
      approved,
      "approve",
      "Organizer approved",
    );
    const final = await loadEvent(db, "owner", d.id);
    assert.equal(final.revision, 2);
    assert(!final.plan.some((a) => a.candidateId === "a1"));
    const history = await revisionsFor(db, "owner", d.id);
    assert.equal(history.length, 3);
    assert.equal(history[1].proposal?.status, "pending");
    assert.equal(history[2].plan[0].candidateId, "a1");
    assert.equal((await auditFor(db, "owner", d.id)).length, 3);
    await assert.rejects(
      () => saveEvent(db, "owner", d, { ...d }, "brief", "stale write"),
      /another session/,
    );
    assert.equal((await auditFor(db, "owner", d.id)).length, 3);
    assert.equal((await revisionsFor(db, "owner", d.id)).length, 3);
    await assert.rejects(
      () =>
        saveEvent(db, "other", final, { ...final }, "brief", "unauthorized"),
      /another session/,
    );
    assert.equal((await loadEvent(db, "owner", d.id)).revision, 2);
  } finally {
    await mf.dispose();
  }
});
