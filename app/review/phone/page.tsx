"use client";
import { useRef, useState } from "react";
import Link from "@/components/mend/page-link";
const pages = [
  ["Sample recovery", "/demo?view=repair&incident=cancellation"],
  ["Sample evidence", "/demo?view=evidence"],
  ["Organizer study", "/study"],
  ["Account", "/settings"],
  ["My events", "/events"],
] as const;
export default function PhoneReview() {
  const [width, setWidth] = useState(390),
    [path, setPath] = useState<string>(pages[0][1]);
  const [metrics, setMetrics] = useState<string>("Waiting for the page.");
  const frame = useRef<HTMLIFrameElement>(null);
  function measure() {
    const doc = frame.current?.contentDocument;
    if (!doc) return setMetrics("Page measurements unavailable.");
    const viewport = doc.documentElement.clientWidth;
    const page = doc.documentElement.scrollWidth;
    setMetrics(
      `Viewport ${viewport}px. Document ${page}px. ${page > viewport ? "Horizontal overflow detected." : "No document overflow."}`,
    );
  }
  return (
    <main className="simple-page">
      <nav>
        <Link href="/review">Review the workflow</Link>
        <Link href="/study">Organizer study</Link>
      </nav>
      <section className="page-heading">
        <div>
          <div className="eyebrow">RESPONSIVE LAYOUT REVIEW</div>
          <h1>Inspect the phone layout.</h1>
          <p>
            This same-origin frame uses a real narrow CSS viewport. It doesn’t
            simulate touch, a phone keyboard, device performance or Android
            browser behavior.
          </p>
        </div>
      </section>
      <div className="panel config-panel">
        <div className="form-grid">
          <label className="field">
            Viewport width
            <select
              value={width}
              onChange={(e) => {
                setWidth(Number(e.target.value));
                setMetrics("Measure after resizing.");
              }}
            >
              {[320, 360, 390, 430].map((w) => (
                <option key={w} value={w}>
                  {w}px
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Page to review
            <select
              value={path}
              onChange={(e) => {
                setPath(e.target.value);
                setMetrics("Waiting for the page.");
              }}
            >
              {pages.map(([name, url]) => (
                <option key={url} value={url}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="btn quiet" onClick={measure}>
          Measure document overflow
        </button>
        <p role="status">{metrics}</p>
      </div>
      <div className="phone-review-scroll">
        <iframe
          ref={frame}
          title="MEND phone viewport"
          src={path}
          onLoad={measure}
          style={{
            width,
            height: 780,
            border: "1px solid var(--line)",
            display: "block",
            margin: "24px auto",
            background: "var(--paper)",
          }}
        />
      </div>
    </main>
  );
}
