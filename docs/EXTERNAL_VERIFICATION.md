# External verification and priority follow-up

The review's priorities are useful, with a scope correction: MEND does not send booking requests, receive supplier quotes or make bookings. Test event recovery and approved plans. Do not invent a quote/payment lifecycle to satisfy an inaccurate checklist.

## Real model evaluation

`pnpm eval:live` requires `MEND_RUN_LIVE_EVAL=1`, `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`. It refuses missing configuration instead of mocking. It evaluates the production `investigate` implementation using 50 curated situation/wording combinations. Default local count is five; set `MEND_EVAL_CASES=50` for the full suite. The default threshold is 0.90. Only real model requests are made; events are synthetic and no approvals are persisted.

Cases cover artist/vendor withdrawal, weather, zone closure, unchanged plans, locked infeasibility and an instruction to bypass approval. The scorer checks scenario extraction, unchanged active assignments/reports, valid proposal constraints and feasible/infeasible terminal states. Fixture expectations are independently checked by local tests. These 50 variants span ten situations, not fifty independent real events or a statistically established reliability rate.

`outputs/live-eval.json` records cases, pass rate, provider attempts, token usage and p50/p95 latency. Supply current `MEND_EVAL_INPUT_USD_PER_MILLION` and `MEND_EVAL_OUTPUT_USD_PER_MILLION` for an estimated aggregate cost. No price is guessed. Missing usage means the estimate may be incomplete. Requests are sequential with a 400-request/20-minute budget. Failed cases remain failures; there is no harness retry-until-pass or hidden model fallback. SDK/provider retries count toward observed attempts. Raw model responses, keys and organizer data are not persisted.

Use the manual **MEND external verification** workflow with `live_model` enabled. Configure the protected `live-evaluation` environment with its key secret, provider/model variables and optional price variables. Run only trusted source revisions. To gate merges, administrators must configure a required check on the appropriate trusted-head workflow and protected credentials. The checked-in manual workflow alone does not change branch protection or establish a merge gate. Do not expose keys to arbitrary PR code.

## Authenticated staging probe

Provision an isolated Supabase development branch and a preview deployment pointing to that branch, with migrations and runtime-role/RLS configuration matching the primary target. Seed two dedicated confirmed test accounts in that branch. Branch creation can incur cost; no branch is automatically created, no production auth setting is weakened and no production key is copied by these scripts.

Run `pnpm exec playwright install chromium`, then `pnpm test:staging` with `MEND_E2E_DISPOSABLE=1`, `MEND_E2E_ORIGIN` and dedicated `MEND_E2E_EMAIL_A/PASSWORD_A/EMAIL_B/PASSWORD_B`. The known production aliases are refused. Configure these variables/secrets in the protected `staging-verification` environment to run the manual workflow's `staged_auth` job.

The probe signs in through the actual browser UI using two independent cookie contexts, creates a blank live event through the real API, adds a vendor with unknown fees/availability, checks owner-only access, persisted reload, stale writes, missing-proposal refusal and request-key replay, then loads/reloads the event in the UI. Traces/videos/screenshots are off to avoid retaining credentials. Records remain on the disposable branch for inspection. Dispose of that entire branch through the normal reviewed environment lifecycle.

This probe does NOT establish signup/email/OAuth, a real vendor quote, real Qloo evidence or successful live approval. The staged policy test in `tests/approval-invariants.test.ts` separately exercises blocked -> terms edited -> old request invalidated -> new proposal -> approval/report -> duplicate refusal against synthetic cultural receipts. These are deliberately separate evidence claims. Full persisted live approval still needs real facts and explicit human approval.

## Coverage already present

- Mutation request keys and revision CAS exist in both stores; API replay returns the original owner-scoped result. Reuse the exact same UUID/body for the same intent after a lost response. Keys are scoped to owner, not bound to a request-body hash; never reuse one for a different intent. A concurrent conflict requires readback and reconciliation, not automatic submission with a fresh UUID.
- Provider tests already cover configured-key failure, rate/quota errors, protocol failures, response-size bounds, malformed data, timeouts and partial/missing Qloo coverage. They remain synthetic unless explicitly run against a provider.
- New executable `/api/mend` contract assertions cover status codes, error shape, cache policy and replay bypass. Repository dependencies are mocked there; this is not database E2E.
- New generated policy checks use reproducible seed `0x4d454e44`, 512 cases and positive/negative strata. They cover unknown flags, budget, stale proposal state and duplicate approval. They do not model tenant authorization, which belongs to store/API tests. No shrinking framework is claimed.

## Remaining operational work

Real Android/iOS sessions, full live approval, real organizer measurements, a timed isolated backup/restore drill, SBOM/vulnerability scanning and centralized request-trace observability remain open in `LIMITATIONS.md`. The runtime ADR documents retained compatibility; it does not remove an active deployment. `pnpm verify:fast` omits native/D1/build/benchmark coverage; `pnpm verify` remains the required full local check.
