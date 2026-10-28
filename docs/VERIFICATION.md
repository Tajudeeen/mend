# Verification, October 17, 2026

| Check                                                                                | Result                                                                                      |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Native domain, mocked Qloo and D1 tests                                              | 35 passed, 0 failed                                                                         |
| Vitest auth, session, connection, agent, React component, navigation and trial tests | 30 passed, 0 failed                                                                         |
| TypeScript                                                                           | Passed                                                                                      |
| ESLint on application/domain/server code                                             | Passed                                                                                      |
| Tracked-source secret pattern scan                                                   | Passed; not a comprehensive security audit                                                  |
| Next.js Node production build                                                        | Passed                                                                                      |
| Vinext/Worker compatibility build                                                    | Passed                                                                                      |
| Built Worker route/D1 smoke                                                          | Passed                                                                                      |
| Synthetic benchmark                                                                  | 20 scenarios × two strategies, 40 runs; zero hard-constraint violations in returned options |
| Supabase security advisor                                                            | No reported lints after schema/RLS application                                              |
| SQL cross-owner RLS check                                                            | Other owner's event visibility: zero; test transaction rolled back                          |

The 65 automated tests cover cancellation, vendor exit, rain, single-zone closure, budget, offering loss, locks, footprint/category/power/capacity constraints, unknown terms, search truncation, rank invariance, ties, singleton pools and an independent tiny exhaustive optimizer comparison. They also exercise manual draft approval, report generation, blank event creation, source-policy rejection, bounded tool calls, request replay, tenant isolation and CAS persistence.

New checks exercise proxy provenance, pool completeness, monotone ordinal aggregation, stale-pool rejection, missing-value fingerprints, current-fact restoration, explicit approval from the version register and actual event-timestamp trial timing with failed submissions.

Mocked-provider tests use the real agent SDK with a simulated compatible endpoint. React tests use JSDOM and exercise sample cancellation → approval → report without network writes, plus closure and spatial controls. These are not browser screenshots or a live model-quality assessment. The model adapter warns that the mocked provider lacks schema-native response format; application-level Zod validation still gates outputs.

Splash checks cover automatic dismissal, once-per-session behavior, explicit button/keyboard dismissal, content focus release, reduced-motion bypass and safe late hydration. Worker SSR checks require exactly one shared footer across the page routes.

Auth tests verify renewed request/browser cookies and private cache headers, signup callback/confirmation, browser-session signout, safe callbacks, bounded request bodies and cross-origin denial. Connection probes require authentication and per-owner limits; provider failures are redacted and do not substitute sample results. Component tests cover confirmation-required state and clearing diagnostics on signout. These checks use mocked Supabase/model responses, not live auth or provider credentials.

A navigation regression checks that the workspace click leaves default browser navigation available. Page-entry links deliberately use document navigation across the hosting dispatch boundary.

The Worker smoke loads the built artifact in Miniflare and exercises actual SSR/API handlers against D1, follows the rendered workspace link and checks setup/settings/demo destinations: anonymous denial, create → propose → approve → reload/history, stale revision denial, cross-origin rejection, tenant isolation and missing Qloo credentials. It also checks account status, ChatGPT identity preservation and authenticated missing-key diagnostics. D1 repository tests use Miniflare SQLite, not a repository mock.

Synthetic evaluation data and its limitations are committed under `docs/evaluation/`. Several larger searches truncate and are labeled accordingly. No live-Qloo or LLM-only benchmark, calibrated preference/attendance result, organizer study or booking has been run.

## Provider transport follow-up, October 23, 2026

Qloo responses are now read as a bounded UTF-8 stream. The 100,000-byte limit is enforced while downloading, including multibyte characters, and overflow cancels the remaining stream. The four-request concurrency limit now covers the response body as well as receipt of headers, so slow downloads cannot bypass it.

All 39 native tests and 30 Vitest tests passed, with TypeScript and ESLint passing. Four new transport regressions cover an oversized unfinished stream, byte-based limits, UTF-8 split across chunks and concurrency while bodies remain pending. Existing mocked Qloo provenance and complete-pool checks still pass. These results do not establish live Qloo or model access.

