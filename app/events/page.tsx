"use client";

import Link from "@/components/mend/page-link";
import MendMark from "@/components/mend/mark";
import { useEffect, useState } from "react";
import { ArrowRight, Plus, CalendarDays, Leaf } from "lucide-react";
export default function Events() {
  const [events, setEvents] = useState<
      { id: string; name: string; revision: number }[]
    >([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/mend")
      .then(async (r) => {
        const d = (await r.json()) as { events: typeof events; error: string };
        if (!r.ok) throw new Error(d.error);
        setEvents(d.events);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="simple-page">
      <nav>
        <Link href="/" className="landing-brand" aria-label="MEND home">
          <MendMark />
        </Link>
        <Link href="/settings">Account & connections</Link>
      </nav>
      <section className="page-heading">
        <div>
          <div className="eyebrow">YOUR GATHERINGS</div>
          <h1>Your production book.</h1>
          <p>
            Each event has its own people, constraints, decisions and history.
          </p>
        </div>
        <Link className="btn" href="/events/new">
          <Plus size={15} /> Create an event
        </Link>
      </section>
      {error && (
        <div className="alert error">
          <span>
            {error} <Link href="/settings">Open account settings</Link> or{" "}
            <Link href="/demo">try the public sample</Link>.
          </span>
        </div>
      )}
      {loading ? (
        <p>Loading your events…</p>
      ) : !events.length ? (
        <section className="panel config-panel">
          <Leaf size={30} />
          <h3>No events in the book yet.</h3>
          <p>Create a blank event or explore the fictional sample.</p>
          <Link href="/demo" className="btn quiet">
            Try the sample <ArrowRight size={15} />
          </Link>
        </section>
      ) : (
        <div className="event-list">
          {events.map((e) => (
            <a
              key={e.id}
              href={"/events/" + e.id + "/studio"}
              className="panel event-list-card"
            >
              <CalendarDays size={22} />
              <h3>{e.name}</h3>
              <p>Revision {e.revision}</p>
              <span>
                Open studio <ArrowRight size={15} />
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
