"use client";
import { useState } from "react";
import { Waypoints, ArrowRight, Loader2 } from "lucide-react";
import type { EventDoc, Audit } from "@/lib/model";
export default function AgentPanel({
  doc,
  demo,
  onSaved,
}: {
  doc: EventDoc;
  demo: boolean;
  onSaved: (d: EventDoc, a?: Audit[]) => void;
}) {
  const [text, setText] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const run = doc.agentRuns?.at(-1);
  return (
    <section className="panel config-panel agent-panel">
      <div className="eyebrow">BOUNDED RECOVERY ASSISTANT</div>
      <h3>Tell MEND what changed.</h3>
      <p>
        It can inspect evidence and prepare a proposal. Every applied change
        still needs your approval.
      </p>
      {demo ? (
        <p className="info-note">
          This fictional sample uses the structured disruption controls. The
          live assistant needs a saved organizer event and configured services.{" "}
          <a href="/events/new">Create your own event</a> to use it.
        </p>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (demo) {
              setError(
                "This sample uses the structured scenario controls below. Live language runs need a saved event and configured provider.",
              );
              return;
            }
            setBusy(true);
            setError("");
            try {
              const r = await fetch("/api/agent", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: doc.id,
                    revision: doc.revision,
                    instruction: text,
                  }),
                }),
                d = (await r.json()) as {
                  event: EventDoc;
                  audit: Audit[];
                  error?: string;
                };
              if (!r.ok) throw new Error(d.error);
              onSaved(d.event, d.audit);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="field">
            <span className="sr-only">What changed?</span>
            <textarea
              rows={2}
              required
              minLength={5}
              maxLength={1500}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Our opening act has cancelled. Keep the covered stage and locked vendors unchanged."
            />
          </label>
          <button className="btn small" disabled={busy}>
            {busy ? (
              <Loader2 size={14} className="spin" />
            ) : (
              <Waypoints size={14} />
            )}{" "}
            Investigate <ArrowRight size={14} />
          </button>
        </form>
      )}
      {error && (
        <p className="alert error" role="alert">
          {error}
        </p>
      )}
      {run && (
        <details className="trace" open>
          <summary>
            Run {run.id.slice(0, 8)} · {run.state.replaceAll("_", " ")}
          </summary>
          <p className="fineprint">
            {run.configuration
              ? `${run.configuration.model} · ${run.configuration.providerOrigin} · ${run.configuration.maxSteps} steps / ${run.configuration.maxToolCalls} tool calls maximum${run.configuration.sourceCommit ? ` · source ${run.configuration.sourceCommit.slice(0, 12)}` : ""}`
              : "Model identity was not recorded for this older run."}
          </p>
          {run.steps.map((s, i) => (
            <div key={s.id}>
              <span>{i + 1}</span>
              <section>
                <h4>{s.tool.replaceAll("_", " ")}</h4>
                <small>
                  {s.trigger === "server"
                    ? "Deterministic server check"
                    : s.trigger === "model"
                      ? "Model-requested tool"
                      : "Trigger not recorded for this older run"}
                </small>
                <details>
                  <summary>Inspect structured result</summary>
                  <pre>{JSON.stringify(s.output, null, 2)}</pre>
                </details>
              </section>
            </div>
          ))}
          {run.explanation?.length ? (
            <p className="fineprint">
              Model explanation. Check its statements against the structured
              results above.
            </p>
          ) : null}
          {run.explanation?.map((c, i) => (
            <p key={i}>
              {c.text}{" "}
              {c.evidenceIds.length > 0 && (
                <small>{c.evidenceIds.length} evidence references</small>
              )}
            </p>
          ))}
          {run.error && <p role="alert">{run.error}</p>}
        </details>
      )}
    </section>
  );
}
