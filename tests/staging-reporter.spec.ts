import { test, expect } from "vitest";
import { safeTestResult } from "../scripts/evaluation/staging-reporter";
test("staging outcome artifacts exclude credential-bearing error messages and stacks", () => {
  const result = safeTestResult(
    { title: "Static staging probe" },
    {
      status: "failed",
      duration: 1,
      errors: [
        {
          message: "synthetic password must not persist",
          stack: "credential-bearing call log",
        },
      ],
    },
  );
  expect(result).toEqual({
    title: "Static staging probe",
    status: "failed",
    durationMs: 1,
    errorCount: 1,
  });
  expect(JSON.stringify(result)).not.toMatch(/password|credential-bearing/);
});
