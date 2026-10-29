# MEND submission draft

This is an engineering draft, not a submitted entry. Use the exact verified scope below and complete the open gates in `HOST_REQUIREMENTS.md` before claiming a completed real-event recovery.

## Product description

When a performer or vendor drops out of a music-led market, the organizer has to replace more than an empty slot. The replacement must fit the audience, the programme and the practical limits of the event.

MEND combines cultural evidence with operational planning. Organizers define audience interests, participants, budget, schedule and available space. A bounded assistant can investigate a disruption and propose alternatives. Deterministic checks enforce constraints, and the organizer approves the final change. Recovery reports preserve the original plan, the chosen repair, the checks and the source evidence.

Qloo provides entity resolution, cultural discovery and fixed-pool audience affinities. MEND converts those query-relative values into disclosed ordinal ranks. It does not treat them as attendance probabilities, booking offers or verified availability. Independent vendors can use explicitly selected place references, which remain labeled as proxies.

## Reviewer path

- Application: https://usemend.vercel.app
- Walkthrough: https://usemend.vercel.app/review
- Sample: https://usemend.vercel.app/demo
- Source: https://github.com/Tajudeeen/mend
- License: MIT, with retained third-party notices.
- Setup and limitations: README and `docs/SETUP.md`.

Vercel replaces the former ChatGPT Site as the submission destination. Anonymous access to `usemend.vercel.app/demo` was observed on October 28, including sample proposal generation and fictional approval. The old `mend-deeencodes.vercel.app` alias remains gated. Full live Qloo repair and judge access through the complete judging period still need verification.

Open the sample, withdraw the opening act, inspect alternatives, approve and inspect the Recovery reports. The sample is fictional, browser-local and uses synthetic preferences. Live events require configured server services and authenticated persistence.

## Verified integration scope, October 29

The signed-in controlled verification event reached a live Qloo-backed conditional artist proposal and human-review preparation with Groq Qwen. Three audience-specific source batches passed stored-body, derived-affinity and context checks after PostgreSQL reload. Four model-requested operations and three deterministic server checks were distinguished in the trace. Approval stayed disabled for unknown fees and availability. The event inputs were explicitly illustrative, not actual bookings. The [verification log](VERIFICATION.md) preserves both preceding failed runs and this observed result. The [release audit](RELEASE_AUDIT.md) records phone-width and failure-path checks and their limits.

## Evidence still needed

Live Qloo and conditional model-run references are in the verification log. Add an approved real-event report and reload evidence only after confirmed facts and explicit human approval. Record organizer feedback only when collected. Current synthetic tests demonstrate software behavior, not real-world benefit. Do not describe mocked responses as live Qloo evidence.
