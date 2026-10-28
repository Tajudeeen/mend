"use client";
import { useState } from "react";
import { compareRepairs } from "@/lib/comparison";
import type { EventDoc, Scenario } from "@/lib/model";

export default function RepairComparison({
  doc,
  scenario,
}: {
  doc: EventDoc;
  scenario: Scenario;
}) {
  const [comparison, setComparison] = useState<ReturnType<
    typeof compareRepairs
  > | null>(null);
  const [error, setError] = useState("");
  const current =
    comparison?.revision === doc.revision &&
    JSON.stringify(comparison.scenario) === JSON.stringify(scenario)
      ? comparison
      : null;
  return (
    <section className="panel config-panel">
      <div className="eyebrow">CHALLENGE THE CULTURAL CHOICE</div>
      <h3>What changes without cultural ranking?</h3>
      <p>
        Compare the current disruption with a rules-only baseline. Both keep the
        same practical constraints. This comparison never applies a repair.
      </p>
      <button
        className="btn quiet small"
        onClick={() => {
          setError("");
          setComparison(null);
          try {
            setComparison(compareRepairs(doc, scenario));
          } catch (failure) {
            setError(
              failure instanceof Error
                ? failure.message
                : "Comparison unavailable.",
            );
          }
        }}
      >
        Compare repair strategies
      </button>
      {error && (
        <p role="alert" className="alert error">
          {error}
        </p>
      )}
      {current && (
        <div className="info-note" role="status">
          <p>
            {current.mode === "demo"
              ? "Synthetic preference comparison. No live Qloo result is claimed."
              : "Uses this event’s stored Qloo evidence. Inspect the linked receipts before attributing the result to live services."}
          </p>
          <p>
            {!current.cultural.assignments || !current.rulesOnly.assignments
              ? "At least one strategy found no complete option within its search bound."
              : current.assignmentChanged
                ? "The best returned assignments differ."
                : "Both strategies returned the same assignments."}
          </p>
          <div className="comparison-table">
            <table>
              <caption>Best returned options, not global optima</caption>
              <thead>
                <tr>
                  <th scope="col">Strategy</th>
                  <th scope="col">Assignments</th>
                  <th scope="col">Known fees</th>
                  <th scope="col">Search bound reached</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Cultural ranking", value: current.cultural },
                  { label: "Rules only", value: current.rulesOnly },
                ].map(({ label, value }) => {
                  return (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      <td>
                        {value.assignments
                          ?.map(
                            (a) =>
                              `${doc.slots.find((s) => s.id === a.slotId)?.name}: ${doc.candidates.find((c) => c.id === a.candidateId)?.name}`,
                          )
                          .join("; ") ?? "No option"}
                      </td>
                      <td>
                        {value.cost === null ? "Unknown" : `$${value.cost}`}
                      </td>
                      <td>{value.truncated ? "Yes" : "No"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="fineprint">
            {current.limitation} Known fees exclude any unconfirmed amounts. The
            export contains event inputs, so share it only with the intended
            reviewer.
          </p>
          <button
            className="btn quiet small"
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob([JSON.stringify(current, null, 2)], {
                  type: "application/json",
                }),
              );
              const link = document.createElement("a");
              link.href = url;
              link.download = "mend-comparison.json";
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download comparison and inputs
          </button>
        </div>
      )}
    </section>
  );
}
