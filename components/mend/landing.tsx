import Link from "@/components/mend/page-link";
import MendMark from "@/components/mend/mark";
import { ArrowUpRight, ArrowRight, MoveUpRight } from "lucide-react";
import { sampleEvent } from "@/lib/seed";

export default function Landing() {
  const event = sampleEvent("00000000-0000-4000-8000-000000000001");
  return (
    <div className="mend-front">
      <nav className="front-nav" aria-label="Main navigation">
        <Link className="front-mark" href="/" aria-label="MEND home">
          <MendMark />
        </Link>
        <span className="front-edition">MUSIC / MARKETS / PEOPLE</span>
        <Link href="/events" className="front-workspace">
          Open workspace <ArrowUpRight size={17} />
        </Link>
      </nav>
      <main>
        <section className="front-cover">
          <div className="cover-statement">
            <div className="front-kicker">
              <span className="ink-dot" /> EVENT PLANNING & RECOVERY
            </div>
            <h1>
              KEEP
              <br />
              THE NIGHT
              <br />
              <span>TOGETHER.</span>
            </h1>
            <p>
              One act pulls out. Rain takes a stage. Your budget gets cut. Work
              out what can change, without losing what brought people here.
            </p>
            <div className="front-entry">
              <Link
                href="/demo?view=repair&incident=cancellation"
                className="front-primary"
              >
                Repair a sample event <ArrowUpRight size={20} />
              </Link>
              <span>No account. No real bookings.</span>
            </div>
            <div className="cover-index">
              <span>01 / THE PLAN CHANGED</span>
              <span>THE PURPOSE DIDN’T.</span>
            </div>
          </div>
          <div className="cover-program">
            <div className="program-ticket">
              <span>FICTIONAL EVENT / WORKING COPY</span>
              <MendMark />
            </div>
            <div className="poster-title">
              <span>LAGOS · 21 NOV 2026</span>
              <h2>
                MIDNIGHT
                <br />
                CULTURE
                <br />
                MARKET
              </h2>
              <div>INDEPENDENT MUSIC. FOOD. SHARED SPACE.</div>
            </div>
            <div className="poster-running-order">
              <div className="running-order-label">
                <span>RUNNING ORDER</span>
                <span>REV. 00</span>
              </div>
              {event.plan
                .filter(
                  (a) =>
                    event.slots.find((s) => s.id === a.slotId)?.kind ===
                    "artist",
                )
                .map((a, i) => {
                  const candidate = event.candidates.find(
                    (c) => c.id === a.candidateId,
                  )!;
                  const slot = event.slots.find((s) => s.id === a.slotId)!;
                  return (
                    <div
                      className={"poster-act " + (i === 0 ? "withdrawn" : "")}
                      key={a.slotId}
                    >
                      <span>{slot.from}:00</span>
                      <div>
                        <strong>{candidate.name}</strong>
                        <small>{slot.name} / Palm stage</small>
                      </div>
                      {i === 0 && (
                        <span className="withdrawn-stamp">WITHDRAWN</span>
                      )}
                    </div>
                  );
                })}
              <div className="poster-market">
                <span>16:00</span>
                <p>
                  Ember & Earth / The Green Table / Sunday Press
                  <small>MARKET OPENS · THREE INDEPENDENT VENDORS</small>
                </p>
              </div>
            </div>
            <Link
              href="/demo?view=repair&incident=cancellation"
              className="poster-note"
            >
              <span className="note-number">!</span>
              <span>
                Opening act unavailable.
                <small>Find a replacement. Keep the rest in view.</small>
              </span>
              <ArrowRight size={20} />
            </Link>
            <div className="poster-tear" aria-hidden="true" />
          </div>
        </section>
        <section className="front-incidents" aria-labelledby="incident-title">
          <div>
            <span className="front-kicker">02 / PICK YOUR PROBLEM</span>
            <h2 id="incident-title">What changed?</h2>
            <p>Each sample opens the real repair desk.</p>
          </div>
          <div className="incident-register">
            {[
              {
                no: "01",
                type: "cancellation",
                title: "An act pulls out",
                description: "Find a replacement within the fee cap.",
              },
              {
                no: "02",
                type: "rain",
                title: "The rain moves in",
                description: "Replan around covered spaces and power.",
              },
              {
                no: "03",
                type: "budget",
                title: "The budget shrinks",
                description: "Rebalance the programme without guessing fees.",
              },
              {
                no: "04",
                type: "closure",
                title: "A space closes",
                description: "Keep locked commitments while reallocating.",
              },
            ].map((incident) => (
              <Link
                key={incident.no}
                href={`/demo?view=repair&incident=${incident.type}`}
              >
                <span>{incident.no}</span>
                <div>
                  <h3>{incident.title}</h3>
                  <p>{incident.description}</p>
                </div>
                <MoveUpRight size={24} />
              </Link>
            ))}
          </div>
        </section>
        <section className="front-method">
          <div className="method-title">
            <span className="front-kicker">
              03 / YOUR CALL, WITH A CLEAR RECORD
            </span>
            <h2>
              A repair has
              <br />
              to hold up.
            </h2>
            <Link href="/demo?view=evidence">
              Open the evidence desk <ArrowUpRight size={17} />
            </Link>
          </div>
          <ol>
            {[
              [
                "Mark the change.",
                "Tell the planner who is unavailable, what space is lost, or what you can spend.",
              ],
              [
                "Compare what fits.",
                "Check the schedule, fees, power and available space alongside cultural evidence and missing facts.",
              ],
              [
                "Make the call.",
                "Review the differences, approve a plan and keep the before-and-after record. Nothing gets booked automatically.",
              ],
            ].map(([title, copy], i) => (
              <li key={title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="front-disclosure">
          <span>SAMPLE, CLEARLY MARKED.</span>
          <p>
            The sample uses fictional participants and synthetic preference
            values. Live cultural analysis needs Qloo evidence. Booking terms
            come from the organizer. Neither is a promise of attendance or
            sales.
          </p>
          <Link href="/settings">
            Connection status <ArrowUpRight size={16} />
          </Link>
        </section>
      </main>
      <footer className="front-footer">
        <span role="img" aria-label="MEND" className="front-mark">
          <MendMark />
        </span>
        <p>Keep the feeling. Repair the plan.</p>
        <Link href="/study">
          Time a repair <ArrowUpRight size={17} />
        </Link>
        <Link href="/events">
          Back to work <ArrowUpRight size={17} />
        </Link>
      </footer>
    </div>
  );
}
