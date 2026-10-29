# API contract

All JSON responses are uncached. The primary target authenticates Supabase sessions; the Sites compatibility target uses verified dispatch identity. Caller-supplied owner fields are ignored.

## Event endpoint

`GET /api/mend` lists owned events and Qloo configuration status. `GET /api/mend?id=<UUID>` returns an owned event and audit; `history=1` includes recent snapshots.

`POST /api/mend` requires JSON and requires a matching Origin header. Body limit: 40,000 UTF-8 bytes, enforced while streaming. Event mutations require `id` and current integer `revision`. Optional UUID `requestKey` replays the original persisted result for the owner. Reuse it only for the same intent. Create/search do not need a prior revision.

| Action                                   | Purpose                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| create                                   | Blank live event from a validated `brief`; no brief creates an explicitly fictional sample              |
| brief, mode, constraints, optimizer      | Edit event settings and invalidate pending proposals                                                    |
| candidate, addCandidate, removeCandidate | Edit pool and known/unknown booking facts; active participants require repair before removal            |
| zone, removeZone, layout                 | Edit zones and conceptual geometry, respecting locks                                                    |
| slot, removeSlot                         | Edit programme; active slots cannot be directly deleted                                                 |
| offerings                                | Edit organizer-declared inventory and restrictions                                                      |
| assignment, lock                         | Draft manual assignments or protect commitments                                                         |
| proposeDraft                             | Validate the manual draft and request approval                                                          |
| search                                   | Search Qloo without auto-selecting a result                                                             |
| vendorProfile                            | Save/clear one to three reverified place references and an explicit rationale for an independent vendor |
| restoreRevision                          | Load an owned historical revision server-side and propose its assignments using current facts and locks |
| resolve, clearSeeds                      | Reverify identity selection or clear cohort interests                                                   |
| evidence                                 | Collect a complete fixed-context live receipt                                                           |
| propose                                  | Store alternatives for none/cancellation/rain/budget/closure/offering scenario                          |
| approve, reject                          | Apply a current stored option after revalidation, or close the request                                  |

Errors use `{error}`. Authentication failure returns 401, missing owned event 404, stale revision 409, cross-origin 403 and oversized body 413. Other invalid input/upstream failures return 400. No failed upstream call creates cultural evidence.

## Additional routes

- `POST /api/agent`: authenticated, bounded natural-language proposal request with event/revision. Stores run/proposal through CAS. No approval tool.
- `/api/culture`: authenticated Qloo tags/discovery adapter, with query and rate limits.
- `/api/health`: runtime/configuration indicators without credentials; configuration is not a live connectivity check. `?probe=database` additionally checks the Node runtime’s actual Prisma table access and rejects superuser/RLS-bypass connections. It returns only `databaseReady`, uses a 30-second process cache and reports HTTP 503 on failure. This does not prove event writes or a complete authenticated workflow.
- `/api/auth`, `/auth/callback`: Supabase sign-in/sign-up/session routes. Production redirect settings and full flow require verification.

## Qloo boundary

Search supports artists, vendor places and brands; discovery supports artists and vendor places. Tags use `/v2/tags?filter.query=...`. Insights uses `/v2/insights` with `filter.type`, explicit seed entities, a fixed `filter.results.entities` pool, and explainability. Authentication uses server-only `x-api-key`. Finite scores and complete candidate coverage are required. Timeouts, bounded retries and local concurrency limits apply.

Historical baseline: reference contracts were reviewed on 2026-10-17 with mocks. Later credentialed artist observations are recorded in VERIFICATION.md; this document is not a new live-call observation. Place-reference proxy workflows remain mocked-contract tested; live vendor validation and Analysis Compare remain open.

Connection-check model failures include an optional stable `code` and a fixed recovery message. Billing/quota exhaustion is distinguished from rate limiting, invalid credentials, access denial, model/endpoint absence, invalid request parameters, timeout, provider outage and missing tool calls. Raw provider messages, response bodies, headers, URLs and credentials are never returned or logged. A configured model is not a passing live check.

## Executable checks and retries

`tests/api-contract.spec.ts` asserts the event endpoint status codes, error envelope, private cache policy and owner-scoped replay behavior. Those handler tests mock repository/auth dependencies. Staging and live-provider execution remain separate; see EXTERNAL_VERIFICATION.md.

A request key replays the original persisted owner-scoped result. Keep the same key and body for one intent after a lost response. Keys are not payload-bound. For concurrent conflicts, read back current revision/history before retrying; do not automatically create a new key.
