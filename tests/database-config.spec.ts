import { test, expect } from "vitest";
import { databaseConfig } from "../server/database-config";
test("provider CA survives URL SSL parameters without disabling certificate verification", () => {
  const config = databaseConfig(
    "postgresql://runtime:private@db.test/postgres?sslmode=verify-full&application_name=mend",
    "provider-root-ca",
  );
  expect(config.ssl).toEqual({
    rejectUnauthorized: true,
    ca: "provider-root-ca",
  });
  expect(new URL(config.connectionString!).searchParams.has("sslmode")).toBe(
    false,
  );
  expect(
    new URL(config.connectionString!).searchParams.get("application_name"),
  ).toBe("mend");
});
test("URL flags cannot disable TLS verification and non-Postgres URLs are refused", () => {
  expect(
    databaseConfig("postgres://db.test/postgres?sslmode=disable").ssl,
  ).toEqual({ rejectUnauthorized: true });
  expect(() => databaseConfig("https://db.test/postgres")).toThrow(
    "Unsupported database",
  );
});
