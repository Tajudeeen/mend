# Inspect a real event, not a sample

The public `/demo` route is an isolated temporary sample. Its scores and interactions are synthetic. The landing page explicitly labels its evidence link as sample evidence. A saved event that fails to load shows a loading/error/retry screen; it never renders the sample as a fallback.

## Follow one live event

1. Open Account & connections, sign in and run the Qloo/model checks. Show available models reads the configured provider's authenticated catalogue without returning the key. Listing does not establish tool support or quota. A passed probe establishes only the specific search or tool call described in its result.
2. Create an event in My events. Add actual participants, programme slots, zones and organizer-confirmed costs/availability. Resolve audience interests, participant identities and explicit vendor reference profiles. Creating a blank event supplies no Qloo receipts.
3. Open Evidence & decisions. Enable Live Qloo on a saved event and collect each audience/domain batch. The server calls the assigned Qloo origin, validates a complete comparable response and stores its body, hash, query parameters, origin and timestamp. Older receipts may lack an origin; they remain labelled as legacy records.
4. Select Check receipt integrity. It recomputes response hashes, compares stored affinity values to the raw body and checks the audience/roster context. Changed bodies, changed derived values and duplicate IDs cannot produce a consistent result. Current context and complete coverage are separate from source integrity. Hashes and matching values cannot authenticate the provider as issuer.
5. Run a bounded model investigation or the structured repair controls. These are distinct paths. New model runs record the provider origin, exact model ID, available deployed source revision and execution bounds; older runs remain explicitly unknown. The event ledger reports whether a model run actually exists, the proposal's mode/status/source references, truncation and approval report counts. A structured proposal is not relabelled as a model run.
6. Review and explicitly approve a current option. Unknown live terms block approval. Open Recovery reports and download the approval-time report. Its immutable snapshot keeps the original sources when the event later changes. Use `/verify` or `pnpm verify:report FILE` for stored report response integrity; use the comparison export/reproduction command to replay planner choices.
7. Select Reload saved evidence. A successful authenticated GET reads the event and audit trail back from the server. The ledger displays that revision and read time; later mutations invalidate the displayed revision's readback confirmation. This confirms the returned record, not every possible persistence failure or cross-account isolation.
8. Export evidence. The bundle includes event/revision, application audit, available history, a temporary-versus-authenticated session label, readback time and freshly computed receipt checks. If history cannot be retrieved, `historyStatus` remains `unavailable`; the export does not silently describe it as complete. Review organizer information before sharing.

## Product boundaries

New Qloo receipts use `sha256-canonical-json-v2`: MEND sorts object keys recursively before JSON serialization and SHA-256 hashing, while preserving array order and values. This survives PostgreSQL JSONB key reordering. Receipts with no version keep their original `sha256-json-v1` semantics. A mismatching legacy hash stays failed; recollect a new batch instead of rewriting history or relabelling it as verified. This is stored semantic JSON integrity, not a signature or a hash of original HTTP bytes.

After a deployment, refresh an already-open page before inspecting a newly versioned receipt. The deployed v2 checker was verified against a newly collected source after PostgreSQL save/readback; see the dated [verification log](VERIFICATION.md) for its precise scope.

Sample interaction logs are labelled as sample activity. Saved synthetic events remain synthetic. A configured key is not evidence of a successful request. Model run records describe stored application execution, not an independent attestation of model authorship. Qloo ranks do not prove booking availability, attendance, revenue or organizer impact. No global "verified build" badge replaces these individual checks.

Workspace navigation updates the URL, marks the active section, moves focus to the content and scrolls to the top. Reduced-motion preferences use immediate scrolling. The mobile menu closes on selection, backdrop click or Escape. Full page links retain document navigation across the hosting/auth boundary. Operational states reuse the existing paper, ink, green, lime and rust palette.

Regression tests cover failed live loads, no synthetic substitution, server readback, empty live evidence, disabled sample live controls, source/derived-value tampering, stale context, duplicate receipts, keyboard focus and reduced-motion scrolling. `pnpm verify` additionally runs both runtime builds and the local Worker/D1 workflow. Local tests do not establish a complete production Supabase/Qloo/model recovery; record that separately with actual event evidence and the deployed source revision.

### Organizer identity and storage isolation

Select the organizer area at the bottom of the sidebar, or the header initials, to open **Account & connections**. The organizer name and optional organization are editable display details; the account email is read-only. These details do not establish organization identity or booking facts and never affect event ownership.

Signed-in users on the PostgreSQL deployment can select **Check storage isolation**. The check creates random isolated test records inside a transaction, exercises owner writes and cross-owner denial, rolls the transaction back, and confirms absence with a second database read. The dated result lists the precise checks and their limits. It does not change permissions or inspect your event contents. The Worker/D1 target uses its separate automated workflow checks. This check is additional database evidence, not proof of a complete Qloo/model recovery or a review of every RLS policy.
