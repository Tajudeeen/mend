import { test, expect, vi, beforeEach, afterEach } from "vitest";
const mocks = vi.hoisted(() => ({ transaction: vi.fn() }));
vi.mock("@prisma/adapter-pg", () => ({ PrismaPg: class {} }));
vi.mock("@/generated/prisma/client", () => ({
  PrismaClient: class {
    $transaction = mocks.transaction;
  },
}));
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv("DATABASE_URL", "postgresql://runtime@example.invalid/test");
});
afterEach(() => vi.unstubAllEnvs());
function adapter(
  broken: "none" | "read" | "write" | "insert" | "rollback" = "none",
) {
  let owner = "",
    firstOwner = "",
    row: { id: string; name: string } | null = null,
    rolledBack = false;
  const tx = {
    $queryRaw: vi.fn(async (parts: TemplateStringsArray, value?: string) => {
      const sql = parts.join("?");
      if (sql.includes("set_config")) {
        owner = value!;
        return [];
      }
      if (sql.includes("pg_roles"))
        return [{ rolsuper: false, rolbypassrls: false }];
      return Array.from({ length: 12 }, () => ({ relrowsecurity: true }));
    }),
    $executeRawUnsafe: vi.fn(async () => 0),
    event: {
      create: vi.fn(async ({ data }) => {
        if (row) {
          if (broken === "insert") return data;
          throw new Error("new row violates row-level security policy");
        }
        firstOwner = owner;
        row = { id: data.id, name: data.name };
        return row;
      }),
      findUnique: vi.fn(async () =>
        rolledBack && broken !== "rollback"
          ? null
          : owner === firstOwner || broken === "read"
            ? row
            : null,
      ),
      updateMany: vi.fn(async ({ data }) => {
        if (owner === firstOwner || broken === "write") {
          row!.name = data.name;
          return { count: 1 };
        }
        return { count: 0 };
      }),
      deleteMany: vi.fn(async () => ({ count: 0 })),
    },
    auditEvent: {
      create: vi.fn(async () => ({})),
      findMany: vi.fn(async () => []),
    },
  };
  mocks.transaction.mockImplementation(async (fn) => {
    try {
      return await fn(tx);
    } catch (error) {
      rolledBack = true;
      throw error;
    }
  });
  return tx;
}
test("probe passes only after owner writes, cross-owner denials and independent rollback read", async () => {
  const tx = adapter();
  const { verifyPostgresIsolation } = await import("../server/postgres");
  const result = await verifyPostgresIsolation();
  expect(result.status).toBe("passed");
  expect(result.checks).toHaveLength(11);
  expect(mocks.transaction).toHaveBeenCalledTimes(2);
  expect(tx.$executeRawUnsafe).toHaveBeenCalledWith(
    "ROLLBACK TO SAVEPOINT mend_probe_insert",
  );
});
for (const broken of ["read", "write", "insert", "rollback"] as const)
  test(`probe fails closed when ${broken} protection is broken`, async () => {
    adapter(broken);
    const { verifyPostgresIsolation } = await import("../server/postgres");
    await expect(verifyPostgresIsolation()).rejects.toThrow(
      /Storage isolation check failed/,
    );
  });
