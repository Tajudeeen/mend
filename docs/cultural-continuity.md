# Cultural continuity, rank-v2

For each cohort c and domain d, fix the complete candidate pool and its Qloo query context. For candidate i, let b be the number of lower affinities and t the number of equal affinities in a pool of n entities. Fractional midrank is `(b + (t-1)/2)/(n-1)`. A singleton receives 0.5 because there is no comparative evidence.

Raw affinities from different queries are never averaged. Within each cohort, selected participant midranks are averaged within their domain, then domain means receive equal weight. Cohort weights are organizer supplied and normalized. The lowest cohort value is exposed separately.

Continuity is `1 - mean(abs(reference_context_mean - proposed_context_mean))` over comparable audience/domain contexts. The reference is the approved plan and is updated only on approval. This measures displacement of an ordinal profile, not a probability or an audience outcome. A separate fingerprint reports organizer-tag counts and losses; this is not inferred graph-relationship retention. Before the first approval the current plan is the reference.

Default objective: 35 relevance, 25 lowest-cohort balance, 25 continuity and 15 assignment stability, normalized by their sum. The objective is versioned and editable. A changed assignment means its participant or zone changed. Fixed candidate context, tie handling and monotone-rescaling invariance are tested. Equal ranking does not mean equal real-world appeal.

Unknown cultural evidence is not inferred. Unsupported live candidates are excluded from grounded ranking. Unknown price/availability facts are disclosed as conditional operational states and block live approval. Synthetic fixtures are isolated by mode labels.

Spatial and candidate search is bounded. The result includes node-limit disclosure. No global-optimality claim is made for a truncated run, and no complete infeasibility claim is made from a truncated empty search.


## Independent vendor references, proxy-v1

A vendor without a direct place identity may use one to three explicitly selected place references and an organizer rationale. Brands are not mixed into the place query. All direct place IDs and proxy place IDs share one fixed query for each cohort. The pool is deduplicated and bounded to 50 entities, matching the documented Insights `take` maximum. A larger pool is refused, not split into incomparable contexts. The current official contract reference is https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md, reviewed 2026-10-17.

First convert entity affinities to midranks within that entity pool. A proxy profile takes the equal-weight mean of its reference midranks. Then compute participant-profile midranks within the candidate pool. Direct-only pools retain their original rank ordering. Every vendor contributes once regardless of the number of references. This extension has a separate `proxy-v1` profile version. It is a disclosed planning heuristic, not direct Qloo knowledge of the independent vendor.

Receipts retain the mapping, rationale and fixed pool key. Changing the pool invalidates its ranks. Missing reference affinities fail collection; missing contexts remain null in the fingerprint. UI and exported reports disclose where proxies are used.
