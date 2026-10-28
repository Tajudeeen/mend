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
