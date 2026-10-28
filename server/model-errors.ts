export type ModelFailureCode =
  | "invalid_credentials"
  | "access_denied"
  | "quota_exhausted"
  | "rate_limited"
  | "model_unavailable"
  | "invalid_request"
  | "provider_unavailable"
  | "timeout"
  | "tool_call_missing"
  | "connection_failed";

export class MissingConnectionToolCall extends Error {}

// Provider messages, headers and URLs may contain secrets or echoed user data.
// Inspect bounded structured fields and return only fixed application messages.
export function modelFailure(error: unknown): {
  code: ModelFailureCode;
  detail: string;
} {
  if (error instanceof MissingConnectionToolCall)
    return {
      code: "tool_call_missing",
      detail:
        "The model responded without the required valid tool call. Check this model's tool-calling support.",
    };
  const e =
    error && typeof error === "object"
      ? (error as Record<string, unknown>)
      : {};
  const status = typeof e.statusCode === "number" ? e.statusCode : undefined;
  let data: unknown = e.data;
  if (
    !data &&
    typeof e.responseBody === "string" &&
    e.responseBody.length <= 32768
  ) {
    try {
      data = JSON.parse(e.responseBody);
    } catch {
      /* Untrusted non-JSON response. */
    }
  }
  const outer =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const body =
    outer.error && typeof outer.error === "object"
      ? (outer.error as Record<string, unknown>)
      : outer;
  const code = typeof body.code === "string" ? body.code : "";
  const type = typeof body.type === "string" ? body.type : "";
  if (
    [
      "insufficient_quota",
      "credit_balance_exhausted",
      "organization_spend_limit_exceeded",
      "project_spend_limit_exceeded",
      "organization_usage_limit_exceeded",
    ].includes(code) ||
    (status === 429 && type === "insufficient_quota")
  )
    return {
      code: "quota_exhausted",
      detail:
        "The provider reports exhausted API credits or a spending/usage limit. Check billing and limits in the API project that owns this key; repeated retries will not restore access.",
    };
  if (status === 401 || code === "invalid_api_key")
    return {
      code: "invalid_credentials",
      detail:
        "The provider rejected LLM_API_KEY. Check that it is active, belongs to the intended API project and has no surrounding quotes or spaces, then update Vercel and redeploy.",
    };
  if (status === 403)
    return {
      code: "access_denied",
      detail:
        "The provider denied this project's request. Check API-key permissions, project access and provider restrictions.",
    };
  if (status === 404 || code === "model_not_found")
    return {
      code: "model_unavailable",
      detail:
        "The model or API endpoint was not found or is inaccessible to this key. Check LLM_MODEL and the HTTPS LLM_BASE_URL for the same provider.",
    };
  if (status === 429)
    return {
      code: "rate_limited",
      detail:
        "The provider rate-limited the check. Wait before retrying and review the API project's rate limits.",
    };
  if (status === 400 || status === 422)
    return {
      code: "invalid_request",
      detail:
        "The provider rejected the model check's request format or parameters. Confirm Chat Completions and tool-calling support; the adapter may need adjustment for this model.",
    };
  if (status && status >= 500)
    return {
      code: "provider_unavailable",
      detail:
        "The model provider returned a server error. Check its service status and retry later.",
    };
  if (e.name === "TimeoutError" || e.name === "AbortError")
    return {
      code: "timeout",
      detail:
        "The model check timed out. Retry once; if it persists, check provider latency and network connectivity.",
    };
  return {
    code: "connection_failed",
    detail:
      "The model check could not reach or validate the provider. Check the HTTPS API base and server connectivity.",
  };
}
