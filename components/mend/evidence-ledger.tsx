"use client";
import { useState } from "react";
import type { Audit, EventDoc } from "@/lib/model";
import { inspectEventEvidence } from "@/lib/event-evidence";
import { eventReadiness } from "@/lib/readiness";
import Link from "./page-link";

export default function EvidenceLedger({
  doc,
  audit,
  demo,
  readbackAt,
  reload,
  busy,
}: {
  doc: EventDoc;
  audit: Audit[];
  demo: boolean;
  readbackAt?: string;
  reload: () => void;
  busy: boolean;
}) {
  const [check, setCheck] = useState<Awaited<
    ReturnType<typeof inspectEventEvidence>
  > | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const coverage = eventReadiness(doc).checks.find(
    (c) => c.id === "evidence",
  )?.done;
  const proposal = doc.proposal;
  const linked =
    !!proposal?.evidenceIds.length &&
    proposal.evidenceIds.every((id) => doc.evidence.some((e) => e.id === id));
  const runs = doc.agentRuns ?? [];
  const reports = doc.reports ?? [];
  return (
    <section
      className="panel evidence-ledger"
      aria-label="Event evidence ledger"
    >
      <div className="eyebrow">THIS EVENT / REVISION {doc.revision}</div>
      <h3>
        {demo
          ? "Sample activity is not live evidence."
          : "Follow the evidence for this event."}
      </h3>
      <p>
        {demo
          ? "This session is temporary. Its participants, cultural scores and decisions are fictional. No Qloo request or server persistence is established by these interactions."
          : doc.mode === "demo"
            ? "This saved event uses synthetic cultural scores. Saving it does not make its cultural evidence live."
            : "Live mode enables real requests. Each stage below needs its own event record; a configured key or connection probe does not complete this workflow."}
      </p>
      <dl className="evidence-stages">
        <div>
          <dt>Storage</dt>
          <dd>
            {demo
              ? "Temporary browser session"
              : readbackAt
                ? `Server read confirmed at ${new Date(readbackAt).toLocaleString()} · revision ${doc.revision}`
                : "Save response received; reload to confirm stored revision"}
          </dd>
        </div>
        <div>
          <dt>Qloo source receipts</dt>
          <dd>
            {doc.evidence.length} stored batches ·{" "}
            {coverage
              ? "current roster coverage complete"
              : "current live coverage incomplete"}
          </dd>
        </div>
        <div>
          <dt>Model workflow</dt>
          <dd>
            {runs.length
              ? `${runs.length} stored runs · latest: ${runs.at(-1)!.state.replaceAll("_", " ")}`
              : "No model run recorded for this event"}
            {runs.at(-1)?.configuration && (
              <small> · {runs.at(-1)!.configuration!.model}</small>
            )}
          </dd>
        </div>
        <div>
          <dt>Planner proposal</dt>
          <dd>
            {proposal
              ? `${proposal.mode === "demo" ? "Synthetic" : "Live"} proposal · ${proposal.status} · ${linked ? "source references present" : "no complete source references"}${proposal.truncated ? " · search limit reached" : ""}`
              : "No proposal recorded"}
          </dd>
        </div>
        <div>
          <dt>Approval and reports</dt>
          <dd>
            {reports.length
              ? `${reports.filter((r) => r.mode === "live").length} live / ${reports.filter((r) => r.mode === "demo").length} synthetic / ${reports.filter((r) => !r.mode).length} legacy reports`
              : "No approved report recorded"}{" "}
            · {audit.length} {demo ? "sample" : "application audit"} entries
          </dd>
        </div>
      </dl>
      <div className="evidence-actions">
        {demo ? (
          <Link className="btn small" href="/events">
            Open your saved events
          </Link>
        ) : (
          <button className="btn quiet small" disabled={busy} onClick={reload}>
            Reload saved evidence
          </button>
        )}
        <button
          className="btn quiet small"
          disabled={checking || !doc.evidence.length}
          onClick={async () => {
            setChecking(true);
            setError("");
            try {
              setCheck(await inspectEventEvidence(doc));
            } catch {
              setError(
                "Could not inspect this snapshot. Reload and try again.",
              );
            } finally {
              setChecking(false);
            }
          }}
        >
          {checking ? "Checking receipts…" : "Check receipt integrity"}
        </button>
        <Link href="/verify">Inspect an exported report</Link>
      </div>
      {error && <p role="alert">{error}</p>}
      {check && check.eventId === doc.id && check.revision === doc.revision && (
        <div role="status" className="receipt-check-result">
          <p>
            {check.consistent
              ? "Stored source bodies and affinity values are consistent."
              : "Receipt checks failed. Inspect the flagged sources before relying on this snapshot."}
          </p>
          {check.duplicateIds && <p>Duplicate receipt IDs found.</p>}
          <ul>
            {check.receipts.map((r, i) => (
              <li key={`${r.id}-${i}`}>
                {r.id} · hash {r.hashMatches ? "matches" : "FAILED"} ·
                affinities {r.affinitiesMatch ? "match body" : "FAILED"} ·{" "}
                {r.currentContext
                  ? "current context"
                  : "old or incomplete context"}{" "}
                · {r.origin ?? "origin not recorded in this legacy receipt"}
              </li>
            ))}
          </ul>
          <small>Checked {new Date(check.checkedAt).toLocaleString()}</small>
          <p className="fineprint">{check.limitation}</p>
        </div>
      )}
      {!doc.evidence.length && (
        <p className="info-note">
          No Qloo receipt has been collected for this event.{" "}
          {demo
            ? "Open a saved live event to resolve interests and collect evidence."
            : "Resolve audience interests and participant references, then collect each required batch below."}
        </p>
      )}
    </section>
  );
}
