# Cultural continuity, rank-v2

For each cohort c and domain d, fix the complete candidate pool and its Qloo query context. For candidate i, let b be the number of lower affinities and t the number of equal affinities in a pool of n entities. Fractional midrank is `(b + (t-1)/2)/(n-1)`. A singleton receives 0.5 because there is no comparative evidence.

Raw affinities from different queries are never averaged. Within each cohort, selected participant midranks are averaged within their domain, then domain means receive equal weight. Cohort weights are organizer supplied and normalized. The lowest cohort value is exposed separately.

Continuity is `1 - mean(abs(reference_context_mean - proposed_context_mean))` over comparable audience/domain contexts. The reference is the approved plan and is updated only on approval. This measures displacement of an ordinal profile, not a probability or an audience outcome. It does not yet measure full tag/relationship retention.

Default objective: 35 relevance, 25 lowest-cohort balance, 25 continuity and 15 assignment stability, normalized by their sum. The objective is versioned and editable. A changed assignment means its participant or zone changed. Fixed candidate context, tie handling and monotone-rescaling invariance are tested. Equal ranking does not mean equal real-world appeal.

Unknown cultural evidence is not inferred. Unsupported live candidates are excluded from grounded ranking. Unknown price/availability facts are disclosed as conditional operational states and block live approval. Synthetic fixtures are isolated by mode labels.

Spatial and candidate search is bounded. The result includes node-limit disclosure. No global-optimality claim is made for a truncated run, and no complete infeasibility claim is made from a truncated empty search.
