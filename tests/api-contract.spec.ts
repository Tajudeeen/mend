import { test, expect, vi, beforeEach } from "vitest";
const mocks = vi.hoisted(() => ({
  owner: vi.fn(),
  load: vi.fn(),
  list: vi.fn(),
  operation: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  audit: vi.fn(),
}));
vi.mock("@/server/auth", () => ({ authenticatedOwner: mocks.owner }));
vi.mock("@/lib/repository", () => ({
  loadEvent: mocks.load,
  listEvents: mocks.list,
  operationResult: mocks.operation,
  createEvent: mocks.create,
  saveEvent: mocks.save,
  auditFor: mocks.audit,
  revisionsFor: vi.fn(),
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(),
  boundedRequest: vi.fn(),
}));
import { GET, POST } from "../app/api/mend/route";
import { sampleEvent } from "../lib/seed";
const url = "https://mend.test/api/mend";
const request = (body: unknown, origin = "https://mend.test") =>
  new Request(url, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.resetAllMocks();
  mocks.owner.mockResolvedValue("owner-a");
  mocks.audit.mockResolvedValue([]);
  mocks.operation.mockResolvedValue(null);
});
async function error(response: Response, status: number) {
  expect(response.status).toBe(status);
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  const body = (await response.json()) as Record<string, unknown>;
  expect(Object.keys(body)).toEqual(["error"]);
  expect(typeof body.error).toBe("string");
}
test("documented event route status/error envelope is executable", async () => {
  await error(
    await POST(request({ action: "create" }, "https://other.test")),
    403,
  );
  mocks.owner.mockRejectedValueOnce(
    new Error("Sign in to save and manage events."),
  );
  await error(await GET(new Request(url)), 401);
  mocks.load.mockRejectedValueOnce(new Error("Event not found."));
  await error(await GET(new Request(url + "?id=" + crypto.randomUUID())), 404);
  mocks.load.mockResolvedValue(sampleEvent());
  await error(
    await POST(
      request({ action: "reject", id: crypto.randomUUID(), revision: 99 }),
    ),
    409,
  );
  await error(
    await POST(request({ action: "unknown", id: "bad-id", revision: 0 })),
    400,
  );
  await error(
    await POST(request({ action: "create", padding: "x".repeat(41000) })),
    413,
  );
});
test("same request key replays owner-scoped original result without a second mutation", async () => {
  const doc = sampleEvent();
  mocks.operation.mockResolvedValue(doc);
  const r = await POST(
    request({
      action: "approve",
      id: doc.id,
      revision: 0,
      requestKey: crypto.randomUUID(),
      optionId: "already-approved",
    }),
  );
  expect(r.status).toBe(200);
  expect(await r.json()).toMatchObject({
    replayed: true,
    event: { id: doc.id },
  });
  expect(mocks.operation.mock.calls[0][0]).toBe("owner-a");
  expect(mocks.load).not.toHaveBeenCalled();
  expect(mocks.save).not.toHaveBeenCalled();
});
test("fresh mutation response has event and audit, success is uncached", async () => {
  const doc = sampleEvent();
  mocks.create.mockResolvedValue(doc);
  const r = await POST(
    request({ action: "create", requestKey: crypto.randomUUID() }),
  );
  expect(r.status).toBe(200);
  expect(r.headers.get("cache-control")).toBe("private, no-store");
  expect(await r.json()).toMatchObject({
    event: { id: doc.id, revision: 0 },
    audit: [],
  });
});
