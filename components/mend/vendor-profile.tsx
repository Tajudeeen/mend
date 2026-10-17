"use client";
import { useState } from "react";
import { Search, X, ArrowUpRight } from "lucide-react";
import type { EventDoc } from "@/lib/model";
type Entity = { id: string; name: string; description?: string };
export default function VendorProfile({
  doc,
  disabled,
  demo,
  action,
}: {
  doc: EventDoc;
  disabled: boolean;
  demo: boolean;
  action: (a: string, b?: Record<string, unknown>) => Promise<unknown>;
}) {
  const vendors = doc.candidates.filter((c) => c.kind === "vendor");
  const [id, setId] = useState(vendors[0]?.id ?? ""),
    [query, setQuery] = useState(""),
    [results, setResults] = useState<Entity[]>([]),
    [selected, setSelected] = useState<Entity[]>(
      vendors[0]?.culturalProfile?.entities ?? [],
    ),
    [rationale, setRationale] = useState(
      vendors[0]?.culturalProfile?.rationale ?? "",
    ),
    [error, setError] = useState(""),
    [searching, setSearching] = useState(false);
  const selectedId = vendors.some((c) => c.id === id)
    ? id
    : (vendors[0]?.id ?? "");
  const vendor = vendors.find((c) => c.id === selectedId);
  function choose(value: string) {
    setId(value);
    const c = vendors.find((v) => v.id === value);
    setSelected(c?.culturalProfile?.entities ?? []);
    setRationale(c?.culturalProfile?.rationale ?? "");
    setResults([]);
    setError("");
  }
  return (
    <section className="panel config-panel vendor-profile">
      <div className="eyebrow">INDEPENDENT VENDORS / EXPLICIT REFERENCES</div>
      <h3>No graph identity? Build a reference profile.</h3>
      <p>
        Choose up to three comparable places and explain the connection. The
        vendor keeps its own name, terms and inventory. References never imply a
        direct Qloo listing.
      </p>
      {!vendors.length ? (
        <p>Add a vendor to the roster first.</p>
      ) : (
        <>
          <label className="field">
            Independent vendor
            <select value={selectedId} onChange={(e) => choose(e.target.value)}>
              {vendors.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="profile-current">
            <span>
              {vendor?.entityId
                ? "Direct identity linked"
                : vendor?.culturalProfile
                  ? "Proxy profile saved"
                  : "No cultural profile"}
            </span>
            {vendor?.culturalProfile && (
              <p>
                {vendor.culturalProfile.entities.map((e) => e.name).join(" / ")}
              </p>
            )}
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              if (demo) {
                setError(
                  "Reference selection needs a saved live event and a Qloo key. No sample places are invented.",
                );
                return;
              }
              setSearching(true);
              try {
                const response = await fetch("/api/culture", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "search",
                    query,
                    kind: "vendor",
                  }),
                });
                const data = (await response.json()) as {
                  error?: string;
                  results: Entity[];
                };
                if (!response.ok) throw new Error(data.error);
                setResults(data.results);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setSearching(false);
              }
            }}
          >
            <label className="field">
              Search a comparable place
              <div className="profile-search">
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="A place whose food or format is a useful reference"
                />
                <button className="btn small" disabled={disabled || searching}>
                  <Search size={14} />
                  {searching ? "Searching" : "Search"}
                </button>
              </div>
            </label>
          </form>
          <div className="profile-results">
            {results.map((entity) => (
              <button
                key={entity.id}
                disabled={
                  disabled ||
                  selected.length >= 3 ||
                  selected.some((s) => s.id === entity.id)
                }
                onClick={() => setSelected((s) => [...s, entity])}
              >
                <strong>{entity.name}</strong>
                <small>{entity.description}</small>
                <ArrowUpRight size={14} />
              </button>
            ))}
          </div>
          <div className="profile-selected">
            {selected.map((entity) => (
              <span key={entity.id}>
                {entity.name}
                <button
                  aria-label={`Remove ${entity.name} reference`}
                  onClick={() =>
                    setSelected((s) => s.filter((v) => v.id !== entity.id))
                  }
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <label className="field">
            Why these references?
            <textarea
              rows={3}
              minLength={20}
              maxLength={600}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Describe the cuisine, format or cultural connection. Be specific about the limits."
            />
          </label>
          <div className="config-row">
            <button
              className="btn small"
              disabled={
                disabled ||
                demo ||
                !selected.length ||
                rationale.trim().length < 20
              }
              onClick={() =>
                action("vendorProfile", {
                  candidateId: selectedId,
                  profile: {
                    entities: selected.map(({ id, name }) => ({ id, name })),
                    rationale: rationale.trim(),
                  },
                })
              }
            >
              Save reference profile
            </button>
            {vendor?.culturalProfile && (
              <button
                className="text-btn"
                disabled={disabled}
                onClick={() =>
                  action("vendorProfile", {
                    candidateId: selectedId,
                    clear: true,
                  })
                }
              >
                Remove saved profile
              </button>
            )}
          </div>
          <p className="fineprint">
            Saving rechecks every selection with Qloo and invalidates earlier
            cultural batches. All profiles in one vendor batch share the same
            fixed place pool. Different proxy counts receive equal weight per
            vendor after ordinal aggregation.
          </p>
        </>
      )}
      {error && (
        <p className="alert error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
