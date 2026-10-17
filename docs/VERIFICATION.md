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

## Unverified release gates

- No live Qloo key or model credentials were available.
- The direct PostgreSQL probe failed local DNS resolution. Supabase SQL/RLS checks do not verify Prisma transactions using the application role.
- Vercel environment setup returned a team-scope 403. No working Vercel deployment is claimed.
- Supabase production sign-in/session/callback flow is not verified.
- Browser/mobile/keyboard/accessibility QA was unavailable in this authoring environment. No browser walkthrough or visual QA is claimed.
- GitHub Actions is committed but its remote run must be checked after publication.
