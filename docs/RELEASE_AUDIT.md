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

## Observed outcomes

The current deployed test reached a real Qloo-backed conditional proposal and human-review preparation. Approval correctly stayed disabled for unknown booking terms. Source `4ca358c6e221` retains that observation; the verification log records the two preceding failures and the operational-summary defect found during the successful run. Summaries now derive from event records. Narrow CSS viewport testing found and fixed the obstructed drawer close control and cramped form/actions. The sample reached its report screen. Browser download capture remained unavailable, so the complete report JSON is inspectable in-page. An automated abandoned-trial check retained the rejected attempt and stayed excluded from organizer impact.

No real organizer impact, actual booking confirmation, human production approval or every-device/every-policy guarantee follows from these checks. The remaining work is recorded explicitly rather than converted into a passing status.

## Reliability follow-up

The subsequent clean verification on `9c09cc830a4beb9750aadf42c55bcb5fde120ba5` passed 185 tests and all 11 local stages. New additions are an opt-in real-model harness, a guarded two-account staging probe, executable event-route contract checks, generated approval-policy invariants, a staged terms-resolution test, the runtime ADR and a living `LIMITATIONS.md`. The external harnesses have no passing live/staging run yet. Their setup and boundaries are in `EXTERNAL_VERIFICATION.md`; the dated verification entry records observations and the initial unsuccessful Node build followed by a clean rebuild.
