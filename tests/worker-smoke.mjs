import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
const req = createRequire(import.meta.url),
  wranglerReq = createRequire(req.resolve("wrangler/package.json"));
const { Miniflare } = wranglerReq("miniflare");
const root = path.resolve("dist/server");
const entries = await readdir(root, { recursive: true });
const moduleNames = [
  "index.js",
  ...entries.filter((f) => /\.m?js$/.test(f) && f !== "index.js"),
];
const modules = await Promise.all(
  moduleNames.map(async (name) => ({
    type: "ESModule",
    path: path.join(root, name),
    contents: await readFile(path.join(root, name), "utf8"),
  })),
);
const mf = new Miniflare({
  modules,
  modulesRoot: root,
  compatibilityDate: "2026-05-15",
  compatibilityFlags: ["nodejs_compat"],
  d1Databases: ["DB"],
});
try {
  const db = await mf.getD1Database("DB");
  for (const f of (await readdir("drizzle"))
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    for (const s of (await readFile("drizzle/" + f, "utf8")).split(
      "--> statement-breakpoint",
    ))
      if (s.trim()) await db.prepare(s.trim()).run();
  }
  const base = "https://mend.test";
  const home = await mf.dispatchFetch(base);
  assert.equal(home.status, 200);
  const html = await home.text();
  assert(html.includes("Keep the feeling."));
  assert(html.includes("Repair the plan."));
  assert.equal(
    [...html.matchAll(/<footer[\s>]/g)].length,
    1,
    "One shared footer per page",
  );
  assert(html.includes('aria-label="MEND footer"'));
  assert(html.includes('aria-label="Welcome to MEND"'));
  // Follow the rendered workspace destination as a real document request.
  // SSR of the landing page alone cannot verify that its destination exists.
  const workspaceLink = html.match(/<a[^>]*href="([^"]+)"[^>]*>Open workspace/);
  assert(workspaceLink, "Landing must expose a workspace document link");
  assert.equal(workspaceLink[1], "/events");
  for (const [route, text] of [
    [workspaceLink[1], "Your production book."],
    ["/events/new", "Set up the event."],
    ["/settings", "Account &amp; connections."],
    ["/demo", "Midnight Culture Market"],
    ["/study", "Put the workflow on the clock."],
    ["/review", "One cancellation. A plan you can defend."],
    ["/verify", "Inspect a recovery report."],
  ]) {
    const page = await mf.dispatchFetch(base + route);
    assert.equal(page.status, 200, route + " must load as a document");
    assert((page.headers.get("content-type") ?? "").includes("text/html"));
    const pageHtml = await page.text();
    assert.equal(
      [...pageHtml.matchAll(/<footer[\s>]/g)].length,
      1,
      route + " has one shared footer",
    );
    assert(pageHtml.includes('aria-label="MEND footer"'));
    assert(pageHtml.includes(text), route + " renders its destination");
  }
  const unauth = await mf.dispatchFetch(base + "/api/mend");
  assert.equal(unauth.status, 401);
  await unauth.text();
  const headers = {
    "content-type": "application/json",
    "oai-authenticated-user-id": "smoke-user",
    origin: base,
  };
  const account = await mf.dispatchFetch(base + "/api/auth", { headers });
  assert.equal(account.status, 200);
  assert.deepEqual(await account.json(), { signedIn: true });
  assert.equal(account.headers.get("cache-control"), "private, no-store");
  const anonymousProbe = await mf.dispatchFetch(base + "/api/connections", {
    method: "POST",
    headers: { origin: base },
  });
  assert.equal(anonymousProbe.status, 401);
  await anonymousProbe.text();
  const probe = await mf.dispatchFetch(base + "/api/connections", {
    method: "POST",
    headers,
  });
  assert.equal(probe.status, 200);
  const probeResult = await probe.json();
  assert.equal(probeResult.qloo.state, "missing");
  assert.equal(probeResult.model.state, "missing");
  const wrongAuth = await mf.dispatchFetch(base + "/api/auth", {
    method: "POST",
    headers,
    body: JSON.stringify({ action: "signout" }),
  });
  assert.equal(wrongAuth.status, 409, "Sites keeps ChatGPT identity");
  await wrongAuth.text();
  async function post(data) {
    const r = await mf.dispatchFetch(base + "/api/mend", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return { status: r.status, ...(await r.json()) };
  }
  let result = await post({ action: "create" });
  assert.equal(result.status, 200);
  const id = result.event.id;
  assert.equal(result.event.revision, 0);
  const malicious = await mf.dispatchFetch(base + "/api/mend", {
    method: "POST",
    headers: { ...headers, origin: "https://evil.test" },
    body: JSON.stringify({ action: "create" }),
  });
  assert.equal(malicious.status, 403);
  await malicious.text();
  result = await post({
    action: "propose",
    id,
    revision: 0,
    scenario: { type: "cancellation", candidateId: "a1" },
  });
  assert.equal(result.status, 200);
  assert(result.event.proposal.options.length);
  assert.equal(result.event.plan[0].candidateId, "a1");
  const optionId = result.event.proposal.options[0].id;
  result = await post({ action: "approve", id, revision: 1, optionId });
  assert.equal(result.status, 200);
  assert(!result.event.plan.some((a) => a.candidateId === "a1"));
  const stale = await post({
    action: "propose",
    id,
    revision: 0,
    scenario: { type: "none" },
  });
  assert.equal(stale.status, 409);
  const history = await mf.dispatchFetch(
    base + "/api/mend?id=" + id + "&history=1",
    { headers },
  );
  assert.equal(history.status, 200);
  const restored = await history.json();
  assert.equal(restored.event.revision, 2);
  assert.equal(restored.event.candidates.find((c) => c.id === "a1").available, false,
    "Approved cancellation must survive database reload");
  assert.equal(restored.audit.length, 3);
  assert.equal(restored.revisions.length, 3);
  const denied = await mf.dispatchFetch(base + "/api/mend?id=" + id, {
    headers: { ...headers, "oai-authenticated-user-id": "other-user" },
  });
  assert.equal(denied.status, 404);
  await denied.text();
  const noKey = await post({ action: "search", query: "test", kind: "artist" });
  assert.equal(noKey.status, 400);
  assert(noKey.error.includes("key is not configured"));
  // Revision restoration uses server-owned history and still needs approval.
  result = await post({ action: "mode", id, revision: 2, mode: "demo" });
  assert.equal(result.status, 200);
  const blockedRestore = await post({
    action: "restoreRevision",
    id,
    revision: 3,
    targetRevision: 0,
  });
  assert.equal(blockedRestore.status, 400);
  result = await post({
    action: "restoreRevision",
    id,
    revision: 3,
    targetRevision: 2,
  });
  assert.equal(result.status, 200);
  assert.equal(result.event.proposal.originRevision, 2);
  assert.equal(result.event.proposal.status, "pending");
  result = await post({
    action: "approve",
    id,
    revision: 4,
    optionId: result.event.proposal.options[0].id,
  });
  assert.equal(result.status, 200);
  assert.equal(result.event.revision, 5);
  assert(result.event.reports.at(-1).fingerprint);
  console.log(
    "Worker smoke passed: landing/workspace/setup/settings/demo document navigation, auth, create → propose → approve → reload → history, stale write, cross-origin denial, tenant isolation and missing-key failure.",
  );
} finally {
  await mf.dispose();
}
