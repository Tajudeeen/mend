import { test, expect, vi, beforeEach, afterEach } from "vitest";
const mocks = vi.hoisted(() => ({
  role: vi.fn(),
  events: vi.fn(),
  transactions: vi.fn(),
}));
vi.mock("@prisma/adapter-pg", () => ({ PrismaPg: class {} }));
vi.mock("@/generated/prisma/client", () => ({
  PrismaClient: class {
    $transaction = mocks.transactions;
  },
}));
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv(
    "DATABASE_URL",
    "postgresql://private-credential@example.invalid/db",
  );
  mocks.role.mockResolvedValue([{ rolsuper: false, rolbypassrls: false }]);
  mocks.events.mockResolvedValue([]);
  mocks.transactions.mockImplementation(async (fn) =>
    fn({
      $queryRaw: mocks.role,
      event: { findMany: mocks.events },
    }),
  );
});
afterEach(() => vi.unstubAllEnvs());
test("readiness exercises the limited role and Prisma table path, sharing concurrent probes", async () => {
  const { postgresReady } = await import("../server/postgres");
  const results = await Promise.all([postgresReady(), postgresReady()]);
  expect(results).toEqual([true, true]);
  expect(mocks.transactions).toHaveBeenCalledTimes(1);
  expect(mocks.role).toHaveBeenCalledTimes(2);
  expect(mocks.events).toHaveBeenCalledWith(
    expect.objectContaining({ select: { id: true }, take: 1 }),
  );
});
test("readiness rejects elevated roles before reading event data", async () => {
  mocks.role.mockResolvedValue([{ rolsuper: false, rolbypassrls: true }]);
  const { postgresReady } = await import("../server/postgres");
  expect(await postgresReady()).toBe(false);
  expect(mocks.events).not.toHaveBeenCalled();
});
test("a failed database probe reports 503 without exposing credentials or database errors", async () => {
  mocks.events.mockRejectedValue(
    new Error("private-credential database failure"),
  );
  const { GET } = await import("../app/api/health/route");
  const response = await GET(
    new Request("https://mend.test/api/health?probe=database"),
  );
  expect(response.status).toBe(503);
  const body = (await response.json()) as {
    databaseReady: boolean;
    status: string;
  };
  expect(body.databaseReady).toBe(false);
  expect(body.status).toBe("degraded");
  expect(JSON.stringify(body)).not.toMatch(
    /private-credential|example.invalid|database failure/,
  );
});
test("ordinary liveness makes no database query and missing configuration cannot pass readiness", async () => {
  const { GET } = await import("../app/api/health/route");
  expect((await GET()).status).toBe(200);
  expect(mocks.transactions).not.toHaveBeenCalled();
  vi.stubEnv("DATABASE_URL", "");
  const response = await GET(
    new Request("https://mend.test/api/health?probe=database"),
  );
  expect(response.status).toBe(503);
  expect(mocks.transactions).not.toHaveBeenCalled();
});
