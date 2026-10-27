import { test, expect, vi, beforeEach } from "vitest";
import { smallJson, RequestBodyError } from "../server/http";

const mocks = vi.hoisted(() => ({
  owner: vi.fn(),
  load: vi.fn(),
  limit: vi.fn(),
}));
vi.mock("@/server/auth", () => ({ authenticatedOwner: mocks.owner }));
vi.mock("@/lib/repository", () => ({
  loadEvent: mocks.load,
  saveEvent: vi.fn(),
  auditFor: vi.fn(),
  createEvent: vi.fn(),
  listEvents: vi.fn(),
  operationResult: vi.fn(),
  revisionsFor: vi.fn(),
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: mocks.limit,
  boundedRequest: vi.fn(),
}));
import { POST as mend } from "../app/api/mend/route";
import { POST as culture } from "../app/api/culture/route";
import { POST as agent } from "../app/api/agent/route";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.owner.mockResolvedValue("owner");
});

function streamedRequest(route: string, bytes: number, withOrigin = true) {
  let reads = 0;
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        reads++;
        controller.enqueue(new Uint8Array(bytes).fill(32));
      },
      cancel() {
        cancelled = true;
      },
    },
    { highWaterMark: 0 },
  );
  const request = new Request("https://mend.test/api/" + route, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(withOrigin ? { origin: "https://mend.test" } : {}),
    },
    body: stream,
    duplex: "half",
  } as RequestInit);
  return {
    request,
    get reads() {
      return reads;
    },
    get cancelled() {
      return cancelled;
    },
  };
}

test.each([
  ["mend", mend, 40001],
  ["culture", culture, 8193],
  ["agent", agent, 5001],
] as const)(
  "%s refuses and cancels an oversized unfinished upload before event/provider access",
  async (route, handler, bytes) => {
    const input = streamedRequest(route, bytes);
    const response = await handler(input.request);
    expect(response.status).toBe(413);
    expect(input.cancelled).toBe(true);
    expect(input.reads).toBe(1);
    expect(mocks.load).not.toHaveBeenCalled();
  },
);

test("event writes require an origin even if the header is absent", async () => {
  const input = streamedRequest("mend", 8, false);
  expect((await mend(input.request)).status).toBe(403);
  expect(input.reads).toBe(0);
  expect(mocks.owner).not.toHaveBeenCalled();
  await input.request.body?.cancel();
});

test("shared parser measures UTF-8 bytes and still accepts normal JSON", async () => {
  const request = new Request("https://mend.test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ note: "ééé" }),
  });
  await expect(smallJson(request, 16)).rejects.toBeInstanceOf(RequestBodyError);
  const valid = new Request("https://mend.test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: '{"action":"create"}',
  });
  await expect(smallJson(valid)).resolves.toEqual({ action: "create" });
});
