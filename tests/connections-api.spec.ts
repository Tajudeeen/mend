import { test, expect, vi, beforeEach } from "vitest";
const mocks = vi.hoisted(() => ({
  owner: vi.fn(),
  check: vi.fn(),
  limit: vi.fn(),
}));
vi.mock("@/server/auth", () => ({ authenticatedOwner: mocks.owner }));
vi.mock("@/server/connections", () => ({ checkConnections: mocks.check }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.limit }));
import { POST } from "../app/api/connections/route";
const req = (origin = "https://mend.test") =>
  new Request("https://mend.test/api/connections", {
    method: "POST",
    headers: { origin },
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.limit.mockImplementation(() => {});
});
test("connection probes require matching origin and authenticated identity", async () => {
  expect((await POST(req("https://evil.test"))).status).toBe(403);
  mocks.owner.mockRejectedValue(new Error("Sign in"));
  expect((await POST(req())).status).toBe(401);
  expect(mocks.check).not.toHaveBeenCalled();
});
test("connection checks have per-owner limits before provider calls", async () => {
  mocks.owner.mockResolvedValue("owner");
  mocks.limit.mockImplementation(() => {
    throw new Error("limited");
  });
  expect((await POST(req())).status).toBe(429);
  expect(mocks.check).not.toHaveBeenCalled();
});
test("signed-in probes return uncached service results", async () => {
  mocks.owner.mockResolvedValue("owner");
  mocks.check.mockResolvedValue({
    qloo: { state: "missing" },
    model: { state: "missing" },
  });
  const response = await POST(req());
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(mocks.limit).toHaveBeenCalledWith("connections:owner", 3);
});
