"use client";
import { useRef, useState } from "react";
import Link from "@/components/mend/page-link";
import MendMark from "@/components/mend/mark";
import {
  maxReportBytes,
  verificationLimit,
  verifyReport,
} from "@/lib/verify-report";

export default function Verify() {
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof verifyReport>
  > | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const selection = useRef(0);
  return (
    <main className="simple-page">
      <nav>
        <Link href="/" className="landing-brand" aria-label="MEND home">
          <MendMark />
        </Link>
        <Link href="/review">Review the workflow</Link>
      </nav>
      <section className="page-heading">
        <div>
          <div className="eyebrow">CHECK THE RECORD</div>
          <h1>Inspect a recovery report.</h1>
          <p>
            Choose a downloaded MEND report to check its source response hashes.
            Your file stays in this browser and isn’t uploaded.
          </p>
        </div>
      </section>
      <section className="panel config-panel">
        <label className="field">
          <span>Approved report file, JSON, up to 5 MB</span>
          <input
            type="file"
            accept=".json,application/json"
            onChange={async (event) => {
              const ticket = ++selection.current;
              const file = event.target.files?.[0];
              setError("");
              setResult(null);
              setBusy(false);
              if (!file) return;
              if (file.size > maxReportBytes) {
                setError("Report exceeds 5 MB.");
                return;
              }
              setBusy(true);
              try {
                const checked = await verifyReport(await file.text());
                if (ticket === selection.current) setResult(checked);
              } catch (failure) {
                if (ticket === selection.current)
                  setError(
                    failure instanceof Error
                      ? failure.message
                      : "Could not read this report.",
                  );
              } finally {
                if (ticket === selection.current) setBusy(false);
              }
            }}
          />
        </label>
        {busy && <p role="status">Checking source responses…</p>}
        {error && (
          <p className="alert error" role="alert">
            {error}
          </p>
        )}
        {result && (
          <div role="status" className="info-note">
            <h2>{result.result}</h2>
            <p>{result.summary}</p>
            <p>
              {result.checkedReceipts} source receipts checked. Report mode:{" "}
              {result.mode}.
            </p>
            <p>Report {result.id}</p>
            {result.mode === "demo" && (
              <p>This is a synthetic demonstration report.</p>
            )}
            {result.mode === "live" && (
              <p>
                The file declares live mode. That declaration alone doesn’t
                prove a live provider call.
              </p>
            )}
          </div>
        )}
        <p className="fineprint">{verificationLimit}</p>
        <p>
          Reports with no receipts have no source evidence to check. Missing
          historical receipts and mismatched hashes are reported as failures.
        </p>
        <Link href="/demo">Create a sample repair and download its report</Link>
      </section>
    </main>
  );
}
