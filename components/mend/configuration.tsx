"use client";
import { useState } from "react";
import { Plus, LockKeyhole, Unlock, Check, Trash2, Move } from "lucide-react";
import type { EventDoc, Zone, Slot } from "@/lib/model";
import { defaultOptimizer } from "@/lib/model";
type Action = (
  action: string,
  extra?: Record<string, unknown>,
) => Promise<unknown>;
export function RosterTools({
  doc,
  action,
  disabled,
}: {
  doc: EventDoc;
  action: Action;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false),
    [name, setName] = useState(""),
    [kind, setKind] = useState<"artist" | "vendor">("artist"),
    [category, setCategory] = useState("Independent performer");
  return (
    <section className="panel config-panel">
      <div className="config-heading">
        <div>
          <span className="eyebrow">YOUR PARTICIPANTS</span>
          <h3>Build your own roster.</h3>
        </div>
        <button
          className="btn small"
          disabled={disabled}
          onClick={() => setOpen(!open)}
        >
          <Plus size={14} /> Add participant
        </button>
      </div>
      {open && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const result = await action("addCandidate", {
              fields: {
                name,
                kind,
                category,
                fee: 0,
                feeKnown: false,
                power: 0,
                available: true,
                availabilityKnown: false,
                verified: false,
                from: 16,
                to: 23,
                width: 2,
                depth: 2,
              },
            });
            if (result) {
              setOpen(false);
              setName("");
            }
          }}
        >
          <div className="form-grid">
            <label className="field">
              Participant name
              <input
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="field">
              Role
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as typeof kind)}
              >
                <option value="artist">Performer</option>
                <option value="vendor">Vendor</option>
              </select>
            </label>
            <label className="field">
              Category
              <input
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </label>
          </div>
          <p className="fineprint">
            New participants start with unknown fees and availability. Link
            their cultural entity and confirm operational terms separately.
          </p>
          <button className="btn small" disabled={disabled}>
            Add to reserve pool
          </button>
        </form>
      )}
      <details className="config-details">
        <summary>Remove reserve participants</summary>
        {doc.candidates
          .filter((c) => !doc.plan.some((a) => a.candidateId === c.id))
          .map((c) => (
            <div className="config-row" key={c.id}>
              <span>{c.name}</span>
              <button
                aria-label={"Remove " + c.name}
                disabled={disabled}
                onClick={() => action("removeCandidate", { candidateId: c.id })}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
      </details>
    </section>
  );
}
export function LayoutTools({
  doc,
  action,
  disabled,
}: {
  doc: EventDoc;
  action: Action;
  disabled: boolean;
}) {
  const [z, setZ] = useState<Zone>({
      id: "",
      name: "New market stall",
      kind: "vendor",
      capacity: 1,
      power: 3,
      covered: false,
      x: 50,
      y: 50,
      width: 3,
      depth: 3,
      blocked: false,
      allowedCategories: [],
    }),
    [s, setS] = useState<Slot>({
      id: "",
      name: "New vendor slot",
      kind: "vendor",
      from: 16,
      to: 22,
    }),
    [assignment, setAssignment] = useState({
      slotId: doc.slots[0]?.id ?? "",
      candidateId: doc.candidates[0]?.id ?? "",
      zoneId: doc.zones[0]?.id ?? "",
    });
  return (
    <div className="config-grid">
      <section className="panel config-panel">
        <span className="eyebrow">VENUE & INFRASTRUCTURE</span>
        <h3>Make the space yours.</h3>
        <label className="field">
          Edit an existing zone
          <select
            value={z.id}
            onChange={(e) => {
              const existing = doc.zones.find((z) => z.id === e.target.value);
              setZ(existing ?? { ...z, id: "" });
            }}
          >
            <option value="">Create a new zone</option>
            {doc.zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </label>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await action("zone", {
              zone: { ...z, id: z.id || crypto.randomUUID() },
            });
          }}
        >
          <div className="form-grid">
            <label className="field">
              Zone name
              <input
                required
                value={z.name}
                onChange={(e) => setZ({ ...z, name: e.target.value })}
              />
            </label>
            <label className="field">
              Use
              <select
                value={z.kind}
                onChange={(e) =>
                  setZ({ ...z, kind: e.target.value as Zone["kind"] })
                }
              >
                <option value="vendor">Market stalls</option>
                <option value="artist">Performance</option>
              </select>
            </label>
            {(["capacity", "power", "width", "depth", "x", "y"] as const).map(
              (k) => (
                <label className="field" key={k}>
                  {
                    {
                      capacity: "Guests / simultaneous stalls",
                      power: "Power, kW",
                      width: "Width, m",
                      depth: "Depth, m",
                      x: "Position X, %",
                      y: "Position Y, %",
                    }[k]
                  }
                  <input
                    required
                    type="number"
                    min={["x", "y", "power"].includes(k) ? 0 : 0.1}
                    max={["x", "y"].includes(k) ? 100 : 50000}
                    step="any"
                    value={z[k] ?? 3}
                    onChange={(e) =>
                      setZ({ ...z, [k]: Number(e.target.value) })
                    }
                  />
                </label>
              ),
            )}
          </div>
          <label className="field">
            Permitted categories, comma-separated
            <input
              value={z.allowedCategories?.join(", ") ?? ""}
              onChange={(e) =>
                setZ({
                  ...z,
                  allowedCategories: e.target.value
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={z.covered}
              onChange={(e) => setZ({ ...z, covered: e.target.checked })}
            />{" "}
            Sheltered from rain
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={z.blocked ?? false}
              onChange={(e) => setZ({ ...z, blocked: e.target.checked })}
            />{" "}
            Unavailable / blocked
          </label>
          <div className="config-actions">
            <button className="btn small" disabled={disabled}>
              Save zone <Check size={13} />
            </button>
            {z.id && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => action("removeZone", { zoneId: z.id })}
              >
                Remove empty zone
              </button>
            )}
          </div>
        </form>
        <p className="fineprint">
          Dimensions are organizer-supplied planning limits. The diagram is
          conceptual and doesn&apos;t certify safety or clearance.
        </p>
      </section>
      <section className="panel config-panel">
        <span className="eyebrow">PROGRAM & PLACEMENTS</span>
        <h3>Protect what’s already agreed.</h3>
        <label className="field">
          Program slot
          <select
            value={s.id}
            onChange={(e) =>
              setS(
                doc.slots.find((s) => s.id === e.target.value) ?? {
                  ...s,
                  id: "",
                },
              )
            }
          >
            <option value="">Create a new slot</option>
            {doc.slots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await action("slot", {
              slot: { ...s, id: s.id || crypto.randomUUID() },
            });
          }}
        >
          <div className="form-grid">
            <label className="field">
              Slot name
              <input
                required
                value={s.name}
                onChange={(e) => setS({ ...s, name: e.target.value })}
              />
            </label>
            <label className="field">
              Type
              <select
                value={s.kind}
                onChange={(e) =>
                  setS({ ...s, kind: e.target.value as Slot["kind"] })
                }
              >
                <option value="vendor">Market</option>
                <option value="artist">Performance</option>
              </select>
            </label>
            <label className="field">
              Start hour
              <input
                required
                type="number"
                min="0"
                max="23.99"
                step=".25"
                value={s.from}
                onChange={(e) => setS({ ...s, from: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              End hour
              <input
                required
                type="number"
                min=".25"
                max="24"
                step=".25"
                value={s.to}
                onChange={(e) => setS({ ...s, to: Number(e.target.value) })}
              />
            </label>
          </div>
          <div className="config-actions">
            <button className="btn small" disabled={disabled}>
              Save slot
            </button>
            {s.id && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => action("removeSlot", { slotId: s.id })}
              >
                Remove unlocked slot
              </button>
            )}
          </div>
        </form>
        <hr />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await action("assignment", { assignment });
          }}
        >
          <label className="field">
            Assign a slot
            <select
              required
              value={assignment.slotId}
              onChange={(e) =>
                setAssignment({ ...assignment, slotId: e.target.value })
              }
            >
              <option value="">Select a slot</option>
              {doc.slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            <label className="field">
              Participant
              <select
                required
                value={assignment.candidateId}
                onChange={(e) =>
                  setAssignment({ ...assignment, candidateId: e.target.value })
                }
              >
                <option value="">Select participant</option>
                {doc.candidates
                  .filter(
                    (c) =>
                      c.kind ===
                      doc.slots.find((s) => s.id === assignment.slotId)?.kind,
                  )
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="field">
              Place
              <select
                required
                value={assignment.zoneId}
                onChange={(e) =>
                  setAssignment({ ...assignment, zoneId: e.target.value })
                }
              >
                <option value="">Select place</option>
                {doc.zones
                  .filter(
                    (z) =>
                      z.kind ===
                      doc.slots.find((s) => s.id === assignment.slotId)?.kind,
                  )
                  .map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <button className="btn small" disabled={disabled}>
            <Move size={13} /> Validate & save draft
          </button>
        </form>
        {doc.draftPlan && (
          <div className="info-note">
            {doc.draftPlan.length} draft assignments. The active plan is
            unchanged.
            <button
              className="btn small"
              disabled={disabled}
              onClick={() => action("proposeDraft")}
            >
              Send draft to Decision Desk
            </button>
          </div>
        )}
        <div className="lock-list">
          {doc.plan.map((a) => (
            <div className="config-row" key={a.slotId}>
              <span>
                {doc.slots.find((s) => s.id === a.slotId)?.name}
                <small>
                  {doc.candidates.find((c) => c.id === a.candidateId)?.name}
                </small>
              </span>
              <button
                className="tiny-pill"
                disabled={disabled}
                onClick={() =>
                  action("lock", {
                    slotId: a.slotId,
                    locked: !doc.locks?.includes(a.slotId),
                  })
                }
              >
                {doc.locks?.includes(a.slotId) ? (
                  <LockKeyhole size={13} />
                ) : (
                  <Unlock size={13} />
                )}{" "}
                {doc.locks?.includes(a.slotId) ? "Locked" : "Lock"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
export function ObjectiveControls({
  doc,
  action,
  disabled,
}: {
  doc: EventDoc;
  action: Action;
  disabled: boolean;
}) {
  const [c, setC] = useState(doc.optimizer ?? defaultOptimizer);
  return (
    <details className="trace">
      <summary>Planning objectives and search limits</summary>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          action("optimizer", { optimizer: c });
        }}
      >
        <p className="fineprint">
          Version rank-v2. Scores are ordinal positions within fixed query
          pools. Weights normalize automatically and aren&apos;t attendance
          probabilities.
        </p>
        <div className="form-grid">
          {(
            [
              "relevance",
              "balance",
              "continuity",
              "stability",
              "maxNodes",
            ] as const
          ).map((k) => (
            <label key={k} className="field">
              {k}
              <input
                type="number"
                required
                min={k === "maxNodes" ? 100 : 0}
                max={k === "maxNodes" ? 50000 : 100}
                value={c[k]}
                onChange={(e) => setC({ ...c, [k]: Number(e.target.value) })}
              />
            </label>
          ))}
        </div>
        <button className="btn small" disabled={disabled}>
          Save objectives
        </button>
      </form>
    </details>
  );
}
export function OfferingEditor({
  doc,
  action,
  disabled,
}: {
  doc: EventDoc;
  action: Action;
  disabled: boolean;
}) {
  const vendors = doc.candidates.filter((c) => c.kind === "vendor");
  const [id, setId] = useState(vendors[0]?.id ?? ""),
    [offerings, setOfferings] = useState<import("@/lib/model").Offering[]>(
      vendors[0]?.offerings ?? [],
    );
  const update = (
    id: string,
    key: "name" | "available" | "allergens" | "restrictions",
    value: string | boolean,
  ) =>
    setOfferings((os) =>
      os.map((o) =>
        o.id === id
          ? {
              ...o,
              [key]:
                key === "allergens" || key === "restrictions"
                  ? String(value)
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : value,
            }
          : o,
      ),
    );
  return (
    <details className="panel config-panel">
      <summary>Organizer-declared menu inventory</summary>
      <label className="field">
        Vendor
        <select
          value={id}
          onChange={(e) => {
            setId(e.target.value);
            setOfferings(
              vendors.find((c) => c.id === e.target.value)?.offerings ?? [],
            );
          }}
        >
          {vendors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      {offerings.map((o) => (
        <div className="offering-row" key={o.id}>
          <div className="form-grid">
            <label className="field">
              Offering name
              <input
                value={o.name}
                maxLength={100}
                onChange={(e) => update(o.id, "name", e.target.value)}
              />
            </label>
            <label className="field">
              Known allergens, comma-separated
              <input
                value={o.allergens.join(", ")}
                onChange={(e) => update(o.id, "allergens", e.target.value)}
              />
            </label>
            <label className="field">
              Service restrictions
              <input
                value={o.restrictions.join(", ")}
                onChange={(e) => update(o.id, "restrictions", e.target.value)}
              />
            </label>
          </div>
          <div className="config-actions">
            <label className="check-field">
              <input
                type="checkbox"
                checked={o.available}
                onChange={(e) => update(o.id, "available", e.target.checked)}
              />{" "}
              Available
            </label>
            <button
              type="button"
              onClick={() =>
                setOfferings((os) => os.filter((x) => x.id !== o.id))
              }
            >
              Remove offering
            </button>
          </div>
        </div>
      ))}
      <div className="config-actions">
        <button
          className="btn quiet small"
          disabled={!id || disabled}
          onClick={() =>
            setOfferings((os) => [
              ...os,
              {
                id: crypto.randomUUID(),
                name: "New offering",
                available: true,
                allergens: [],
                restrictions: [],
              },
            ])
          }
        >
          Add offering
        </button>
        <button
          className="btn small"
          disabled={!id || disabled}
          onClick={() => action("offerings", { candidateId: id, offerings })}
        >
          Save declared inventory
        </button>
      </div>
      <p className="fineprint">
        Only supplied alternatives can be proposed. MEND does not infer
        ingredients or certify food safety. Unknown allergen information must be
        confirmed directly with the vendor.
      </p>
    </details>
  );
}
