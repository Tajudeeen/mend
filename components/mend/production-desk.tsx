import type { EventDoc } from "@/lib/model";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
export default function ProductionDesk({
  doc,
  navigate,
}: {
  doc: EventDoc;
  navigate: (view: string) => void;
}) {
  const confirmed = doc.plan.filter((a) =>
    doc.candidates.some(
      (c) =>
        c.id === a.candidateId &&
        c.verified &&
        c.feeKnown !== false &&
        c.availabilityKnown !== false,
    ),
  ).length;
  return (
    <section className="production-desk">
      <div className="desk-event-heading">
        <div>
          <span className="front-kicker">
            PRODUCTION COPY / REV. {String(doc.revision).padStart(2, "0")}
          </span>
          <h1>{doc.brief.name}</h1>
          <p>
            {doc.brief.city} <span>/</span> {doc.brief.date} <span>/</span>{" "}
            {doc.brief.attendees} expected guests
          </p>
        </div>
        <button className="btn" onClick={() => navigate("repair")}>
          Something changed <ArrowUpRight size={17} />
        </button>
      </div>
      <div className="desk-running-order">
        <div className="desk-order-head">
          <span>RUNNING ORDER</span>
          <span>
            {confirmed}/{doc.plan.length} TERMS CONFIRMED
          </span>
          <button onClick={() => navigate("lineup")}>
            Edit people <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="desk-table-scroll">
          <table>
            <caption className="sr-only">
              Event running order, participant assignments and confirmation
              status
            </caption>
            <thead>
              <tr>
                <th>Time</th>
                <th>Programme</th>
                <th>Participant</th>
                <th>Space</th>
                <th>Booking terms</th>
              </tr>
            </thead>
            <tbody>
              {[...doc.slots]
                .sort((a, b) => a.from - b.from || a.id.localeCompare(b.id))
                .map((slot) => {
                  const assignment = doc.plan.find((a) => a.slotId === slot.id),
                    candidate = doc.candidates.find(
                      (c) => c.id === assignment?.candidateId,
                    ),
                    zone = doc.zones.find((z) => z.id === assignment?.zoneId);
                  return (
                    <tr key={slot.id}>
                      <td>
                        <time>
                          {String(Math.floor(slot.from)).padStart(2, "0")}:
                          {String(Math.round((slot.from % 1) * 60)).padStart(
                            2,
                            "0",
                          )}
                        </time>
                        <small>to {slot.to}:00</small>
                      </td>
                      <td>
                        {slot.name}
                        {doc.locks?.includes(slot.id) && (
                          <LockKeyhole
                            size={12}
                            aria-label="Locked commitment"
                          />
                        )}
                      </td>
                      <td>
                        <strong>
                          {candidate?.name ?? "Assignment needed"}
                        </strong>
                        <small>{candidate?.category ?? slot.kind}</small>
                      </td>
                      <td>{zone?.name ?? "Unassigned"}</td>
                      <td>
                        <span
                          className={
                            "desk-term " +
                            (candidate?.verified &&
                            candidate.feeKnown !== false &&
                            candidate.availabilityKnown !== false
                              ? "confirmed"
                              : "unconfirmed")
                          }
                        >
                          {candidate?.verified &&
                          candidate.feeKnown !== false &&
                          candidate.availabilityKnown !== false
                            ? "Confirmed"
                            : "Needs confirmation"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {!doc.slots.length && (
          <div className="desk-blank">
            <h2>Start with the running order.</h2>
            <p>
              Add your programme slots, participants and spaces. The planner
              won’t invent them.
            </p>
            <button className="btn quiet" onClick={() => navigate("site")}>
              Set up the event <ArrowUpRight size={16} />
            </button>
          </div>
        )}
      </div>
      <div className="desk-dispatch">
        <span className="dispatch-label">NEXT ACTION</span>
        <p>
          {doc.proposal?.status === "pending"
            ? "A proposed repair is waiting for your review."
            : confirmed < doc.plan.length
              ? "Confirm participant terms before approving a live plan."
              : "Review your site constraints before running the next scenario."}
        </p>
        <button
          onClick={() =>
            navigate(doc.proposal?.status === "pending" ? "repair" : "lineup")
          }
        >
          {doc.proposal?.status === "pending"
            ? "Review proposal"
            : "Open roster"}
          <ArrowUpRight size={16} />
        </button>
      </div>
    </section>
  );
}