## Unverified release gates

- No live Qloo key or model credentials were available.
- The direct PostgreSQL probe failed local DNS resolution. Supabase SQL/RLS checks do not verify Prisma transactions using the application role.
- Vercel environment setup returned a team-scope 403. No working Vercel deployment is claimed.
- Supabase production sign-in/session/callback flow is not verified.
- Browser/mobile/keyboard/accessibility QA was unavailable in this authoring environment. No browser walkthrough or visual QA is claimed.
- GitHub Actions is committed but its remote run must be checked after publication.


## Host and product acceptance pass, October 27, 2026

- GitHub metadata confirms `Tajudeeen/mend` is public. Root MIT license and third-party notices remain present.
- The Sites publication is owner-private and has no Qloo/model environment entries. Public judge access and credentialed integration proof remain open.
- New approved reports snapshot receipts, scenario, optimizer and selected metrics. Exports disclose legacy missing sources. A detached snapshot regression verifies later evidence/assignment changes cannot rewrite the original report.
- The agent discards previous proposals before a run. Approval-ready status now requires reading the plan/constraints, generating a new proposal, validating constraints and evaluating continuity for the same option, then preparing approval. Negative tests cover a tool-free run with an old proposal and a generated-but-unvalidated option.
- 42 native tests and 32 Vitest tests pass across the complete suite plus the added fixed-pool influence regression. That influence test uses authored contract fixtures, not live Qloo responses. It demonstrates that changing evidence can change the selected repair and removing evidence refuses live planning.
- TypeScript and focused ESLint pass. The Next.js production build passes. The synthetic benchmark covers 20 scenarios and 40 runs with zero hard-constraint violations in returned options.
- The report verifier accepts an intact synthetic response and rejects a modified response. Hash matching establishes stored-body integrity only, not provenance, live provider access or correct derived metrics.
- Added `/review`, `HOST_REQUIREMENTS.md` and `SUBMISSION.md` to connect the product journey, host deliverables and honest release gates.
- Browser preview was attempted through the supported Sites preview. Its CLI reported a running preview, but the cloud browser returned `ERR_CONNECTION_REFUSED`. Browser/mobile/accessibility QA remains unverified. No alternate browser route or network configuration was used.

These checks do not complete the live-Qloo, live-model, public-access, deployed-auth or real-organizer gates.


## Code correctness follow-up, October 27, 2026

- Approved cancellations, closures, rain closures and budget changes now become current event facts. Subsequent repairs and restoration cannot silently revive a cancelled act or reopen a blocked zone. The incident remains in its approved proposal/report, while the event scenario returns to `none` so a deliberate later edit is respected.
- Offering substitutions merge global and incident allergen exclusions, compare normalized names, retain the affected vendor and recheck declared inventory on approval. This validates organizer declarations, not food safety.
- Unknown incident participants, zones and vendor offerings are rejected in the shared planner, including the agent path.
- Nonzero physical spacing is rejected rather than silently accepted. The conceptual canvas has no calibrated distance scale, so physical clearance remains unsupported.
- Event, culture and agent APIs consume bounded streams, count UTF-8 bytes and cancel over-limit uploads. Event writes require a matching Origin header. Upload regressions assert cancellation before event/provider access.
- The agent reserves its 16-call budget before each execution. A 20-call parallel model response triggers at most 16 mocked provider searches. Trace limits remain a second check.
- 50 native tests and 38 Vitest tests pass across the full suites and the focused agent-budget follow-up. TypeScript and lint pass. The Next.js production build and Worker/database smoke are checked for this revision before publication.

Live credentials, production authentication, browser/device QA and public judge access remain separate gates. This pass makes no claim that every possible defect has been eliminated.


## Independent preparation and report inspection, October 28, 2026

