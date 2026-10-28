import type { PoolConfig } from "pg";

export function databaseConfig(
  connectionString: string,
  ca?: string,
): PoolConfig {
  const url = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(url.protocol))
    throw new Error("Unsupported database connection protocol.");
  // node-postgres lets URL SSL parameters replace the explicit TLS object.
  // Keep certificate and hostname validation under this configuration's control.
  for (const key of ["sslmode", "sslrootcert", "sslcert", "sslkey"])
    url.searchParams.delete(key);
  return {
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: true, ...(ca ? { ca } : {}) },
    max: 3,
    connectionTimeoutMillis: 5000,
  };
}
