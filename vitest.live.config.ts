import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    include: ["scripts/evaluation/live-provider.eval.ts"],
    environment: "node",
    testTimeout: 1800000,
    fileParallelism: false,
  },
});
