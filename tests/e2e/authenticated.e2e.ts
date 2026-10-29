import { test, expect } from "@playwright/test";
import { sampleEvent } from "../../lib/seed";

test("staging: browser sign-in, blank event, unknown terms, reload, request replay and second-owner refusal", async ({
  browser,
  baseURL,
}) => {
  const users = [
    [process.env.MEND_E2E_EMAIL_A, process.env.MEND_E2E_PASSWORD_A],
    [process.env.MEND_E2E_EMAIL_B, process.env.MEND_E2E_PASSWORD_B],
  ];
  for (const user of users)
    if (!user[0] || !user[1])
      throw new Error("Two separately seeded staging accounts are required.");
  const contexts = await Promise.all(
    users.map(() => browser.newContext({ baseURL })),
  );
  try {
    for (let i = 0; i < 2; i++) {
      const page = await contexts[i].newPage();
      await page.goto("/settings");
      await page.getByLabel("Email", { exact: true }).fill(users[i][0]!);
      await page.getByLabel("Password", { exact: true }).fill(users[i][1]!);
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "Sign out", exact: true }),
      ).toBeVisible();
    }
    const a = contexts[0].request,
      b = contexts[1].request;
    const write = (data: unknown) =>
      a.post("/api/mend", { headers: { origin: baseURL! }, data });
    const key = crypto.randomUUID();
    const creation = {
      action: "create",
      brief: { ...sampleEvent().brief, name: "Staging probe " + key },
      requestKey: key,
    };
    const first = await write(creation);
    expect(first.status()).toBe(200);
    let event = (await first.json()).event;
    expect(event.mode).toBe("live");
    expect(event.candidates).toEqual([]);
    const replay = await write(creation);
    expect((await replay.json()).replayed).toBe(true);
    const added = await write({
      action: "addCandidate",
      id: event.id,
      revision: event.revision,
      requestKey: crypto.randomUUID(),
      fields: {
        name: "Staged vendor, no real quote",
        kind: "vendor",
        category: "food",
        fee: 0,
        feeKnown: false,
        power: 1,
        available: true,
        availabilityKnown: false,
        verified: false,
        from: 16,
        to: 22,
      },
    });
    expect(added.status()).toBe(200);
    event = (await added.json()).event;
    expect(event.candidates[0]).toMatchObject({
      feeKnown: false,
      availabilityKnown: false,
      verified: false,
    });
    expect((await b.get("/api/mend?id=" + event.id)).status()).toBe(404);
    expect(
      (
        await b.post("/api/mend", {
          headers: { origin: baseURL! },
          data: { action: "reject", id: event.id, revision: event.revision },
        })
      ).status(),
    ).toBe(404);
    const blocked = await write({
      action: "approve",
      id: event.id,
      revision: event.revision,
      optionId: "not-a-proposal",
    });
    expect(blocked.status()).toBe(400);
    expect((await blocked.json()).error).toMatch(/No pending proposal/);
    const stale = await write({ action: "reject", id: event.id, revision: 0 });
    expect(stale.status()).toBe(409);
    const read = await a.get("/api/mend?id=" + event.id + "&history=1");
    expect(read.status()).toBe(200);
    const saved = await read.json();
    expect(saved.event.revision).toBe(event.revision);
    expect(saved.event.reports).toEqual([]);
    const page = contexts[0].pages()[0];
    await page.goto("/events/" + event.id + "/studio");
    await expect(
      page.getByRole("heading", { name: event.brief.name, exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: event.brief.name, exact: true }),
    ).toBeVisible();
    // Records are intentionally retained on the disposable branch for inspection.
    // This does not exercise signup/email/OAuth, live Qloo or real production approval.
  } finally {
    await Promise.all(contexts.map((c) => c.close()));
  }
});
