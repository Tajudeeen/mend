# API contract

All JSON responses are uncached. The primary target authenticates Supabase sessions; the Sites compatibility target uses verified dispatch identity. Caller-supplied owner fields are ignored.

## Event endpoint

`GET /api/mend` lists owned events and Qloo configuration status. `GET /api/mend?id=<UUID>` returns an owned event and audit; `history=1` includes recent snapshots.

`POST /api/mend` requires JSON and rejects mismatched browser origins. Body limit: 40,000 characters. Event mutations require `id` and current integer `revision`. Optional UUID `requestKey` replays the original persisted result for the owner. Reuse it only for the same intent. Create/search do not need a prior revision.

| Action | Purpose |
| --- | --- |
| create | Blank live event from a validated `brief`; no brief creates an explicitly fictional sample |
| brief, mode, constraints, optimizer | Edit event settings and invalidate pending proposals |
| candidate, addCandidate, removeCandidate | Edit pool and known/unknown booking facts; active participants require repair before removal |
| zone, removeZone, layout | Edit zones and conceptual geometry, respecting locks |
| slot, removeSlot | Edit programme; active slots cannot be directly deleted |
| offerings | Edit organizer-declared inventory and restrictions |
| assignment, lock | Draft manual assignments or protect commitments |
| proposeDraft | Validate the manual draft and request approval |
| search | Search Qloo without auto-selecting a result |
| resolve, clearSeeds | Reverify identity selection or clear cohort interests |
| evidence | Collect a complete fixed-context live receipt |
| propose | Store alternatives for none/cancellation/rain/budget/closure/offering scenario |
| approve, reject | Apply a current stored option after revalidation, or close the request |

Errors use `{error}`. Authentication failure returns 401, missing owned event 404, stale revision 409, cross-origin 403 and oversized body 413. Other invalid input/upstream failures return 400. No failed upstream call creates cultural evidence.

## Additional routes

- `POST /api/agent`: authenticated, bounded natural-language proposal request with event/revision. Stores run/proposal through CAS. No approval tool.
- `/api/culture`: authenticated Qloo tags/discovery adapter, with query and rate limits.
- `/api/health`: runtime/configuration indicators without credentials; configuration is not a live connectivity check.
- `/api/auth`, `/auth/callback`: Supabase sign-in/sign-up/session routes. Production redirect settings and full flow require verification.

## Qloo boundary

Search supports artists and vendor places; discovery also supports brands. Tags use `/v2/tags?filter.query=...`. Insights uses `/v2/insights` with `filter.type`, explicit seed entities, a fixed `filter.results.entities` pool, and explainability. Authentication uses server-only `x-api-key`. Finite scores and complete candidate coverage are required. Timeouts, bounded retries and local concurrency limits apply.

Reference contracts were reviewed on 2026-10-17 and exercised with mocks. No credentialed live Qloo response is claimed. Independent vendor proxy workflows and Analysis Compare are not complete.
