"use client";

import Link from "next/link";
export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="simple-page">
      <section className="page-heading">
        <div>
          <h1>Something interrupted the plan.</h1>
          <p>
            Your saved event remains on the server. Try again or return to your
            events.
          </p>
        </div>
      </section>
      <button className="btn" onClick={reset}>
        Try again
      </button>
      <Link className="btn quiet" href="/events">
        My events
      </Link>
    </div>
  );
}
