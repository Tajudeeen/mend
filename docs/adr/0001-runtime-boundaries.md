# ADR 0001: Primary Node/PostgreSQL deployment and retained Worker compatibility

Status: accepted for the current release; revisit after the judging window.

## Decision and reason

The production target is Vercel/Next.js, Supabase Auth and PostgreSQL through Prisma. The earlier Sites environment requires a Worker build, verified dispatch identity and D1 through Drizzle. `run-framework.mjs` selects an execution profile; it does not migrate accounts or databases. The compatibility deployment explains the second runtime/ORM. Neither Drizzle nor D1 is required for the primary deployment's saved organizer events.

Retain compatibility while it has an explicit consumer and its build/smoke tests remain maintained. Do not expand compatibility-only product features. Before removing it, inventory active deployment consumers, export their data, agree the destination identity mapping and test import/restore. Unifying ORMs alone cannot make D1 and PostgreSQL identity/transaction behavior equivalent. No migration or runtime deletion is authorized by this ADR.

## Feature × runtime matrix

| Feature                                     | Primary Node/PostgreSQL | Worker/D1 compatibility                                                     |
| ------------------------------------------- | ----------------------- | --------------------------------------------------------------------------- |
| Domain planner, unknown-terms gate, reports | Required                | Required, shared code                                                       |
| Public fictional sample                     | Required                | Required                                                                    |
| Organizer identity                          | Supabase verified user  | Verified dispatch identity                                                  |
| Event storage and owner scoping             | Prisma/PostgreSQL + RLS | Drizzle/D1 + owner predicates                                               |
| CAS, request-key replay, revisions          | Required                | Required                                                                    |
| Email confirmation and GitHub OAuth         | Primary target only     | Not provided by this target                                                 |
| Live provider transport and tool contracts  | Required                | Shared code/build compatibility; no equivalent deployed live-evidence claim |
| Database-role isolation probe               | PostgreSQL only         | Not applicable                                                              |
| Physical device validation                  | Still open              | Still open                                                                  |

## Costs and review trigger

Two build chains, schema families and store adapters increase maintenance. Full local verification builds both and exercises the Worker/D1 path; that does not prove equivalent production auth/provider observations. Remove the compatibility target in a separately reviewed change when no active consumer remains. Revisit this ADR before adding a third store or runtime.