- Added a six-step live-event preparation panel. It uses current planner coverage and constraints, shows missing audience/participant inputs and unconfirmed active-plan terms, and links to the relevant editor. Synthetic mode does not satisfy live evidence preparation.
- Added `/verify`, a browser-local approved-report inspector. File contents are not sent to a server. Oversized files are rejected before reading, changing files clears prior results, and empty receipts are labeled as no evidence rather than a successful live verification.
- The browser and CLI share the same parser/hash checker. Duplicate, missing and unreferenced receipts, malformed reports and changed response bodies are refused. The CLI checks file size before loading its contents.
- Hashing is now a small shared module, preserving the existing Qloo receipt algorithm. Hash consistency does not authenticate the issuer, establish a live request, validate derived scores or demonstrate organizer impact.
- Tests cover current/stale cultural pools, blank events, unknown terms, report tampering and the local file UI. No live provider credential is required by these checks.

Provider access and browser/device QA remain separate gates. The previous supported browser preview returned a connection refusal, so no browser/device verification is claimed by the component tests.


## Host alignment and repository cleanup, October 28, 2026

The checked `host-requirements.json` preserves eight host gates, all four equally weighted criteria, the optional-video rule and the deadline. `check-repo.mjs` checks required source/evidence paths, licensing, documentation links and generated-output exclusions. File presence does not certify external compliance.

Removed the 61 starter UI components, their unused mobile hook/utility/configuration, three unused stock SVGs and 18 unused direct dependencies. The one connector recovery action that used the starter button now uses the existing native link styling. Kept the full application, original specification, host checklist, deployment adapters, font/build licenses and historical verification/evaluation artifacts. Rewrote the README as an entry point and added `docs/README.md`; historical release notes remain historical.

Added a read-only comparison of cultural and rules-only repairs. Both retain the same roster, operational constraints and node limit. The baseline ignores cultural ranking and prioritizes existing assignments. Live cultural comparison refuses missing evidence. The export includes replay inputs; `reproduce:comparison` re-executes the searches and rejects changed output assignments. Reproduction is not proof of Qloo authorship, live access, improved attendance or an LLM-only comparison. Truncated searches disclose their limitations.

`pnpm verify` now runs repository/secret checks, Prisma generation, types, lint, domain/provider/component tests, synthetic benchmark, Node build, Worker build and the Worker/D1 workflow. It emits source metadata and exact pass/fail steps in ignored `outputs/verification.json`. CI runs this same command and retains reports as artifacts. Fresh benchmarks go to ignored outputs; historical benchmark files are not silently overwritten. Consult the generated report or CI run for this revision's actual execution result.

Live Qloo/model repair, anonymous hosting access, deployed primary authentication/persistence, browser/device QA, organizer impact and Devpost confirmation remain unverified. This cleanup does not mark any of them complete.


## Vercel packaging follow-up, October 28, 2026

The supplied Vercel log for `2ffccdc` passed compilation, TypeScript and page generation, then failed `NEXT_OUTPUT_DIR_MISSING`: the adapter searched `.next` while Next emitted `.next-node`. The repository now explicitly configures `vercel.json` `outputDirectory` as `.next-node`, and its repository check imports the actual Next config to prevent drift. `engines.node` is pinned to `24.x`. Local build success does not alone establish successful Vercel packaging; the next remote deployment must be checked.


## 2026-10-28: Vercel becomes the primary shared URL

README, setup, host checklist and submission links now use `https://mend-deeencodes.vercel.app`. The former ChatGPT Site URL is removed from current entry points; compatibility source and dated evidence remain preserved. No saved data or identities were migrated.

Production deployment `dpl_zZ6DuxJ4ehQKiFrwNrfoBeZTUyot` reached READY for commit `9f73a766e7a91eb192d1c4e487b6a1a740a8bbdd`. Authenticated deployment fetches returned HTTP 200 for `/demo` and `/api/health`. Health reported runtime `next-node`, Qloo/model unavailable and persistence/auth not configured. A separate unauthenticated HTTP request following redirects ended on Vercel login, not the sample. Deployment readiness does not yet prove anonymous judge access or a live organizer workflow.


## 2026-10-28: production authentication redirect and database connection

GitHub dashboard authentication completed. The Supabase URL Configuration page showed the original Site URL `http://localhost:3000` and no redirect allowlist. Saved the production Site URL `https://mend-deeencodes.vercel.app` and exact `/auth/callback` URLs for that domain and the existing `usemend.vercel.app` alias. The dashboard showed both entries after saving. Existing emailed links are not rewritten; a fresh confirmation flow still needs user verification.

