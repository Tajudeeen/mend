# MEND 0.3, production desk

This release changes both the interface and the available planning workflow. It does not claim credentialed Qloo/model quality or completed primary production migration.

## Interface

- Poster-based landing page with the existing M symbol, a bundled condensed display face, paper/ink/rust colors, and a fictional running order. No invented photos, clients, testimonials or impact figures.
- Incident entry links select cancellation, rain, budget or closure in the sample repair desk.
- Production overview uses actual slots, assignments, locations and booking-confirmation gaps.
- Roster becomes a compact participant register. Decorative candidate artwork and the ornamental overview hero are removed.
- Page boundaries retain full document navigation after the earlier hosted navigation failure.
- Responsive tables scroll locally. The mobile navigation has a close control and can scroll independently. Browser/mobile visual verification remains open.

## Session intro and shared footer

A brief M-mark splash runs once per tab, supports explicit dismissal and Escape, releases keyboard focus/content on exit, and bypasses motion for reduced-motion users. A CSS/no-script fallback keeps the app accessible if hydration is unavailable. One shared footer supplies workspace, sample, trial, account and source links across the app.

## Cultural evidence

Independent vendor profiles can reference one to three explicitly selected Qloo places. The organizer supplies a rationale. Every reference is reverified server-side. Saving a profile clears earlier evidence and pending proposals. A direct identity and a proxy profile are mutually exclusive; linking a graph identity no longer renames the organizer's participant.

Collection includes all direct and proxy place IDs in one fixed audience/domain pool. It fails closed on missing references or incomplete scores. Pools over 50 are refused rather than silently split. Receipt provenance includes participant/profile mapping and a pool key. Ordinal aggregation and coverage details are described in `cultural-continuity.md`. This is a tested implementation, with mocked upstream contracts, not verified local-market coverage.

The cultural fingerprint shows coverage by audience/domain, comparative ordinal values, organizer-tag counts gained/lost, and the proxy references used. Missing values stay null. Approved reports include the fingerprint. Organizer tags are explicitly distinct from Qloo graph evidence.

## Assignment restoration

The Versions register inspects recent snapshots. Restoring an earlier revision creates a new assignment proposal. The server loads owned history and validates those assignments against current booking facts, scenario, budget, locks and constraints. It does not restore old prices, evidence, operational facts or audit state. Applying the proposal still requires explicit approval and creates a new report/revision.

## Organizer trial instrument

`/study` records a paired manual/MEND-assisted cancellation task with the same synthetic fixture and all unaffected slots locked. The participant chooses trial order. A browser event timestamp starts/stops each trial, and failed submissions remain in the record. Downloaded JSON includes raw durations, attempts, order, assignments, fixture version and limitations.

Results stay in browser memory until downloaded. There are no prefilled benefits, automatic external submissions or persisted participant identifiers. One self-run synthetic trial is not independent organizer-impact evidence. Follow `ORGANIZER_STUDY.md` before making a measured benefit claim.

## Account and connection setup

The Node target now renews Supabase session cookies through a Next.js proxy, supports current-browser signout, explicit signup confirmation handling, and PKCE/email-token callbacks. Auth responses use private cache headers. The compatibility target retains ChatGPT identity.

Account settings can run authenticated, bounded live Qloo/model probes. Results distinguish configuration from successful search/tool-call responses. Provider credentials are server-only, redirects are refused and raw provider errors are excluded from diagnostics and saved failed runs. `SETUP.md` documents credential access, team authorization and deployment verification. Live keys and primary deployment access remain required.

## Remaining release gates

Live Qloo coverage and profile validation across two markets, a credentialed language-agent run, real organizer evaluation, browser/accessibility review, Supabase application transactions/session verification, Prisma migration baselining, Vercel scope authorization and judge access remain open. Compound incidents, event deletion, pagination and stronger idempotency matching remain follow-ups.
