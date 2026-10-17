"use client";
import type { EventDoc } from "@/lib/model";
import { Download, ArrowRight } from "lucide-react";
export default function Reports({ doc }: { doc: EventDoc }) {
  return (
    <>
      <section className="page-heading subpage">
        <div>
          <div className="eyebrow">THE THREAD BETWEEN PLANS</div>
          <h1>A decision you can explain.</h1>
          <p>
            Approved recovery reports keep the original assignment, the change,
            the checks and the evidence together.
          </p>
        </div>
      </section>
      {!doc.reports?.length ? (
        <section className="panel config-panel">
          <h3>No approved recovery yet.</h3>
          <p>Approve a repair in the studio to produce a persistent report.</p>
        </section>
      ) : (
        [...doc.reports].reverse().map((r) => (
          <article className="panel report-card" key={r.id}>
            <span className="eyebrow">
              APPROVED / {new Date(r.at).toLocaleString()}
            </span>
            <h3>{r.summary}</h3>
            <div className="report-changes">
              {r.changes.map((c, i) => (
                <div key={i}>
                  <span>
                    {c.slot}
                    <small>{c.from}</small>
                  </span>
                  <ArrowRight size={17} />
                  <span>
                    {c.to}
                    <small>{c.location}</small>
                  </span>
                </div>
              ))}
            </div>
            <div className="report-checks">
              {r.checks.map((c) => (
                <span className="tiny-pill" key={c}>
                  {c} checked
                </span>
              ))}
            </div>
            {r.unknowns.length > 0 && (
              <div className="info-note">
                Unconfirmed information: {r.unknowns.join(". ")}
              </div>
            )}
            <p className="fineprint">
              {r.limitations.join(" ")} {r.evidenceIds.length} evidence
              references.
            </p>
            {r.fingerprint && (
              <div className="info-note">
                Cultural coverage: {r.fingerprint.covered}/{r.fingerprint.total}{" "}
                participant × audience contexts. {r.fingerprint.proxies.length}{" "}
                proxy profiles.{" "}
                {r.fingerprint.tags.filter((t) => t.delta < 0).length} organizer
                tags reduced.
              </div>
            )}
            <details className="trace">
              <summary>Source evidence and assignments</summary>
              <pre>
                {JSON.stringify(
                  {
                    fingerprint: r.fingerprint,
                    before: r.before,
                    after: r.after,
                    evidence: doc.evidence.filter((e) =>
                      r.evidenceIds.includes(e.id),
                    ),
                  },
                  null,
                  2,
                )}
              </pre>
            </details>
            <button
              className="btn quiet"
              onClick={() => {
                const a = document.createElement("a"),
                  u = URL.createObjectURL(
                    new Blob([JSON.stringify(r, null, 2)], {
                      type: "application/json",
                    }),
                  );
                a.href = u;
                a.download = "mend-report-" + r.id + ".json";
                a.click();
                URL.revokeObjectURL(u);
              }}
            >
              <Download size={14} /> Download report
            </button>
          </article>
        ))
      )}
    </>
  );
}
