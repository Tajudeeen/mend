import { test, expect, vi, beforeEach } from "vitest";
const mocks = vi.hoisted(() => ({
  owner: vi.fn(),
  verify: vi.fn(),
  limit: vi.fn(),
  env: vi.fn(() => ({})),
}));
vi.mock("@/server/auth", () => ({ authenticatedOwner: mocks.owner }));
vi.mock("@/server/postgres", () => ({ verifyPostgresIsolation: mocks.verify }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.limit }));
vi.mock("@/lib/runtime", () => ({ runtimeEnv: mocks.env }));
import { POST } from "../app/api/storage-check/route";
const request = (origin = "https://mend.test") =>
  new Request("https://mend.test/api/storage-check", {
    method: "POST",
    headers: { origin },
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.owner.mockResolvedValue("owner");
  mocks.env.mockReturnValue({});
});
test("storage check requires same origin, authenticated ownership and the PostgreSQL target", async () => {
  expect((await POST(request("https://evil.test"))).status).toBe(403);
  mocks.owner.mockRejectedValueOnce(new Error("Sign in"));
  expect((await POST(request())).status).toBe(401);
  mocks.env.mockReturnValue({ MEND_SITE_COMPAT: true });
  expect((await POST(request())).status).toBe(409);
  expect(mocks.verify).not.toHaveBeenCalled();
});
test("storage probe is rate limited and returns private results without database errors", async () => {
  mocks.verify.mockResolvedValue({
    status: "passed",
    checks: ["rollback confirmed"],
  });
  const response = await POST(request());
  expect(await response.json()).toEqual({
    status: "passed",
    checks: ["rollback confirmed"],
  });
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(mocks.limit).toHaveBeenCalledWith("storage-probe:owner", 1);
  expect(mocks.limit).toHaveBeenCalledWith("storage-probe:global", 3);
  mocks.verify.mockRejectedValue(new Error("DATABASE_URL private secret"));
  const failed = await POST(request());
  expect(failed.status).toBe(503);
  expect(JSON.stringify(await failed.json())).not.toMatch(
    /DATABASE_URL|private secret/,
  );
  mocks.limit.mockImplementationOnce(() => {
    throw new Error("limit");
  });
  expect((await POST(request())).status).toBe(429);
});
