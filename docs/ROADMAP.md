# Remaining engineering work

The governing requirements are the recovered conversation in `product-spec.md`. `PLAN_STATUS.md` maps each milestone to implementation and evidence.

## Next release gates

1. Resolve Vercel team-scope authorization, securely configure the primary environment, configure Supabase Auth callback URLs, and exercise sign-in → create → propose → approve → reload against PostgreSQL using the limited runtime role.
2. Baseline the already-applied schema in Prisma migration history before running future migrations. Verify rollback behavior, append-only writes and concurrent revision conflicts through the real application connection.
3. Run Qloo feasibility across two real markets. Verify identity coverage, response contracts, six cohort/domain receipts and a feasible repair whose decision changes because of cultural evidence. Validate the implemented place-proxy profiles and cultural fingerprints against those results.
4. Configure a live model and inspect bounded tool runs, references, refusal behavior and failure recovery. Do not infer model quality from mocked-provider tests.
5. Complete browser, mobile, keyboard and accessibility QA. Run organizer usability sessions, correct issues and capture a real workflow demonstration.
6. Extend evaluation to live Qloo, rules-only and LLM-only comparisons. Keep synthetic benchmarks separate from cultural relevance and organizer-impact evidence.
7. Make the MIT repository and demo judge-accessible, capture screenshots/video, and confirm the final submission requirements directly.

The 0.3 release includes approval-gated assignment restoration and a local paired-trial instrument. Real participant evidence is still required.

## Product follow-ups

Compound disruptions, event deletion, pagination, stronger idempotency payload matching/retention, distributed rate limiting, richer local preference/accessibility constraints and verified D1-to-Supabase identity migration remain open. Booking, payments, ticketing and outbound messaging remain outside this release.

The shipped editors, spatial planning, conditional terms, rank-v2 objective, agent registry, approval gate and recovery reports are implemented. They do not close the live integration, usability or impact gates above.
