"use client";
import { useState } from "react";
import { ArrowUpRight, History } from "lucide-react";
import type { EventDoc } from "@/lib/model";
export default function RevisionHistory({
  doc,
  demo,
  snapshots,
  disabled,
  action,
  onReview,
}: {
  doc: EventDoc;
  demo: boolean;
  snapshots: EventDoc[];
  disabled: boolean;
  action: (a: string, b?: Record<string, unknown>) => Promise<unknown>;
  onReview: () => void;
}) {
  const [revisions, setRevisions] = useState<EventDoc[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const rows = demo ? (snapshots.length ? snapshots : [doc]) : revisions;
  return (
    <>
      <section className="page-heading subpage">
        <div>
          <span className="eyebrow">
            VERSION REGISTER / APPEND-ONLY HISTORY
          </span>
          <h1>A new decision. An intact record.</h1>
          <p>
            Inspect previous assignments. Bring an earlier plan back as a
            proposal, checked against today’s facts and locks.
          </p>
        </div>
        <button
          className="btn"
          disabled={loading || disabled}
          onClick={async () => {
            if (demo) return;
            setLoading(true);
            setError("");
            try {
              const r = await fetch(`/api/mend?id=${doc.id}&history=1`);
              const data = (await r.json()) as {
                error?: string;
                revisions: EventDoc[];
              };
              if (!r.ok) throw new Error(data.error);
              setRevisions(data.revisions);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <History size={16} />
          {loading ? "Loading" : "Load saved revisions"}
        </button>
      </section>
      {error && (
        <p className="alert error" role="alert">
          {error}
        </p>
      )}
      <section className="panel revision-register">
        {!rows.length ? (
          <p>
            Load the latest 100 saved revisions. Older records remain stored.
          </p>
        ) : (
          [...rows]
            .sort((a, b) => b.revision - a.revision)
            .map((r) => (
              <details key={r.revision}>
                <summary>
                  <span className="revision-number">
                    R{String(r.revision).padStart(2, "0")}
                  </span>
                  <span>
                    {r.proposal?.status ?? "Event draft"}
                    <small>
                      {r.plan.length} assignments / {r.evidence.length} evidence
                      batches
                    </small>
                  </span>
                  <span>
                    {r.revision === doc.revision ? "CURRENT" : "Inspect"}
                  </span>
                </summary>
                <div className="revision-details">
                  {r.plan.map((a) => (
                    <div key={a.slotId}>
                      <span>
                        {r.slots.find((s) => s.id === a.slotId)?.name ??
                          a.slotId}
                      </span>
                      <strong>
                        {r.candidates.find((c) => c.id === a.candidateId)
                          ?.name ?? a.candidateId}
                      </strong>
                      <small>
                        {r.zones.find((z) => z.id === a.zoneId)?.name ??
                          a.zoneId}
                      </small>
                    </div>
                  ))}
                  {r.revision < doc.revision && (
                    <button
                      className="btn quiet"
                      disabled={disabled}
                      onClick={async () => {
                        const result = await action("restoreRevision", {
                          targetRevision: r.revision,
                        });
                        if (result) onReview();
                      }}
                    >
                      Review restoration of R{r.revision}
                      <ArrowUpRight size={15} />
                    </button>
                  )}
                </div>
              </details>
            ))
        )}
      </section>
      <p className="fineprint">
        Restoration copies assignments into a new approval request. It doesn’t
        roll back booking facts, restrictions, evidence or audit history. A past
        plan can be infeasible under current conditions.
      </p>
    </>
  );
}
