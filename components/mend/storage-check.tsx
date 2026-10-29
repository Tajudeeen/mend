"use client";
import { useState } from "react";
export default function StorageCheck({ enabled }: { enabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    checkedAt: string;
    checks: string[];
    limitation: string;
  } | null>(null);
  const [error, setError] = useState("");
  return (
    <section
      className="panel config-panel"
      aria-label="Private storage verification"
    >
      <div className="eyebrow">DEPLOYED DATABASE CHECK</div>
      <h3>Check private event storage.</h3>
      <p>
        Creates isolated test records, checks owner access and refuses
        cross-owner reads and writes, then rolls everything back. Your events
        are not used.
      </p>
      <button
        className="btn quiet"
        disabled={!enabled || busy}
        onClick={async () => {
          setBusy(true);
          setResult(null);
          setError("");
          try {
            const response = await fetch("/api/storage-check", {
              method: "POST",
            });
            const data = (await response.json()) as {
              status?: string;
              error?: string;
              checkedAt: string;
              checks: string[];
              limitation: string;
            };
            if (!response.ok || data.status !== "passed")
              throw new Error(data.error || "Storage check failed.");
            setResult(data);
          } catch (error) {
            setError(
              error instanceof Error
                ? error.message
                : "Could not check storage.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Checking private storage…" : "Check storage isolation"}
      </button>
      {!enabled && (
        <p className="fineprint">
          Sign in on the PostgreSQL deployment to run this check.
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {result && (
        <div role="status">
          <p>Passed at {new Date(result.checkedAt).toLocaleString()}.</p>
          <ul>
            {result.checks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
          <p className="fineprint">{result.limitation}</p>
        </div>
      )}
    </section>
  );
}
