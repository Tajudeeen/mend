"use client";
import type { EventDoc } from "@/lib/model";
import { eventReadiness } from "@/lib/readiness";
import Link from "./page-link";

export default function ReadinessPanel({
  doc,
  navigate,
}: {
  doc: EventDoc;
  navigate: (view: string) => void;
}) {
  if (doc.mode !== "live") return null;
  const readiness = eventReadiness(doc);
  return (
    <section className="panel config-panel" aria-label="Live event preparation">
      <div className="eyebrow">BEFORE THE NEXT CHANGE</div>
      <h3>Prepare a live repair.</h3>
      <p>
        {readiness.completed} of {readiness.total} event checks complete.
        Connection checks and a successful live repair are separate.
      </p>
      <ul className="readiness-list">
        {readiness.checks.map((check) => (
          <li key={check.id}>
            <span>{check.done ? "Complete" : "Needed"}</span>
            <button
              className="btn quiet small"
              onClick={() => navigate(check.view)}
            >
              {check.label}
            </button>
          </li>
        ))}
      </ul>
      <p className="fineprint">
        Confirm terms from actual organizer information. Qloo identity and
        audience fit don’t establish booking availability.
      </p>
      <Link href="/settings">Check Qloo and model connections</Link>
    </section>
  );
}
