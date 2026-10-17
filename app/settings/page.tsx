"use client";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { useEffect, useState } from "react";
export default function Settings() {
  const router = useRouter();
  const [health, setHealth] = useState<Record<string, unknown>>({}),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setHealth(d as typeof health))
      .catch(() => setMessage("Could not load connection status."));
  }, []);
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
          <div className="eyebrow">ACCOUNT & CONNECTIONS</div>
          <h1>A clear view of what’s connected.</h1>
          <p>
            Credentials stay on the server. Sample data remains separate from
            live evidence.
          </p>
        </div>
      </section>
      <div className="evidence-grid">
        <section className="panel config-panel">
          <h3>Your organizer account</h3>
          {health.auth === "chatgpt-compatibility" ? (
            <>
              <p>This compatibility deployment uses your ChatGPT identity.</p>
              <a
                className="btn"
                target="_top"
                href="/signin-with-chatgpt?return_to=/events"
              >
                Sign in with ChatGPT
              </a>
            </>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  const r = await fetch("/api/auth", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "signin",
                        email,
                        password,
                      }),
                    }),
                    d = (await r.json()) as { error?: string };
                  if (!r.ok) throw new Error(d.error);
                  router.push("/events");
                } catch (e) {
                  setMessage((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label className="field">
                Email
                <input
                  required
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="field">
                Password
                <input
                  required
                  type="password"
                  minLength={8}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <button className="btn" disabled={busy}>
                Sign in
              </button>
              <p className="fineprint">
                New organizer accounts are provisioned through the configured
                Supabase project. The sample workflow is open to everyone.
              </p>
            </form>
          )}
          {message && (
            <p role="alert" className="alert error">
              {message}
            </p>
          )}
        </section>
        <section className="panel config-panel">
          <h3>Service status</h3>
          {[
            [
              "Cultural intelligence",
              health.qloo
                ? "Qloo key configured, live verification still required"
                : "Qloo key not configured",
            ],
            [
              "Language agent",
              health.model
                ? "Provider configured"
                : "Provider credentials not configured",
            ],
            ["Persistence", health.persistence ?? "Checking…"],
            ["Authentication", health.auth ?? "Checking…"],
          ].map(([label, value]) => (
            <div className="config-row" key={String(label)}>
              <span>{String(label)}</span>
              <span>{String(value)}</span>
            </div>
          ))}
          <p className="fineprint">
            A configured connection isn&apos;t proof of a successful live call.
            Receipts and verified runs appear in the event’s evidence view.
          </p>
          <Link href="/demo" className="btn quiet">
            Explore the sample
          </Link>
        </section>
      </div>
    </div>
  );
}
