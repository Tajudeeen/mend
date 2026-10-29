# MEND

Keep the feeling. Repair the plan.

MEND helps music-led market and cultural pop-up organizers repair a programme after a performer cancels, a vendor withdraws, weather closes a zone or the budget changes. It combines cultural evidence with practical constraints, then leaves the decision with the organizer.

- Application: https://usemend.vercel.app
- Reviewer walkthrough: https://usemend.vercel.app/review
- Sample event: https://usemend.vercel.app/demo
- Report source checker: https://usemend.vercel.app/verify
- Source: https://github.com/Tajudeeen/mend

The public application is https://usemend.vercel.app. An anonymous browser review on October 28 reached the sample, generated three cancellation repairs and approved one fictional repair. The former `mend-deeencodes.vercel.app` alias still redirects anonymous requests to Vercel sign-in and is not the submission destination. Authenticated Qloo search, one event-specific artist Insights batch, Groq tool-call probing and create/mutation/readback of a labelled verification event were observed on October 28. A deployed Qwen investigation also read the saved event/constraints and returned a validated missing-input report with no assignments changed. Full live repair/approval, complete cultural coverage, cross-owner write isolation, mobile QA and organizer impact remain unverified. The public sample does not close the live integration gates.

For event-specific source checks, server readback and the limits of each claim, see [the evidence workflow](docs/EVIDENCE_WORKFLOW.md).

## Try the workflow

Open the sample, withdraw the opening performer, inspect alternatives and approve one repair. Open Recovery reports for the before/after record. Download a report and inspect it in `/verify`. The sample uses fictional people and synthetic preferences and makes no booking or attendance claim.

To challenge the safety behavior, lock the opening performer and simulate that performer cancelling. MEND must explain the conflict instead of silently breaking the lock. Approved disruptions persist as current event facts for subsequent repairs.

In Repair studio, Compare repair strategies runs the cultural objective alongside a rules-only baseline with the same practical constraints. It never applies either result. The export includes its inputs and can be reproduced offline:

```sh
pnpm reproduce:comparison /absolute/path/to/mend-comparison.json
```

A different result is not proof of greater real-world usefulness. Synthetic and live evidence remain explicitly separated. Search bounds and unknown booking terms stay visible.

## Install and verify

Use Node 24 and pnpm 11.25.0. No provider keys are needed for the synthetic/local checks:

```sh
pnpm install --frozen-lockfile
pnpm verify
```

The verification command checks the repository/host manifest, secret patterns, types, lint, domain/provider/component tests, synthetic benchmark, both builds and the built Worker/D1 workflow. It stops on a failed check and records exactly what ran in ignored `outputs/verification.json`, including the source commit, source digest and dirty-tree flag. CI runs the same command and uploads its verification and synthetic benchmark artifacts. These are local execution results, not evidence of live provider access or public deployment.

For local Node development use `pnpm dev:node`. The sample is available without live credentials. Saved organizer events require the server configuration in [SETUP.md](docs/SETUP.md). Do not run production migrations before following the existing-schema guidance in [DEPLOYMENT.md](docs/DEPLOYMENT.md).

A downloaded approval report can be checked with:

```sh
pnpm verify:report /absolute/path/to/mend-report.json
```

The browser and CLI share the checker. It checks stored source response hashes and missing references, not provider signatures or derived scores. Reports with no receipts are labeled as having no source evidence to verify.

## Meaningful Qloo integration

Organizers resolve audience interests and participant references using Qloo search. Fixed-pool Insights results provide query-relative affinities. MEND converts those values into ordinal ranks within each audience/domain context, then combines the disclosed objective with budget, schedule, footprint, capacity, power, category restrictions, availability and locks. Missing live evidence is never replaced with fixture preferences.

Vendor profiles may use explicitly selected and reverified place references. Those are disclosed proxies, not identities or booking offers. Qloo does not establish fees, availability, ingredients or safety. Unknown terms block live approval. Physical clearance is unsupported by the conceptual canvas and nonzero spacing requests are rejected.

The bounded language agent reads event inputs, gathers evidence, generates alternatives, validates and evaluates an option, and prepares it for approval. It cannot approve, book, spend or send messages. It has been tested with mocked providers; live quality remains a gate.

## Architecture and evidence

The primary target is Next.js, React, TypeScript, Tailwind/CSS, Supabase Auth, PostgreSQL and Prisma. The existing Sites compatibility deployment uses Vinext, ChatGPT dispatch identity and D1. Shared domain code does not imply that identities or data were migrated. Both builds are checked; deployed Node/Supabase transactions and authentication remain unverified.

See the [documentation map](docs/README.md), [architecture](docs/ARCHITECTURE.md), [current status](docs/PLAN_STATUS.md) and [dated verification log](docs/VERIFICATION.md). Approvals preserve source receipts and decision inputs. Current baseline comparisons, historical benchmarks, fixture tests and live evidence have different proof boundaries.

## Host requirements remain mandatory

The [host checklist](docs/HOST_REQUIREMENTS.md) preserves working Qloo-integrated agentic behavior, a public external demo, complete public source, a detectable open-source license, written functionality, entrant eligibility and registration, English/free testing access, and finalist availability. All four judging criteria have equal weight. Videos are optional. The deadline is October 30 at 11:45pm EDT, October 31 at 4:45am in Nigeria.

The [submission draft](docs/SUBMISSION.md) must be finalized with actual live evidence and anonymous access checks. A local green build does not close those gates.

MIT licensed. Retained [font notices](docs/FONT_LICENSE.txt) and [Sites build notices](build/sites-vite-plugin.LICENSE) remain applicable. Unused starter UI components and dependencies have been removed; product code, required assets, host records and historical evidence are retained.
