"use client";

import Link from "@/components/mend/page-link";
import MendMark from "@/components/mend/mark";
import { useEffect, useState } from "react";
import type { ConnectionResult } from "@/server/connections";
export default function Settings() {
  const [health, setHealth] = useState<Record<string, unknown>>({}),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [signedIn, setSignedIn] = useState(false),
    [authAction, setAuthAction] = useState<"signin" | "signup">("signin"),
    [checking, setChecking] = useState(false),
    [checks, setChecks] = useState<{
      checkedAt: string;
      qloo: ConnectionResult;
      model: ConnectionResult;
    } | null>(null);
  useEffect(() => {
    const confirmationFailed =
      new URLSearchParams(window.location.search).get("auth") === "failed";
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => {
        setSignedIn((d as { signedIn?: boolean }).signedIn === true);
        if (confirmationFailed)
          setMessage(
            "That confirmation link could not be verified. Try signing in, or request a new confirmation email from your organizer administrator.",
          );
      })
      .catch(() => {});
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setHealth(d as typeof health))
      .catch(() => setMessage("Could not load connection status."));
  }, []);
  return (
    <div className="simple-page">
      <nav>
        <Link href="/" className="landing-brand" aria-label="MEND home">
          <MendMark />
        </Link>
        <Link href="/events">My events</Link>
      </nav>
      <section className="page-heading">
        <div>
          <div className="eyebrow">ACCOUNT & CONNECTIONS</div>
          <h1>Account & connections.</h1>
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
              <p>
                {signedIn
                  ? "You are signed in with ChatGPT."
                  : "This deployment uses your ChatGPT identity."}
              </p>
              <a
                className="btn"
                target="_top"
                href="/signin-with-chatgpt?return_to=/events"
              >
                Sign in with ChatGPT
              </a>
            </>
          ) : health.auth === "not-configured" ? (
            <div role="status">
              <p>
                Account sign-in is not set up on this deployment yet. Please
                contact the organizer administrator to enable it.
              </p>
              <Link href="/demo" className="btn quiet">
                Explore the sample
              </Link>
            </div>
          ) : signedIn ? (
            <>
              <p>
                You are signed in. Your events are private to your organizer
                account.
              </p>
              <button
                className="btn quiet"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const r = await fetch("/api/auth", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "signout" }),
                    });
                    const d = (await r.json()) as { error?: string };
                    if (!r.ok)
                      throw new Error(d.error || "Could not sign out.");
                    setSignedIn(false);
                    setPassword("");
                    setChecks(null);
                    setMessage("You have signed out of this browser.");
                  } catch (error) {
                    setMessage((error as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Sign out
              </button>
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
                        action: authAction,
                        email,
                        password,
                      }),
                    }),
                    d = (await r.json()) as {
                      error?: string;
                      confirmationRequired?: boolean;
                    };
                  if (!r.ok)
                    throw new Error(d.error || "Could not authenticate.");
                  if (d.confirmationRequired) {
                    setMessage(
                      "Check your email to confirm your account, then return here to sign in.",
                    );
                    setPassword("");
                    setAuthAction("signin");
                    return;
                  }
                  // Re-enter dispatch after the session changes.
                  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                  window.location.assign("/events");
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
                  minLength={authAction === "signup" ? 8 : 1}
                  autoComplete={
                    authAction === "signup"
                      ? "new-password"
                      : "current-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <button className="btn" disabled={busy}>
                {busy
                  ? "Working…"
                  : authAction === "signup"
                    ? "Create account"
                    : "Sign in"}
              </button>
              <button
                type="button"
                className="btn quiet"
                disabled={busy}
                onClick={() => {
                  setAuthAction(authAction === "signin" ? "signup" : "signin");
                  setMessage("");
                }}
              >
                {authAction === "signin"
                  ? "New here? Create an account"
                  : "Already registered? Sign in"}
              </button>
              <p className="fineprint">
                Email confirmation may be required. The sample workflow is open
                to everyone.
              </p>
            </form>
          )}
          {message && (
            <p role="status" className="alert">
              {message}
            </p>
          )}
        </section>
        <section className="panel config-panel">
          <h3>Service status</h3>
          {[
            [
              "Cultural intelligence",
              health.qloo === undefined
                ? "Checking…"
                : health.qloo
                  ? "Qloo key configured, live verification still required"
                  : "Qloo key not configured",
            ],
            [
              "Language agent",
              health.model === undefined
                ? "Checking…"
                : health.model
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
          <button
            className="btn"
            disabled={checking || !signedIn}
            onClick={async () => {
              setChecking(true);
              setMessage("");
              try {
                const r = await fetch("/api/connections", { method: "POST" });
                const d = (await r.json()) as NonNullable<typeof checks> & {
                  error?: string;
                };
                if (!r.ok)
                  throw new Error(d.error || "Connection check failed.");
                setChecks(d);
              } catch (error) {
                setMessage((error as Error).message);
              } finally {
                setChecking(false);
              }
            }}
          >
            {checking ? "Checking connections…" : "Test Qloo and model"}
          </button>
          <p className="fineprint">
            {signedIn
              ? "Runs one Qloo search and one short model tool-call check using your configured API quota."
              : "Sign in to run live connection checks."}
          </p>
          {checks && (
            <div role="status" aria-label="Connection check results">
              <p className="fineprint">
                Checked {new Date(checks.checkedAt).toLocaleString()}
              </p>
              {(["qloo", "model"] as const).map((name) => (
                <div className="config-row" key={name}>
                  <span>
                    {name === "qloo" ? "Qloo" : "Model"}: {checks[name].state}
                  </span>
                  <span>{checks[name].detail}</span>
                </div>
              ))}
            </div>
          )}
          <Link href="/demo" className="btn quiet">
            Explore the sample
          </Link>
        </section>
      </div>
    </div>
  );
}
