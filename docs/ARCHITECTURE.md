# Architecture and invariants

## Runtimes and request path

The primary target is Next.js App Router on Node.js, Supabase Auth, PostgreSQL and Prisma. The existing Sites deployment is a compatibility target using Vinext, ChatGPT dispatch identity and D1. The shared domain and UI do not imply that saved data or identities have been migrated between these systems.

React workspace → authenticated JSON route → validated command / bounded agent → domain planner → owner-scoped transaction → revision, audit and report. `lib/commands.ts` handles structured commands, `lib/planner.ts` handles constraints/scoring/search, and `server/agent.ts` exposes typed tools without an approval tool. Natural-language output cannot directly change active assignments.

`lib/repository.ts` selects D1 only when the compatibility runtime supplies its binding. Otherwise it imports `server/postgres.ts`. `lib/runtime.ts` scopes compatibility environment through AsyncLocalStorage. The Node target verifies Supabase sessions with `auth.getUser`; it does not trust caller-supplied identity headers. Only the Sites adapter uses the platform's authenticated dispatch header.

## Persistence and ownership

All API owners come from verified server identity, never form fields. Writes validate origin, JSON schema, revision and request size. Per-process request limits provide defense in depth; distributed rate limiting is not implemented.

PostgreSQL transactions set a transaction-local JWT subject for RLS. The application role has no RLS bypass or schema creation privileges. Event ownership policies scope child tables through their event. Mutable operational tables are normalized, while PlanRevision, Assignment, EvidenceRecord, RecoveryRun, RecoveryReport and AuditEvent are append-only to the application role. Evidence/report/run insertion checks for existing IDs without issuing updates. Event CAS, normalized data, snapshots, audit and optional OperationKey are in one transaction.

D1 batches a conditional event update and gated revision/audit inserts. Tests exercise actual Miniflare D1 transactions. Optional request keys persist their results with the mutation; retries return the original result for that owner. A caller must reuse a key only for the same intent. Payload fingerprints, automatic replay of simultaneous losing requests, key expiry and cross-process rate limits remain follow-up work.

History endpoints return the latest 100 entries. Older rows are retained but pagination and user restoration/deletion are not implemented. Administrative access can alter records; this is not a tamper-proof ledger.

## Planner

Events have configurable participant pools, zones and slots. The bounded DFS explores candidate assignments and spatial allocations, checks hard constraints incrementally, and returns up to three distinct participant mixes. Configurable node limits bound work; truncation is reported. A truncated empty result is not proof of infeasibility. No unrestricted global optimality is claimed.

Constraints cover budget, hours, availability, participant/slot uniqueness, locks, participant/zone type, footprint, category restrictions, capacity, simultaneous power and closures. Unknown fees/availability/confirmation remain visible and make an option conditional; live approval blocks unconfirmed terms. Declared offering substitutions use organizer inventory and allergen restrictions, not generated ingredients or safety certification. One disruption is modeled at a time.

Raw affinities are converted to fractional midranks within each fixed cohort/domain pool. Domain means receive equal weight before weighted audience aggregation. The default rank-v2 objective is 35% relevance, 25% cohort floor, 25% continuity and 15% stability. Adjustable weights are disclosed. Continuity compares the current plan's ordinal vector to the approved reference plan. See `cultural-continuity.md` for the exact definitions. These metrics are product heuristics, not calibrated outcome probabilities.

## Drafts and approval

Manual assignments create a draft. Proposal generation records a source revision, scenario, candidate options, evidence IDs and trace without changing the active plan. Approval accepts only a current pending server-stored option, repeats hard validation, updates the active/reference plan and creates a before/after report in the same persisted revision. Any intervening edit invalidates or makes the proposal stale.

## Cultural and model boundaries

Qloo adapters support identity search, tags, discovery and fixed-pool Insights. Ambiguous identities need explicit selection. The server rechecks selections. A cultural batch requires finite scores for every mapped candidate in its fixed context; no missing result is fabricated. Receipts retain request parameters without secrets, timestamp, raw response, explainability and a SHA-256 hash. Hashes support exported-data integrity, not provider signatures.

The language agent has at most eight model steps, sixteen recorded tool calls, a timeout and bounded output. It can inspect constraints/evidence, generate feasible alternatives and prepare an approval request. It cannot approve, book, spend or send. Cultural statements must match reproducible statements derived from stored receipts. Provider tests are mocked; live grounding remains an integration gate. Local vendor proxies and broader coverage-based fingerprints remain incomplete.

## Deployment

See `DEPLOYMENT.md` for migration baselining and runtime-role separation. `/api/health` and Settings distinguish the primary and compatibility runtimes. Local builds and tests are not evidence that the deployed Supabase/Prisma application path works. Existing D1 data must be migrated explicitly with verified identity linking.
