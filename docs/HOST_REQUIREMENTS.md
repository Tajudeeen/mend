# MEND acceptance and submission checklist

Reviewed 2026-10-28 against the [event overview](https://qloo.devpost.com/) and [official rules](https://qloo.devpost.com/rules). Host requirements and our product validation are separate. A source implementation is not proof of a live capability.

The checked manifest is [host-requirements.json](host-requirements.json). Repository checks protect the requirement list, not the external outcomes.

## Host gates

| Requirement                                                | Current evidence                                                             | Release action                                                             |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Working Qloo-integrated agentic application                | `server/agent.ts`, `lib/qloo.ts`, `lib/planner.ts`; mocked integration tests | Qloo key/origin configured; live request verification pending; owner reported Groq tool-call pass; demonstrate live influence        |
| Externally published functional demo                       | Public sample at https://usemend.vercel.app; anonymous browser generated and approved a fictional repair                                  | Verify full live workflow and maintain access through judging |
| Public complete source repository                          | GitHub metadata confirmed public on October 27                               | Verify final default branch and clean setup                                |
| Detectable open-source license                             | Root MIT `LICENSE`; font and build notices retained                          | Retain third-party notices                                                 |
| Written features and Qloo workflow                         | README, `SUBMISSION.md`, `/review`                                           | Finalize with verified live evidence                                       |
| Registration and submission                                | No verified Devpost confirmation                                             | Join event and submit required fields                                      |
| English materials, original work and licensed dependencies | English docs and source notices                                              | Entrant confirms ownership and eligibility                                 |

Deadline: October 30, 2026, 23:45 EDT, equivalent to October 31, 04:45 Africa/Lagos. Videos are optional. Finalists must be available for preparation and the November 5 live presentation. Materials and claims must match actual functioning behavior. Judges need free access through the end of judging. No final submission has been made by this engineering pass.

New projects and updated existing projects are allowed, but the existing-project clause contains malformed wording. Preserve dated development history and seek clarification if relying on prior work. The overview rejects private-only demos, while the formal testing clause discusses credentials. Public anonymous demo access is our acceptance target.

## Rubric, equal weights

| Criterion                    | Weight | MEND evidence to inspect                                           |
| ---------------------------- | ------ | ------------------------------------------------------------------ |
| Technological implementation | 25%    | Live Qloo receipt, tool trace, ranking and constraint checks       |
| Design                       | 25%    | Complete incident → options → approval → report journey            |
| Potential impact             | 25%    | Specific organizer problem, observed trial results and limitations |
| Quality of idea              | 25%    | Cultural continuity during operational disruption                  |

The host first checks theme/API viability. Technical implementation is the first tie-breaker. This checklist is not a promise of eligibility or a predicted judge score.

## Product acceptance

For a music-led market organizer, a lost act can force hurried substitutions that damage the programme or break practical commitments. MEND must help the organizer choose and document a feasible repair.

| Product guarantee                                                         | Implementation and verification                                             | Status                                                             |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Enter a real event, participants, zones and slots                         | `new-event`, `commands`, configuration editors                              | Implemented; public sample generation/approval observed; authenticated organizer journey pending |
| Cultural identities are chosen deliberately                               | Search, explicit linking and vendor reference profiles                      | Adapter tests; live market quality unverified                      |
| Qloo carries a necessary decision input                                   | Fixed-pool ordinal ranks; missing live evidence fails closed                | Contract tested; live decision effect unverified                   |
| Budget, time, space, power, capacity and locks constrain repairs          | Deterministic planner and negative tests                                    | Local checks required for each release                             |
| Unconfirmed fees/availability prevent live approval                       | `approve`, recovery tests                                                   | Implemented and regression tested                                  |
| Agent reads inputs, generates, validates, evaluates and requests approval | Enforced per-run gate in `server/agent.ts`                                  | Mock-provider tests; owner-reported Groq tool-call pass; full agent run pending                         |
| Agent never applies assignments                                           | Typed tools exclude approval; active-plan assertions                        | Mock-provider tested                                               |
| Approval rejects stale decisions                                          | Revision checks and compare-and-swap persistence                            | Domain/D1 tests; production PostgreSQL path unverified             |
| Historical reports keep their original sources                            | Approval-time receipt and decision snapshots                                | Regression tested; legacy gaps disclosed                           |
| Report exports can be inspected independently                             | `pnpm verify:report FILE`; response hashes and missing references           | Integrity only, not issuer authentication                          |
| Sample and live evidence remain distinct                                  | Explicit modes, synthetic disclosures, no live fallback                     | Domain/UI tests                                                    |
| Failure has a recovery path                                               | Locked cancellation, missing credentials, provider failures, bounded search | Negative tests; actual provider failures need live validation      |
| Organizers retain private data                                            | Ownership checks, auth and database policies                                | Local tests; deployed isolation needs verification                 |
| Usable on phones and keyboard                                             | Responsive UI and controls                                                  | Browser/device QA remains a release gate                           |
| Impact claims reflect observed evidence                                   | `/study` exports raw attempts and timing                                    | No completed real-organizer trial claimed                          |

Bookings, payments, ticketing, outbound messages and certified venue/food safety are outside this release. These are not host requirements. Two-market coverage and organizer trials are our validation goals, not additional host mandates.

## Required live proof

Use the server configuration in `SETUP.md`. Record the commit, deployment, timestamp and redacted artifacts for one real event. Resolve an audience and a fixed candidate pool, collect Qloo evidence, trigger a cancellation, generate and validate alternatives, approve explicitly, reload, and export the report. Demonstrate how a Qloo-backed ranking affects the choice compared with a disclosed rules-only baseline using the same roster and constraints. Do not claim an LLM-only performance comparison unless it was actually run.

Run a second organizer isolation check and an anonymous judge walkthrough after publication. Keep screenshots free of private event information and credentials. A configured key, health response or mocked provider is not this proof.
