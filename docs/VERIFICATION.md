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