Configured production `DATABASE_URL` for the existing limited `mend_runtime` role through the transaction pooler assigned by the project's Connect dialog. Its role has no superuser, create-role, create-database or RLS-bypass privileges; RLS remains enabled on all twelve application tables. Credentials remain server-side. No initial migrations were reapplied.

The first deployed database probe failed. Redacted runtime logs classified the failure as TLS, Prisma code `P1011`. Downloaded the Supabase Root 2021 CA from the certificate link in this project's Database Settings and configured `DATABASE_CA_CERT`. The adapter explicitly preserves certificate/hostname verification and prevents URL SSL parameters from replacing its TLS configuration.

Production deployment `dpl_HPcfwtuaMpXTMFZZTS3C1MNR3zmZ`, source `54e88ba1f95735d0bafbd7ce0d06cc815c02ba57`, reached READY. Its `/api/health?probe=database` returned HTTP 200 with `databaseReady: true` through authenticated deployment fetching. This exercises the real Prisma transaction/table-read path and rejects elevated roles. It does not prove an organizer event write or completed registration.

All eleven `pnpm verify` stages passed at the corresponding clean local source tree: repository, secret patterns, Prisma generation, TypeScript, lint, native tests, component/provider tests, synthetic benchmark, Node build, Worker build and local Worker/D1 workflow. The synthetic benchmark ran 20 cases/40 searches with zero hard-constraint violations. These remain separate from live Qloo/model verification.

A separate rollback-only production SQL write/isolation check was attempted through the management connector, but its session was denied `SET ROLE mend_runtime` before any insert. No permission was expanded to make the test pass. Authenticated create/reload, write isolation, full confirmation/cookie flow, anonymous judge access and live provider repair remain pending deployment checks.

## 2026-10-28: participant and judge review

Anonymous HTTP requests returned a Vercel login redirect for `mend-deeencodes.vercel.app/demo` and HTTP 200 for `usemend.vercel.app/demo`. The latter opened anonymously in the browser, generated three fictional cancellation alternatives and applied an explicitly approved option. Subsequent report navigation could not be observed because the browser automation transport failed. Current entry links now promote `https://usemend.vercel.app`; historical URL records remain unchanged.

The repair screen now prioritizes the scenario and alternatives, exposes actual refusal reasons and search truncation, and offers a direct report action after approval. The fictional sample explains how to access the live assistant instead of presenting an unavailable run form. Per-search rank and candidate-metric caching preserves the bounded search. Before/after local exports for cancellation, rain and budget matched returned options, metrics, examined counts and truncation flags exactly. Regression tests additionally compare cached results with standalone metrics after changing event inputs and check option isolation.

The owner reported a successful deployed Groq tool-call probe. It is not an independently captured full recovery run. Qloo access, authenticated create/reload and write isolation, complete live recovery, mobile/browser review of this revision, measured organizer impact and final submission remain separate gates. See [the review](JUDGE_REVIEW.md) for priorities and evidence limits. Consult the fresh ignored verification report or CI for the actual checks run on this revision.

## 2026-10-28: event evidence and navigation boundaries

The owner received a Qloo key and configured it in production. Corrected the assigned hackathon origin by removing its trailing slash and redeployed as `dpl_CvRy73gcuUCZ5FfBJX5ZnqHyFHsw`, which reached READY. This configuration change does not establish a successful Qloo search or insights request. The adapter now accepts whitespace and a root trailing slash while retaining its exact HTTPS origin allowlist and rejecting paths, queries, fragments and embedded credentials. New collected receipts record the assigned origin.

Saved-workspace load failures previously left a sample document visible; that fallback is now blocked by explicit loading, error/retry and empty states. Synthetic and live modes, temporary sample audit entries, stored source batches, model run records, proposals, reports and server readback are displayed separately. Replaced fixed proof claims with an event-specific ledger. The source checker recomputes hashes, checks derived affinity values against response bodies and identifies changed audience/roster context and duplicate receipt IDs. Evidence exports include their actual session/history/readback state and fresh inspection output. These are application consistency checks, not provider authentication or impact evidence.

