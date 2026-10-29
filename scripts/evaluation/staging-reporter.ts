import type {
  Reporter,
  FullResult,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import { mkdirSync, writeFileSync } from "node:fs";
export function safeTestResult(
  test: Pick<TestCase, "title">,
  result: Pick<TestResult, "status" | "duration" | "errors">,
) {
  // Never retain action logs, error messages, stacks, cookies or credentials.
  return {
    title: test.title,
    status: result.status,
    durationMs: result.duration,
    errorCount: result.errors.length,
  };
}
export default class StagingReporter implements Reporter {
  private cases: ReturnType<typeof safeTestResult>[] = [];
  onTestEnd(test: TestCase, result: TestResult) {
    this.cases.push(safeTestResult(test, result));
  }
  onEnd(result: FullResult) {
    mkdirSync("outputs", { recursive: true });
    writeFileSync(
      "outputs/staging-e2e.json",
      JSON.stringify(
        {
          schema: "mend-staging-e2e-v1",
          observedAt: new Date().toISOString(),
          status: result.status,
          scope:
            "Two seeded staging identities, browser sign-in and persisted API/UI checks. No signup/email/OAuth/live approval established.",
          cases: this.cases,
        },
        null,
        2,
      ) + "\n",
    );
    console.log(
      `Staging probe: ${result.status}. Sanitized outcomes: outputs/staging-e2e.json`,
    );
  }
}
