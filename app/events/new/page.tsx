"use client";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { useState } from "react";
import { sampleEvent } from "@/lib/seed";
import type { Brief } from "@/lib/model";
export default function NewEvent() {
  const router = useRouter();
  const [b, setB] = useState<Brief>(() => ({
      ...sampleEvent().brief,
      name: "",
      description: "",
      city: "",
      budget: 5000,
    })),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="simple-page">
      <nav>
        <Link href="/" className="landing-brand">
          mend.
        </Link>
        <Link href="/events">My events</Link>
      </nav>
      <section className="page-heading">
        <div>
          <div className="eyebrow">START WITH INTENTION</div>
          <h1>What are you bringing together?</h1>
          <p>
            Create a blank event, then add your participants, spaces and program
            slots.
          </p>
        </div>
      </section>
      <form
        className="panel form-panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            const r = await fetch("/api/mend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "create",
                  brief: b,
                  requestKey: crypto.randomUUID(),
                }),
              }),
              d = (await r.json()) as { event: { id: string }; error: string };
            if (!r.ok) throw new Error(d.error);
            router.push("/events/" + d.event.id + "/studio");
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="form-grid">
          {(["name", "city", "date", "budget", "attendees"] as const).map(
            (k) => (
              <label className="field" key={k}>
                {
                  {
                    name: "Event name",
                    city: "City / market",
                    date: "Event date",
                    budget: "Known participant-fee budget, USD",
                    attendees: "Expected guests",
                  }[k]
                }
                <input
                  required
                  type={
                    ["budget", "attendees"].includes(k)
                      ? "number"
                      : k === "date"
                        ? "date"
                        : "text"
                  }
                  min={k === "budget" ? 100 : k === "attendees" ? 1 : undefined}
                  maxLength={100}
                  value={b[k]}
                  onChange={(e) =>
                    setB({
                      ...b,
                      [k]: ["budget", "attendees"].includes(k)
                        ? Number(e.target.value)
                        : e.target.value,
                    })
                  }
                />
              </label>
            ),
          )}
        </div>
        <label className="field">
          What should the gathering feel like?
          <textarea
            value={b.description}
            maxLength={1500}
            onChange={(e) => setB({ ...b, description: e.target.value })}
          />
        </label>
        {error && (
          <p role="alert" className="alert error">
            {error}
          </p>
        )}
        <button className="btn" disabled={busy}>
          {busy ? "Creating…" : "Create a blank event"}
        </button>
        <p className="fineprint">
          Saving needs your organizer account and configured persistence.{" "}
          <Link href="/demo">The public sample works without an account.</Link>
        </p>
      </form>
    </div>
  );
}