Workspace sections now update active navigation and content focus, scroll smoothly unless reduced motion is requested, and close mobile navigation on selection, backdrop click or Escape. Focus rings and evidence/error/success states use the existing MEND palette. Page boundaries continue to use document navigation. See [the evidence workflow](EVIDENCE_WORKFLOW.md) and the fresh local verification report/CI for checks on the final source revision. Full deployed organizer recovery, production write isolation and real organizer impact remain separate gates.

### Authenticated live checks later on October 28

Secure browser sign-in completed on the public origin. Both connection checks passed: a real authenticated Qloo artist search and the model's required nonce tool call. Created a separate private event named `MEND verification — example inputs`, explicitly describing its operational inputs as fictional and leaving booking terms unknown. The existing organizer event was not changed.

Added an unconfirmed reserve performer, selected the exact Qloo identity returned by search and a resolved audience interest, then collected one real `/v2/insights` artist batch through the assigned hackathon origin. The event reached revision 4 with one source receipt and five application audit entries. The in-product check matched the stored response hash and affinity values and identified current context. Reload saved evidence returned that same revision and receipt from the server with a fresh read time. This verifies those specific production create/mutation/read operations and that batch, not full cultural coverage, cross-owner write isolation or a completed recovery.

Browser inspection confirmed the sample boundary and the failed-load screen, content focus at the top after section navigation, smooth scrolling and no horizontal page overflow at the observed 1348px desktop viewport. Mobile visual QA remains unverified. The sample export download event completed, but the downloaded file was unavailable through the browser file bridge, so its contents were not independently inspected in this session.

A live bounded model investigation was persisted as failed with unchanged assignments. The generic failure message hid its cause. The agent now returns controlled failure classifications without raw provider bodies and includes explicit JSON instructions required by Groq JSON mode; local contract tests assert that request requirement. This change still needs a live rerun before claiming it fixed that failure. Empty event plans also no longer pass operational validation or display numerical cultural indices. The Qloo search submit control now has an accessible name.

The next live retry surfaced a controlled `invalid_request` provider rejection and retained no proposal. Contract inspection then reproduced an incompatible function schema: the disruption union serialized without an object at the function-parameter root. The planning tool now wraps its typed disruption in a `scenario` object, and the contract checks every exported tool's root type. Tool execution also omits native response formatting; the final text must parse as JSON, pass the exact application schema and pass grounded-claim validation. This retains all approval/source gates and avoids relying on a provider's combined formatting/tool support. See [Groq's output documentation](https://console.groq.com/docs/structured-outputs). Invalid final text cannot retain a proposal or change assignments. A fresh live run is required to verify the combined adapter repair; earlier failures remain in the event history.

The following deployed retry reached `get_event_plan`, then recorded another controlled request rejection. Inspection of the installed compatible SDK showed it reads Groq's `reasoning` response field but replays that text as `reasoning_content` in later assistant messages. The Groq adapter now requests `include_reasoning: false` and removes that unsupported replay field for Groq only, preserving content, tool calls and tool results. The multi-step SDK contract supplies reasoning in simulated Groq responses and asserts that later requests omit the replay field. Other providers keep their existing message transport. See [Groq's reasoning documentation](https://console.groq.com/docs/reasoning). This transport repair must also be checked live; failed historical runs remain visible.

With corrected reasoning history, the next live run completed both event and constraint reads. Its final answer failed strict application validation, so it retained no proposal. Added a typed `finish_investigation` reporting tool, gated on event/constraint reads and the existing approval-readiness checks. On Groq, context reads are selected sequentially; an incomplete event is then routed to the reporting tool. This avoids depending on free-form final JSON and reduces repeated tool-schema overhead. It does not bypass missing facts, evidence validation, the 8-step/16-call bounds or human approval. A contract verifies the three-step missing-input path; final text from other compatible providers still must pass the same JSON/schema/grounding checks. A live final-report rerun remains required.
