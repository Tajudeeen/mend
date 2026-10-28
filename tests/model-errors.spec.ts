import { test, expect } from "vitest";
import {
  modelFailure,
  MissingConnectionToolCall,
} from "../server/model-errors";

test.each([
  [401, "invalid_api_key", "invalid_credentials"],
  [403, "permission_denied", "access_denied"],
  [404, "model_not_found", "model_unavailable"],
  [429, "credit_balance_exhausted", "quota_exhausted"],
  [429, "project_spend_limit_exceeded", "quota_exhausted"],
  [429, "organization_spend_limit_exceeded", "quota_exhausted"],
  [429, "organization_usage_limit_exceeded", "quota_exhausted"],
  [429, "insufficient_quota", "quota_exhausted"],
  [429, "rate_limit_exceeded", "rate_limited"],
  [400, "unsupported_parameter", "invalid_request"],
  [400, "tool_use_failed", "tool_generation_failed"],
  [503, "server_is_overloaded", "provider_unavailable"],
])(
  "provider HTTP %s / %s becomes a safe %s diagnosis",
  (statusCode, code, expected) => {
    const result = modelFailure({
      statusCode,
      message: "private-key raw exception",
      url: "https://private-key.invalid",
      responseHeaders: { authorization: "private-key" },
      responseBody: JSON.stringify({
        error: { code, message: "private-key echoed request" },
      }),
    });
    expect(result.code).toBe(expected);
    expect(JSON.stringify(result)).not.toContain("private-key");
  },
);
test("SDK parsed errors preserve billing diagnosis and do not confuse it with rate limiting", () => {
  expect(
    modelFailure({
      statusCode: 429,
      data: { error: { type: "insufficient_quota", message: "private-key" } },
    }).code,
  ).toBe("quota_exhausted");
  expect(
    modelFailure({ statusCode: 429, responseBody: "private-key not JSON" })
      .code,
  ).toBe("rate_limited");
});
test("timeouts and missing tool calls remain distinct from unknown failures", () => {
  expect(
    modelFailure(new DOMException("private-key", "TimeoutError")).code,
  ).toBe("timeout");
  expect(modelFailure(new MissingConnectionToolCall()).code).toBe(
    "tool_call_missing",
  );
  expect(modelFailure(new Error("private-key")).code).toBe("connection_failed");
  expect(modelFailure(null).code).toBe("connection_failed");
});
