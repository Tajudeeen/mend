# Release audit, October 29, 2026

For an event organizer facing a withdrawn performer, MEND should produce a feasible, culturally grounded proposal while preserving bookings and requiring explicit approval.

## Evidence ledger for this audit

| Claim or requirement      | Check                                                                                                             | Current scope                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Confirmed live terms      | Missing confirmation flags must produce unknowns and block approval                                               | Tightened API defaults, planner, readiness and edit form; negative regression                                                                     |
| Account state             | No signed-out form before the authenticated status returns                                                        | Loading-state component regression                                                                                                                |
| Site facts                | Space counts must reflect the saved event                                                                         | Fixed static five-space claim and sample/live capacity descriptions                                                                               |
| Impact measurements       | Failed and unfinished trials must not disappear or become successes                                               | v2 records, explicit participant role, abandonment/in-progress export and validated summary                                                       |
| Phone layout              | Same-origin frame with real 320/360/390/430 CSS viewport                                                          | `/review/phone`; visual observations are recorded after deployment, not inferred from builds                                                      |
| Qloo source               | Search, exact linking, fixed-pool Insights and PostgreSQL readback                                                | Existing production evidence; current three-audience conditional proposal run described in verification log                                       |
| Model workflow            | Read, propose, validate, evaluate, request human review                                                           | Contract tests and actual deployed attempts retained separately                                                                                   |
| Human approval and report | Approved facts, explicit choice, persisted immutable source snapshots                                             | Domain/D1 tests. Real confirmed-event production approval remains dependent on real facts and human action                                        |
| Storage isolation         | Limited runtime role, owner write and cross-owner refusal, rollback                                               | Production UI probe passed on previous deployment. Not every child-table policy or two real browser identities                                    |
| Host gates                | Meaningful Qloo agent, public app/source/MIT, English, written description, eligibility and finalist availability | Requirement manifest preserved; official rules rechecked October 29. Eligibility/submission/continued judging access require entrant confirmation |

The phone review uses a narrow iframe's actual CSS viewport. It does not establish touch, physical Android, virtual-keyboard, assistive-technology or device-performance behavior. Builder and automated trials are excluded from organizer impact results. No organizer benefit is claimed without actual organizer records.

## Adversarial checks

The existing suite exercises stale writes, duplicate request keys, owner isolation, origin/body bounds, unavailable keys/providers, model protocol and tool budgets, approval bypass attempts, unknown terms, locks, incident chaining, search truncation, source/score tampering and JSONB key reordering. New tests add omitted booking confirmations, unfinished-study retention, invalid completed assignments, duplicate sessions and exclusion of automation from organizer impact counts. A passing suite is bounded evidence, not proof that no bug can exist.
