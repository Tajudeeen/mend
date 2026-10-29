"use client";
import { useEffect, useState } from "react";
import Link from "./page-link";
import { ArrowUpRight } from "lucide-react";
export type OrganizerProfile = {
  displayName: string;
  organization: string;
  email: string;
  editable: boolean;
};

export function useOrganizerProfile(enabled: boolean) {
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [status, setStatus] = useState("Loading account…");
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    fetch("/api/profile", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as {
          profile?: OrganizerProfile;
          error?: string;
        };
        if (!response.ok || !data.profile)
          throw new Error(
            response.status === 401 ? "Sign in" : "Account unavailable",
          );
        if (!controller.signal.aborted) {
          setProfile(data.profile);
          setStatus("");
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setStatus(
            error.message === "Sign in" ? "Sign in" : "Account unavailable",
          );
      });
    return () => controller.abort();
  }, [enabled]);
  return { profile: enabled ? profile : null, status };
}
export function organizerInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => Array.from(part)[0])
      .join("")
      .toLocaleUpperCase() || "?"
  );
}
export default function OrganizerAccount({
  demo,
  profile,
  status,
}: {
  demo: boolean;
  profile: OrganizerProfile | null;
  status: string;
}) {
  const name = demo
    ? "Demo visitor"
    : profile?.displayName || profile?.email || status;
  return (
    <Link
      href="/settings#organizer-profile"
      className="account"
      aria-label={
        demo
          ? "Sign in or create an organizer account"
          : "Open organizer profile and account settings"
      }
    >
      <span className="avatar" aria-hidden="true">
        {demo
          ? "D"
          : profile
            ? organizerInitials(profile.displayName || profile.email)
            : "?"}
      </span>
      <span className="account-copy">
        <span className="account-name">{name}</span>
        <small>
          {demo
            ? "Sign in for private events"
            : profile?.organization ||
              (profile ? "Profile & account" : "Open account settings")}
        </small>
      </span>
      <ArrowUpRight size={16} aria-hidden="true" />
    </Link>
  );
}

export function OrganizerProfileEditor() {
  const { profile, status } = useOrganizerProfile(true);
  const [saved, setSaved] = useState<OrganizerProfile | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const current = saved || profile;
  if (!current) return <p role="status">{status}</p>;
  return (
    <div className="organizer-profile">
      <div className="profile-heading">
        <span className="avatar" aria-hidden="true">
          {organizerInitials(current.displayName || current.email)}
        </span>
        <div>
          <strong>{current.displayName || "Your organizer profile"}</strong>
          {current.email && <small>{current.email}</small>}
        </div>
      </div>
      {current.editable ? (
        <form
          key={JSON.stringify(current)}
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setBusy(true);
            setMessage("");
            try {
              const response = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  displayName: form.get("displayName"),
                  organization: form.get("organization"),
                }),
              });
              const data = (await response.json()) as {
                profile?: OrganizerProfile;
                error?: string;
              };
              if (!response.ok || !data.profile)
                throw new Error(data.error || "Could not save your profile.");
              setSaved(data.profile);
              setMessage(
                "Profile saved. Your events and their ownership stay with this account.",
              );
            } catch {
              setMessage(
                "Could not save your profile. Check your connection and try again.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="field">
            Organizer name
            <input
              name="displayName"
              autoComplete="name"
              defaultValue={current.displayName}
              maxLength={80}
              required
            />
          </label>
          <label className="field">
            Organization <small>Optional</small>
            <input
              name="organization"
              autoComplete="organization"
              defaultValue={current.organization}
              maxLength={100}
            />
          </label>
          <p className="fineprint">
            Used to identify you in your private workspace. Profile details do
            not verify your bookings or organization.
          </p>
          <button className="btn" disabled={busy}>
            {busy ? "Saving…" : "Save profile"}
          </button>
        </form>
      ) : (
        <p>Your identity is managed by ChatGPT on this deployment.</p>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  );
}
