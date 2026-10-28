# MEND documentation map

Start with [the host requirements](HOST_REQUIREMENTS.md). The machine-readable [host manifest](host-requirements.json) is checked by `pnpm check:repo`. It preserves required deliverables and equal rubric weights; it does not certify eligibility or submission.

| Question                                 | Source                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| What must the submitted product satisfy? | [Host requirements](HOST_REQUIREMENTS.md) and [product specification](product-spec.md)      |
| What is implemented or blocked?          | [Current plan status](PLAN_STATUS.md)                                                       |
| How do I configure live access?          | [Setup](SETUP.md)                                                                           |
| How do Node and Sites differ?            | [Architecture](ARCHITECTURE.md) and [deployment](DEPLOYMENT.md)                             |
| What do the endpoints accept?            | [API contract](API_CONTRACT.md)                                                             |
| How are cultural ranks derived?          | [Cultural continuity](cultural-continuity.md)                                               |
| What checks have actually run?           | [Dated verification log](VERIFICATION.md) and freshly generated `outputs/verification.json` |
| How do I evaluate organizer usefulness?  | [Organizer study](ORGANIZER_STUDY.md)                                                       |
| What goes into the submission?           | [Submission draft](SUBMISSION.md), still subject to the open gates                          |
| What remains after this release?         | [Roadmap](ROADMAP.md)                                                                       |

`RELEASE_0.3.md` is a historical release note. `evaluation/synthetic-results.json` is a historical synthetic run, not current live evidence. `pnpm benchmark` writes a fresh run to ignored `outputs/synthetic-results.json`, preserving the historical artifact. An explicit output path can be supplied to the benchmark when intentionally recording a new source artifact.

## Reproduce a comparison

In Repair studio, choose a disruption and select Compare repair strategies. The comparison never approves or applies either option. Download the comparison with its input snapshot, then run:

```sh
pnpm reproduce:comparison /absolute/path/to/mend-comparison.json
```

This re-executes the two bounded searches and rejects changed output assignments. Use the same source revision as the exported comparison. Rules-only ignores cultural ranking and prioritizes existing assignments; cultural ranking uses the configured ordinal objective. Both retain the same roster, practical constraints and node limit. Truncation can make search ordering matter. Different assignments do not prove that Qloo improves attendance or revenue, and this is not an LLM-only comparison.

The comparison export includes organizer event inputs and receipts. Review its contents before sharing. No secrets should be stored in an event document.

## Proof boundaries

Stored-response hashes establish consistency with the exported body. They do not authenticate Qloo as issuer. Offline reproduction establishes this planner's behavior for supplied inputs. Local verification establishes the checks listed in its generated report. None establishes live access, confirmed bookings, anonymous deployment access, organizer impact or a completed Devpost submission.
