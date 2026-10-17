"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Download, Play } from "lucide-react";
import Link from "@/components/mend/page-link";
import MendMark from "@/components/mend/mark";
import { sampleEvent } from "@/lib/seed";
import { propose, validate } from "@/lib/planner";
import type { Assignment, Option } from "@/lib/model";

type Method = "manual" | "mend";
type Trial = {
  method: Method;
  startedAt: string;
  finishedAt: string;
  elapsedMs: number;
  attempts: { at: string; violations: string[] }[];
  assignments: Assignment[];
};
const fixture = () => {
  const d = sampleEvent("00000000-0000-4000-8000-000000000002");
  d.locks = d.slots.filter((s) => s.id !== "opening").map((s) => s.id);
  return d;
};
export default function Study() {
  const [order, setOrder] = useState<Method[]>(["manual", "mend"]),
    [active, setActive] = useState(false),
    [elapsed, setElapsed] = useState(0),
    [trials, setTrials] = useState<Trial[]>([]),
    [participant, setParticipant] = useState(""),
    [consent, setConsent] = useState(false),
    [candidate, setCandidate] = useState("a3"),
    [zone, setZone] = useState("main"),
    [options, setOptions] = useState<Option[]>([]),
    [busy, setBusy] = useState(false),
    [errors, setErrors] = useState<string[]>([]);
  const clock = useRef<{
      startedAt: string;
      start: number;
      displayStart: number;
      attempts: Trial["attempts"];
    } | null>(null),
    method = order[trials.length],
    doc = fixture();
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      if (clock.current)
        setElapsed(performance.now() - clock.current.displayStart);
    }, 250);
    return () => clearInterval(timer);
  }, [active]);
  function submit(plan: Assignment[], finished: { now: number; at: string }) {
    if (!clock.current || !active) return;
    const violations = validate(doc, plan, {
      type: "cancellation",
      candidateId: "a1",
    });
    clock.current.attempts.push({ at: finished.at, violations });
    setErrors(violations);
    if (violations.length) return;
    const time = finished.now - clock.current.start;
    setElapsed(time);
    const completed: Trial = {
      method,
      startedAt: clock.current.startedAt,
      finishedAt: finished.at,
      elapsedMs: Math.round(time),
      attempts: [...clock.current.attempts],
      assignments: structuredClone(plan),
    };
    setTrials((rows) => [...rows, completed]);
    setActive(false);
    clock.current = null;
    setOptions([]);
  }
  return (
    <div className="simple-page study-page">
      <nav>
        <Link href="/" className="landing-brand" aria-label="MEND home">
          <MendMark />
        </Link>
        <Link href="/events">
          Open workspace <ArrowUpRight size={14} />
        </Link>
      </nav>
      <section className="page-heading">
        <div>
          <span className="eyebrow">ORGANIZER TEST / LOCAL MEASUREMENTS</span>
          <h1>Put the workflow on the clock.</h1>
          <p>
            Run the same cancellation task manually and with MEND. Times come
            from your interaction. Results stay in this browser until you
            download them.
          </p>
        </div>
      </section>
      <section className="study-brief">
        <span className="eyebrow">THE TASK / FICTIONAL FIXTURE</span>
        <h2>The opening act has withdrawn.</h2>
        <p>
          Replace The Sunday Assembly at 18:00. Keep all other participants and
          spaces locked. Stay within the $8,500 participant-fee cap and the
          supplied space, schedule and power constraints.
        </p>
        <details>
          <summary>Inspect the identical task inputs</summary>
          <div className="desk-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Performer</th>
                  <th>Fee</th>
                  <th>Power</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {doc.candidates
                  .filter((c) => c.kind === "artist")
                  .map((c) => (
                    <tr key={c.id}>
                      <td>
                        {c.name}
                        {c.id === "a1" ? " / withdrawn" : ""}
                      </td>
                      <td>${c.fee}</td>
                      <td>{c.power} kW</td>
                      <td>16:00–23:00, illustrative</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p>
            Both stages hold 400 guests. Palm stage supplies 10 kW; the covered
            grove supplies 6 kW. All data is synthetic.
          </p>
        </details>
      </section>
      {!trials.length && !active && (
        <section className="panel config-panel">
          <div className="form-grid">
            <label className="field">
              Anonymous participant code, optional
              <input
                maxLength={60}
                value={participant}
                onChange={(e) => setParticipant(e.target.value)}
                placeholder="For example, organizer-01"
              />
            </label>
            <label className="field">
              Trial order
              <select
                value={order[0]}
                onChange={(e) =>
                  setOrder(
                    e.target.value === "manual"
                      ? ["manual", "mend"]
                      : ["mend", "manual"],
                  )
                }
              >
                <option value="manual">Manual first</option>
                <option value="mend">MEND first</option>
              </select>
            </label>
          </div>
          <label className="study-consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />{" "}
            I agree to record this anonymous task measurement locally.
          </label>
        </section>
      )}
      {trials.length < 2 ? (
        <section className="panel config-panel study-trial">
          <div className="study-clock">
            <span className="eyebrow">
              TRIAL {trials.length + 1} /{" "}
              {method === "manual" ? "MANUAL REPAIR" : "MEND-ASSISTED REPAIR"}
            </span>
            <output aria-label="Elapsed trial time">
              {(elapsed / 1000).toFixed(1)}
              <small> sec</small>
            </output>
          </div>
          {!active ? (
            <button
              className="btn"
              disabled={!consent}
              onClick={(event) => {
                clock.current = {
                  startedAt: new Date().toISOString(),
                  start: event.timeStamp,
                  displayStart: performance.now(),
                  attempts: [],
                };
                setElapsed(0);
                setErrors([]);
                setActive(true);
              }}
            >
              <Play size={14} />
              Start {method === "manual" ? "manual" : "assisted"} trial
            </button>
          ) : method === "manual" ? (
            <>
              <div className="form-grid">
                <label className="field">
                  Replacement performer
                  <select
                    value={candidate}
                    onChange={(e) => setCandidate(e.target.value)}
                  >
                    {doc.candidates
                      .filter((c) => c.kind === "artist")
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="field">
                  Stage
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                  >
                    {doc.zones
                      .filter((z) => z.kind === "artist")
                      .map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <button
                className="btn"
                onClick={(event) =>
                  submit(
                    doc.plan.map((a) =>
                      a.slotId === "opening"
                        ? { ...a, candidateId: candidate, zoneId: zone }
                        : a,
                    ),
                    { now: event.timeStamp, at: new Date().toISOString() },
                  )
                }
              >
                Check and submit manual repair
              </button>
            </>
          ) : (
            <>
              <button
                className="btn"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await new Promise((resolve) => setTimeout(resolve, 30));
                  try {
                    setOptions(
                      propose(doc, { type: "cancellation", candidateId: "a1" })
                        .options,
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Checking feasible plans" : "Generate repair options"}
              </button>
              {options.map((o, i) => (
                <div className="study-option" key={o.id}>
                  <div>
                    <h3>Option {i + 1}</h3>
                    <p>
                      {
                        doc.candidates.find(
                          (c) =>
                            c.id ===
                            o.assignments.find((a) => a.slotId === "opening")
                              ?.candidateId,
                        )?.name
                      }{" "}
                      / ${o.metrics.cost} total fees
                    </p>
                    <small>
                      {o.metrics.changes} assignment changes. Synthetic cultural
                      ranks.
                    </small>
                  </div>
                  <button
                    className="btn quiet"
                    onClick={(event) =>
                      submit(o.assignments, {
                        now: event.timeStamp,
                        at: new Date().toISOString(),
                      })
                    }
                  >
                    Choose and submit
                  </button>
                </div>
              ))}
            </>
          )}
          {errors.length > 0 && (
            <div className="alert error" role="alert">
              {errors.join(" ")} The timer continues until a valid repair is
              submitted.
            </div>
          )}
        </section>
      ) : (
        <section className="panel config-panel">
          <span className="eyebrow">PAIRED TRIAL COMPLETE</span>
          <h2>Keep the raw result.</h2>
          <p>
            One paired test cannot establish an average benefit. Recruit
            organizers, vary trial order and retain failed attempts.
          </p>
        </section>
      )}
      {trials.length > 0 && (
        <section className="panel config-panel">
          <h3>Recorded trials</h3>
          {trials.map((t) => (
            <div className="study-result" key={t.method}>
              <strong>
                {t.method === "manual" ? "Manual" : "MEND-assisted"}
              </strong>
              <span>{(t.elapsedMs / 1000).toFixed(1)} seconds</span>
              <small>
                {t.attempts.length} submission attempts /{" "}
                {t.attempts.filter((a) => a.violations.length).length} failed
                checks
              </small>
            </div>
          ))}
          <button
            className="btn quiet"
            onClick={() => {
              const data = {
                schema: "mend-organizer-trial-v1",
                participant: participant.trim() || "anonymous",
                fixture: "synthetic-cancellation-locked-rest-v1",
                order,
                trials,
                completed: trials.length === 2,
                limitations: [
                  "Self-run local measurement; not independently verified.",
                  "Synthetic task, no live Qloo or language model.",
                  "Reading, learning, order and selection effects may influence times.",
                  "No population-level impact claim.",
                ],
              };
              const a = document.createElement("a"),
                u = URL.createObjectURL(
                  new Blob([JSON.stringify(data, null, 2)], {
                    type: "application/json",
                  }),
                );
              a.href = u;
              a.download = "mend-organizer-trial.json";
              a.click();
              URL.revokeObjectURL(u);
            }}
          >
            <Download size={14} />
            Download raw trial record
          </button>
        </section>
      )}
      <p className="fineprint">
        This instrument records actual local interaction time, including
        computation and failed submissions. It does not measure real bookings,
        cultural relevance, attendance or revenue. Don’t enter names, emails or
        other personal details.
      </p>
    </div>
  );
}
