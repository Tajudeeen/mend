import { defineConfig } from "@playwright/test";
const origin = process.env.MEND_E2E_ORIGIN;
if (!origin || process.env.MEND_E2E_DISPOSABLE !== "1")
  throw new Error(
    "Set an isolated MEND_E2E_ORIGIN and MEND_E2E_DISPOSABLE=1. No production fallback.",
  );
const url = new URL(origin);
if (
  (url.protocol !== "https:" &&
    url.hostname !== "localhost" &&
    url.hostname !== "127.0.0.1") ||
  ["usemend.vercel.app", "mend-deeencodes.vercel.app"].includes(url.hostname) ||
  url.username ||
  url.password ||
  url.pathname !== "/"
)
  throw new Error("Refusing an unsafe or known production E2E target.");
export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/*.e2e.ts",
  timeout: 90000,
  workers: 1,
  retries: 0,
  reporter: [["./scripts/evaluation/staging-reporter.ts"]],
  use: { baseURL: url.origin, trace: "off", screenshot: "off", video: "off" },
});
