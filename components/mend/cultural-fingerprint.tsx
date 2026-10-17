"use client";
import { useState } from "react";
import type { EventDoc } from "@/lib/model";
import { fingerprint } from "@/lib/fingerprint";
export default function CulturalFingerprint({ doc }: { doc: EventDoc }) {
  const [optionId, setOptionId] = useState("active");
  const option =
    doc.proposal?.status === "pending"
      ? doc.proposal.options.find((o) => o.id === optionId)
      : undefined;
  const f = fingerprint(doc, option?.assignments ?? doc.plan);
  const number = (n: number | null) =>
    n === null ? "Missing" : (n * 100).toFixed(0);
  return (
    <section className="panel fingerprint-panel">
      <div className="config-heading">
        <div>
          <span className="eyebrow">
            CULTURAL FINGERPRINT /{" "}
            {f.mode === "demo" ? "SYNTHETIC" : "QUERY-RELATIVE"}
          </span>
          <h3>What the mix keeps. What it loses.</h3>
        </div>
        <label className="field">
          <span className="sr-only">Fingerprint plan</span>
          <select
            value={option ? optionId : "active"}
            onChange={(e) => setOptionId(e.target.value)}
          >
            <option value="active">Active plan</option>
            {doc.proposal?.status === "pending" &&
              doc.proposal.options.map((o, i) => (
                <option value={o.id} key={o.id}>
                  Repair option {i + 1}
                </option>
              ))}
          </select>
        </label>
      </div>
      <p className="fingerprint-coverage">
        {f.covered}
        <span> / {f.total} participant × audience contexts covered</span>
      </p>
      <div className="desk-table-scroll">
        <table className="fingerprint-table">
          <caption className="sr-only">
            Ordinal cultural coverage compared with the approved reference plan
          </caption>
          <thead>
            <tr>
              <th>Audience / domain</th>
              <th>Coverage</th>
              <th>Reference</th>
              <th>This plan</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {f.contexts.map((c) => (
              <tr key={c.cohort + c.domain}>
                <td>
                  {c.cohort}
                  <small>
                    {c.domain === "artist" ? "Music" : "Vendor references"}
                  </small>
                </td>
                <td>
                  {c.covered}/{c.total}
                </td>
                <td>{number(c.referenceIndex)}</td>
                <td>{number(c.index)}</td>
                <td>
                  {c.drift === null
                    ? "Unknown"
                    : `${c.drift > 0 ? "+" : ""}${Math.round(c.drift * 100)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="fingerprint-tags">
        <h4>Organizer-tag coverage</h4>
        <p>
          Counts of assigned participants carrying each declared tag. These
          labels are supplied by the organizer.
        </p>
        <div>
          {f.tags.length ? (
            f.tags.map((t) => (
              <span
                className={t.delta < 0 ? "lost" : t.delta > 0 ? "gained" : ""}
                key={t.name}
              >
                {t.name}
                <b>
                  {t.before} → {t.after}
                </b>
              </span>
            ))
          ) : (
            <span>No participant tags supplied.</span>
          )}
        </div>
      </div>
      {f.proxies.length > 0 && (
        <details className="config-details">
          <summary>
            {f.proxies.length} independent vendor proxy profiles used
          </summary>
          {f.proxies.map((p) => (
            <div key={p.name}>
              <h4>{p.name}</h4>
              <p>{p.rationale}</p>
              <small>
                References: {p.references.join(", ")}. No direct identity or
                booking claim.
              </small>
            </div>
          ))}
        </details>
      )}
      <p className="fineprint">
        Reference means the last approved plan, or the current plan before first
        approval. Ordinal indices are MEND planning heuristics. Missing contexts
        stay missing. A proxy describes selected places, not Qloo’s direct
        knowledge of the independent vendor.
      </p>
    </section>
  );
}
