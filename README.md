# MEND

Keep the feeling. Repair the plan.

MEND helps organizers of music-led markets and cultural pop-ups repair a programme when a performer withdraws, a vendor exits, a space closes or an offering becomes unavailable. It separates cultural evidence, operational constraints, uncertainty and human approval.

Working deployment: https://mend-events.deeen-code.chatgpt.site

Sample workflow: https://mend-events.deeen-code.chatgpt.site/demo

Source: https://github.com/Tajudeeen/mend

## What is implemented

- Landing page, registration-free sample workflow, event list and blank event setup.
- Editable participant pool, known/unknown fees and availability, confirmation flags and menu inventory.
- Configurable zones, dimensions, categories, power, programme slots and assignment drafts.
- Conceptual floorplan with pointer/keyboard positioning, pan, zoom, locked zones and undo before save.
- Performer/vendor withdrawal, rain, individual space closure, budget changes and declared offering substitution.
- Versioned ordinal ranking and cultural continuity metrics with adjustable weights and bounded search.
- Locked commitments, infeasibility/search-limit disclosure and conditional proposals for unknown terms.
- Explicit approval, stale-proposal rejection, historical snapshots, approval-gated assignment restoration, before/after reports and exports.
- Independent vendor proxy profiles and cultural/organizer-tag coverage fingerprints.
- A local paired manual/MEND trial instrument at `/study`, with raw timing and failed-attempt exports.
- Qloo search, tags, discovery, fixed-pool Insights, response receipts and explainability adapters.
- Provider-configurable language agent with typed tools, execution limits and source-checked cultural statements.
- Ownership checks, request limits, timeouts, bounded retries, transactional persistence and database RLS.

The public sample uses fictional participants and synthetic preference values. No live Qloo results, verified booking offers, organizer study or attendance/revenue benefit are claimed. The language agent has been exercised against mocked provider responses; a live model credential is still required.

## Architecture

The production target follows the master plan: Next.js App Router and Node.js, React, TypeScript, Tailwind/CSS, Supabase Auth, Supabase PostgreSQL and Prisma 7. The database schema and ownership policies have been applied to the dedicated MEND Supabase project.

The existing working URL is a **Sites compatibility deployment**, using Vinext rendering, ChatGPT identity and D1. It shares the UI, domain rules and agent/Qloo adapters with the Node target. These runtimes are explicitly distinguished by `/api/health` and the settings view. Existing D1 data has not been silently migrated to PostgreSQL.

A Vercel MEND project was created, but its environment configuration returned a team-scope authorization error. The Next.js build succeeds locally. The Supabase/Prisma application connection, authenticated production flow and Vercel publication remain unverified until that access is resolved. Schema security-advisor checks and a cross-owner RLS test were run through Supabase.

## Run and verify

Use Node 24 and pnpm 11.25.0. Install from the committed lockfile:

```sh
pnpm install --frozen-lockfile
pnpm db:generate:postgres
pnpm typecheck
pnpm lint
pnpm test
pnpm test:ui
pnpm benchmark
pnpm build:node
```

For the primary Next.js target, set the variables documented in `.env.example`, apply pending Prisma migrations with an authorized migration role, then use `pnpm dev:node` or `pnpm start:node`. Do not run production migrations with the limited application role. A public sample remains usable without database or model credentials.

For the Sites compatibility target, its supported installer/build/source workflow applies. `pnpm build` generates the Prisma client and builds the compatibility artifact. `node tests/worker-smoke.mjs` tests the built Worker and D1 route flow.

## Cultural reasoning

Raw Qloo affinities are never averaged across independent query contexts. MEND converts each fixed audience/domain pool into fractional midranks, then aggregates those ordinal values with disclosed weights. Continuity measures displacement from the approved reference rank vector. These are MEND planning heuristics, not official Qloo scores or calibrated outcomes. Missing evidence remains missing. A bounded search reports truncation and does not imply optimality or a proof of infeasibility when truncated.

Qloo entity resolution does not verify that a performer is available or that a restaurant will vend at the event. Unknown fees/terms make an option conditional. Live approval requires confirmation. Independent vendors can use one to three explicit, reverified place references with an organizer rationale. Proxy use is labeled in fingerprints and reports. Live proxy quality and broader market feasibility remain unverified.

The 0.3 interface uses a poster landing, an actual running-order production desk and a compact participant register. See `docs/RELEASE_0.3.md`. The bundled display font is a renamed condensed derivative of DejaVu Sans Bold; notices are retained in `docs/FONT_LICENSE.txt`.

## Judge walkthrough

1. Open `/demo`, which needs no account.
2. Review the lineup and conceptual site.
3. Open Repair studio and withdraw a performer or vendor, close one zone, or try rain/budget/offering loss.
4. Compare the options, constraints, rank indices and disclosed unknowns.
5. Approve a sample repair, then open Recovery reports to inspect the before/after record.
6. For organizer data, use a saved authenticated event. Credentials must be configured before live cultural or language runs.

The sample session is temporary browser state. Saved organizer events and approved reports use server persistence. MEND does not book, send outbound messages, take payments or certify venue/food safety.

## Evidence and remaining gates

See `docs/VERIFICATION.md`, `docs/PLAN_STATUS.md`, `docs/ARCHITECTURE.md`, `docs/cultural-continuity.md`, `docs/evaluation/` and the original `docs/product-spec.md`.

Before submission: validate Qloo coverage across two markets, run credentialed cultural/model workflows, complete browser/mobile/accessibility QA, publish the repository, resolve the Vercel scope, verify Supabase authentication and app-level transactions, and collect real organizer feedback. The synthetic benchmark is software verification, not proof of Qloo's impact.

MIT licensed. Retained third-party notices remain applicable.
