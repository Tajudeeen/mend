import { test, expect } from "vitest";
import { z } from "zod";
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { investigate } from "../../server/agent";
import { validate, propose } from "../../lib/planner";
import { goldenCases } from "./golden-cases";
import { modelFailure } from "../../server/model-errors";

test("opt-in real model / synthetic event evaluation", async () => {
  if (process.env.MEND_RUN_LIVE_EVAL !== "1")
    throw new Error(
      "Explicit MEND_RUN_LIVE_EVAL=1 required; no fixture fallback.",
    );
  const env = {
    LLM_API_KEY: process.env.LLM_API_KEY,
    LLM_BASE_URL: process.env.LLM_BASE_URL,
    LLM_MODEL: process.env.LLM_MODEL,
  };
  if (!env.LLM_API_KEY || !env.LLM_BASE_URL || !env.LLM_MODEL)
    throw new Error("Live provider configuration missing.");
  const count = Number(process.env.MEND_EVAL_CASES ?? 5);
  const floor = Number(process.env.MEND_EVAL_FLOOR ?? 0.9);
  const inputPrice = process.env.MEND_EVAL_INPUT_USD_PER_MILLION?.trim()
    ? Number(process.env.MEND_EVAL_INPUT_USD_PER_MILLION)
    : NaN;
  const outputPrice = process.env.MEND_EVAL_OUTPUT_USD_PER_MILLION?.trim()
    ? Number(process.env.MEND_EVAL_OUTPUT_USD_PER_MILLION)
    : NaN;
  if (
    !Number.isInteger(count) ||
    count < 1 ||
    count > 50 ||
    !Number.isFinite(floor) ||
    floor < 0 ||
    floor > 1
  )
    throw new Error("Invalid case count or score floor.");
  const originalFetch = globalThis.fetch;
  const records: Record<string, unknown>[] = [];
  let totalRequests = 0,
    inputTokens = 0,
    outputTokens = 0,
    usageResponses = 0;
  let activeCalls = 0;
  const started = Date.now();
  const configuredOrigin = new URL(env.LLM_BASE_URL).origin;
  const report = () => {
    const successes = records.filter((r) => r.passed).length;
    const latencies = records
      .map((r) => Number(r.latencyMs))
      .sort((a, b) => a - b);
    mkdirSync("outputs", { recursive: true });
    writeFileSync(
      "outputs/live-eval.json",
      JSON.stringify(
        {
          schema: "mend-live-eval-v1",
          observedAt: new Date().toISOString(),
          sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
            encoding: "utf8",
          }).trim(),
          model: env.LLM_MODEL,
          scope:
            "Real model requests against synthetic event fixtures. No real Qloo call, booking, persisted approval or organizer impact established.",
          requested: count,
          completed: records.length,
          passRate: records.length ? successes / records.length : 0,
          floor,
          latencyMs: {
            p50: latencies[Math.floor(latencies.length * 0.5)] ?? null,
            p95:
              latencies[
                Math.min(
                  latencies.length - 1,
                  Math.floor(latencies.length * 0.95),
                )
              ] ?? null,
          },
          providerRequests: totalRequests,
          inputTokens,
          outputTokens,
          usageResponses,
          estimatedCostUSD:
            Number.isFinite(inputPrice) &&
            inputPrice >= 0 &&
            Number.isFinite(outputPrice) &&
            outputPrice >= 0 &&
            usageResponses
              ? (inputTokens * inputPrice + outputTokens * outputPrice) / 1e6
              : null,
          costNote:
            "Estimate uses supplied rates and observed usage, not a billing receipt. Missing response usage can make it incomplete.",
          cases: records,
        },
        null,
        2,
      ) + "\n",
    );
  };
  try {
    globalThis.fetch = async (input, init) => {
      const url = new URL(input instanceof Request ? input.url : String(input));
      if (url.origin !== configuredOrigin)
        throw new Error("Evaluation refused an unexpected provider origin.");
      if (++totalRequests > 400 || Date.now() - started > 1200000)
        throw new Error("Evaluation request/time budget exhausted.");
      activeCalls++;
      const response = await originalFetch(input, init);
      try {
        const parsed = z
          .object({
            usage: z.object({
              prompt_tokens: z.number().int().nonnegative(),
              completion_tokens: z.number().int().nonnegative(),
            }),
          })
          .safeParse(await response.clone().json());
        if (parsed.success) {
          inputTokens += parsed.data.usage.prompt_tokens;
          outputTokens += parsed.data.usage.completion_tokens;
          usageResponses++;
        }
      } catch {
        /* Missing/malformed usage is not silently counted as zero cost. */
      }
      return response;
    };
    // Interleave five wording variants across ten distinct situations.
    const selected = [...goldenCases]
      .sort((a, b) => a.id.split("-")[1].localeCompare(b.id.split("-")[1]))
      .slice(0, count);
    for (const c of selected) {
      const doc = c.event();
      const before = structuredClone(doc.plan);
      const t = Date.now();
      activeCalls = 0;
      // Validate the expected feasibility independently of model output.
      const oracle = propose(doc, c.scenario);
      expect(
        oracle.options.length > 0,
        c.id + " golden expectation drifted",
      ).toBe(c.feasible);
      let passed = false,
        state = "failed",
        code: string | undefined;
      try {
        const out = await investigate(doc, c.instruction, env);
        state = out.run.state;
        code = out.run.error?.match(/\(([a-z_]+)\)/)?.[1];
        const sameScenario =
          JSON.stringify(out.event.proposal?.scenario) ===
          JSON.stringify(c.scenario);
        const options = out.event.proposal?.options ?? [];
        const unchanged =
          JSON.stringify(out.event.plan) === JSON.stringify(before) &&
          (out.event.reports?.length ?? 0) === (doc.reports?.length ?? 0);
        passed =
          unchanged &&
          (c.feasible
            ? state === "awaiting_approval" &&
              sameScenario &&
              options.length > 0 &&
              options.every(
                (o) => validate(doc, o.assignments, c.scenario).length === 0,
              )
            : state === "needs_information" && options.length === 0);
      } catch (e) {
        code = modelFailure(e).code;
      }
      records.push({
        id: c.id,
        passed,
        state,
        code,
        latencyMs: Date.now() - t,
        providerRequests: activeCalls,
      });
      report();
    }
  } finally {
    globalThis.fetch = originalFetch;
    report();
  }
  expect(records.length).toBe(count);
  expect(records.filter((r) => r.passed).length / count).toBeGreaterThanOrEqual(
    floor,
  );
});
