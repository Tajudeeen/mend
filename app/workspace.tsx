"use client";

import Link from "next/link";
import MendMark from "@/components/mend/mark";
import { useEffect, useState, useCallback } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  LayoutDashboard,
  SlidersHorizontal,
  Users,
  Map,
  Waypoints,
  ShieldCheck,
  Plus,
  ChevronDown,
  MapPin,
  CalendarDays,
  Music2,
  Utensils,
  CloudRain,
  Check,
  Download,
  X,
  RefreshCw,
  Search,
  Loader2,
  Leaf,
  Radio,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  Menu,
} from "lucide-react";
import type {
  Assignment,
  Audit,
  Brief,
  Candidate,
  EventDoc,
  Scenario,
  Zone,
} from "@/lib/model";
import { applyCommand } from "@/lib/commands";
import {
  RosterTools,
  LayoutTools,
  ObjectiveControls,
  OfferingEditor,
} from "@/components/mend/configuration";
import SpatialCanvas from "@/components/mend/spatial-canvas";
import Reports from "@/components/mend/reports";
import AgentPanel from "@/components/mend/agent-panel";
import { sampleEvent } from "@/lib/seed";
import { effective } from "@/lib/model";
import { metrics, validate } from "@/lib/planner";
const views = [
  { id: "overview", name: "Overview", icon: LayoutDashboard },
  { id: "brief", name: "Event brief", icon: SlidersHorizontal },
  { id: "lineup", name: "Lineup & vendors", icon: Users },
  { id: "site", name: "Site plan", icon: Map },
  { id: "repair", name: "Repair studio", icon: Waypoints },
  { id: "evidence", name: "Evidence & decisions", icon: ShieldCheck },
  { id: "reports", name: "Recovery reports", icon: Download },
];
type ApiResponse = {
  event?: EventDoc;
  audit: Audit[];
  events: { id: string; name: string }[];
  qlooConfigured: boolean;
  error?: string;
  results?: { id: string; name: string; description: string }[];
};
const money = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
const pct = (v: number) => Math.round(v * 100);
function SiteMap({
  doc,
  plan = doc.plan,
  scenario = doc.scenario,
  onZone,
  large = false,
}: {
  doc: EventDoc;
  plan?: Assignment[];
  scenario?: Scenario;
  onZone?: (z: Zone) => void;
  large?: boolean;
}) {
  const closed = effective(doc, scenario).closedZones;
  return (
    <div className={"map-canvas " + (large ? "map-large" : "")}>
      <svg
        viewBox="0 0 800 430"
        role="img"
        aria-label="Conceptual event site showing stages, market zones and covered spaces. Not a surveyed floor plan."
      >
        <defs>
          <pattern
            id="dots"
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r=".8" fill="#b6bead" opacity=".5" />
          </pattern>
          <pattern
            id="hatch"
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(35)"
          >
            <path d="M0 0V7" stroke="#8e9d7a" strokeWidth="1" opacity=".3" />
          </pattern>
        </defs>
        <rect width="800" height="430" fill="#eef0e6" />
        <rect width="800" height="430" fill="url(#dots)" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={
              "M" +
              (-40 + i * 16) +
              " 410 Q 180 " +
              (400 - i * 40) +
              " 130 " +
              (190 - i * 28) +
              " T 400 " +
              (30 - i * 20) +
              " T 850 " +
              (80 - i * 20)
            }
            fill="none"
            stroke="#c6cdbb"
            strokeWidth="1"
            opacity=".7"
          />
        ))}
        <path
          d="M350 450 Q355 270 450 260 Q530 240 800 230"
          fill="none"
          stroke="#faf9f4"
          strokeWidth="45"
        />
        <path
          d="M350 450 Q355 270 450 260 Q530 240 800 230"
          fill="none"
          stroke="#d6d8cb"
          strokeWidth="1"
          strokeDasharray="4 7"
        />
        <path
          d="M50 60Q80 20 170 60T260 80L240 180Q120 210 50 160Z"
          fill="#dce3cf"
        />
        <path
          d="M500 335Q530 280 610 320T760 310L770 410H500Z"
          fill="#dde3d1"
        />
        {[
          [60, 250],
          [100, 275],
          [140, 240],
          [570, 58],
          [610, 45],
          [650, 70],
          [710, 110],
          [170, 90],
          [110, 105],
        ].map(([x, y], i) => (
          <g key={i} opacity=".7">
            <circle cx={x} cy={y} r="16" fill="#c4d2b4" />
            <circle cx={x - 5} cy={y - 6} r="12" fill="#b4c6a1" />
          </g>
        ))}
        {doc.zones.map((z, i) => {
          const count = plan.filter((a) => a.zoneId === z.id).length,
            off = closed.includes(z.id);
          const x = z.x * 8,
            y = z.y * 4.3;
          return (
            <g
              key={z.id}
              role="button"
              tabIndex={0}
              aria-label={
                z.name + (off ? ", closed" : `, ${count} assignments`)
              }
              onClick={() => onZone?.(z)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onZone?.(z);
              }}
              className="map-zone"
            >
              <rect
                x={x - 54}
                y={y - 29}
                width="108"
                height="58"
                rx="5"
                fill={
                  off ? "#e6c9bd" : z.kind === "artist" ? "#304c3a" : "#d6c39a"
                }
                stroke={
                  off ? "#b8755c" : z.kind === "artist" ? "#304c3a" : "#b6a886"
                }
                strokeWidth="1.5"
              />
              {z.covered && (
                <rect
                  x={x - 50}
                  y={y - 25}
                  width="100"
                  height="50"
                  fill="url(#hatch)"
                />
              )}
              <text
                x={x}
                y={y - 2}
                textAnchor="middle"
                fontSize="12"
                fontFamily="sans-serif"
                fill={z.kind === "artist" && !off ? "#f4f1e9" : "#354633"}
              >
                {z.kind === "artist" ? "STAGE" : "MARKET"} {i + 1}
              </text>
              <text
                x={x}
                y={y + 14}
                textAnchor="middle"
                fontSize="10"
                fontFamily="sans-serif"
                fill={z.kind === "artist" && !off ? "#d7e0c5" : "#626754"}
              >
                {off ? "CLOSED" : count + " assigned"}
              </text>
              <text
                x={x}
                y={y + 49}
                textAnchor="middle"
                fontSize="12"
                fontFamily="sans-serif"
                fill="#4d5744"
              >
                {z.name}
              </text>
            </g>
          );
        })}
        <g transform="translate(735 30)">
          <path d="M0 30V0L-5 9M0 0L5 9" fill="none" stroke="#69765e" />
          <text x="0" y="-7" textAnchor="middle" fontSize="10" fill="#69765e">
            N
          </text>
        </g>
        <text
          x="350"
          y="410"
          fontSize="10"
          textAnchor="middle"
          fill="#78816d"
          letterSpacing="2"
        >
          ENTRANCE
        </text>
        <text x="25" y="412" fontSize="9" fill="#78816d">
          CONCEPTUAL LAYOUT · NOT TO SCALE
        </text>
      </svg>
      <div className="map-key">
        <span>
          <i className="dot green" /> Performance
        </span>
        <span>
          <i className="dot tan" /> Market
        </span>
        <span>
          <i className="dot hatch" /> Covered
        </span>
      </div>
    </div>
  );
}
function AudienceBars({
  doc,
  plan = doc.plan,
}: {
  doc: EventDoc;
  plan?: Assignment[];
}) {
  const m = metrics(doc, plan);
  return (
    <div className="audience-bars">
      {doc.brief.cohorts.map((c, i) => (
        <div key={c.id}>
          <div>
            <span>{c.name}</span>
            <small>
              {m.unknowns.some((s) => s.startsWith("Missing"))
                ? "Awaiting evidence"
                : `${pct(m.cohorts[c.id])}/100`}
            </small>
          </div>
          <div className="bar-track">
            <div
              style={{
                width: m.unknowns.some((s) => s.startsWith("Missing"))
                  ? "0"
                  : pct(m.cohorts[c.id]) + "%",
                background: ["#5b7950", "#a1b482", "#c5a579"][i],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
function DownloadButton({ doc, audit }: { doc: EventDoc; audit: Audit[] }) {
  return (
    <button
      className="btn quiet"
      onClick={async () => {
        let revisions: EventDoc[] = [];
        if (doc.revision >= 0) {
          try {
            const response = await fetch(
              "/api/mend?id=" + doc.id + "&history=1",
            );
            if (response.ok) {
              const history = (await response.json()) as {
                revisions: EventDoc[];
              };
              revisions = history.revisions ?? [];
            }
          } catch {}
        }
        const blob = new Blob(
          [
            JSON.stringify(
              {
                format: "mend-evidence-bundle-v1",
                revisions,
                exportedAt: new Date().toISOString(),
                event: doc,
                audit,
                disclosure:
                  "Demo scores are synthetic. Qloo scores are query-relative, not outcome predictions. Audit history is application-level, not independently immutable.",
              },
              null,
              2,
            ),
          ],
          { type: "application/json" },
        );
        const url = URL.createObjectURL(blob),
          a = document.createElement("a");
        a.href = url;
        a.download = "mend-" + doc.id + ".json";
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      <Download size={15} /> Export evidence
    </button>
  );
}
export default function Workspace({
  demo = false,
  eventId,
  initialView = "overview",
}: {
  demo?: boolean;
  eventId?: string;
  initialView?: string;
}) {
  const [doc, setDoc] = useState<EventDoc>(() =>
      sampleEvent("00000000-0000-4000-8000-000000000001"),
    ),
    [audit, setAudit] = useState<Audit[]>([]),
    [persisted, setPersisted] = useState(demo),
    [view, setView] = useState(initialView),
    [busy, setBusy] = useState(""),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [configured, setConfigured] = useState(false),
    [events, setEvents] = useState<{ id: string; name: string }[]>([]),
    [menu, setMenu] = useState(false),
    [mobile, setMobile] = useState(false),
    [zone, setZone] = useState<Zone | null>(null),
    [editor, setEditor] = useState<Candidate | null>(null),
    [resolver, setResolver] = useState<{
      candidateId?: string;
      cohortId?: string;
      kind: "artist" | "vendor";
    } | null>(null);
  const closeEditor = useCallback(() => setEditor(null), []);
  const closeResolver = useCallback(() => setResolver(null), []);
  const [scenario, setScenario] = useState<Scenario>({
      type: "cancellation",
      candidateId: "a1",
    }),
    [budget, setBudget] = useState(5000),
    [searchText, setSearchText] = useState(""),
    [results, setResults] = useState<
      { id: string; name: string; description?: string }[]
    >([]);
  function navigate(id: string) {
    setView(id);
    setMobile(false);
    const u = new URL(location.href);
    u.searchParams.set("view", id);
    history.pushState({}, "", u);
  }
  const load = useCallback(async function load(id: string) {
    setBusy("load");
    setError("");
    try {
      const r = await fetch("/api/mend?id=" + id),
        data = (await r.json()) as ApiResponse;
      if (!r.ok) throw new Error(data.error ?? "Request failed");
      setDoc(data.event!);
      setAudit(data.audit);
      setConfigured(data.qlooConfigured);
      setPersisted(true);
      const u = new URL(location.href);
      u.searchParams.set("event", id);
      history.replaceState({}, "", u);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }, []);
  useEffect(() => {
    const u = new URL(location.href);
    const v = u.searchParams.get("view");
    if (views.some((x) => x.id === v)) setView(v!);
    function pop() {
      setView(new URL(location.href).searchParams.get("view") ?? "overview");
    }
    window.addEventListener("popstate", pop);
    if (!demo)
      fetch("/api/mend")
        .then(async (r) => {
          const data = (await r.json()) as ApiResponse;
          if (r.ok) {
            setEvents(data.events);
            setConfigured(data.qlooConfigured);
            const id =
              eventId ?? u.searchParams.get("event") ?? data.events[0]?.id;
            if (id) await load(id);
          }
        })
        .catch(() =>
          setError("Could not reach the server. The unsaved demo is visible."),
        );
    return () => window.removeEventListener("popstate", pop);
  }, [demo, eventId, load]);
  async function action(action: string, extra: Record<string, unknown> = {}) {
    if (busy) return;
    setBusy(action);
    setError("");
    setNotice("");
    try {
      if (demo) {
        if (action === "create") {
          setDoc(sampleEvent());
          setAudit([]);
          return { event: doc } as ApiResponse;
        }
        if (
          ["search", "resolve", "evidence", "clearSeeds", "mode"].includes(
            action,
          )
        )
          throw new Error(
            "Live cultural operations require your saved workspace and configured credentials.",
          );
        const result = applyCommand(doc, action, extra);
        result.event.revision = doc.revision + 1;
        setDoc(result.event);
        setAudit((a) => [
          {
            id: crypto.randomUUID(),
            eventId: doc.id,
            revision: result.event.revision,
            action,
            detail: result.detail,
            actor: "Demo visitor",
            at: new Date().toISOString(),
          },
          ...a,
        ]);
        setNotice(result.detail);
        return { event: result.event } as ApiResponse;
      }
      const r = await fetch("/api/mend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          requestKey: crypto.randomUUID(),
          id: doc.id,
          revision: doc.revision,
          ...extra,
        }),
      });
      const data = (await r.json()) as ApiResponse;
      if (!r.ok) throw new Error(data.error ?? "Request failed");
      if (data.event) {
        setDoc(data.event!);
        setAudit(data.audit);
        setPersisted(true);
        if (action === "create") {
          setEvents((es) => [
            { id: data.event!.id, name: data.event!.brief.name },
            ...es,
          ]);
          const u = new URL(location.href);
          u.searchParams.set("event", data.event.id);
          history.replaceState({}, "", u);
        }
        setNotice(
          action === "propose"
            ? "Options ready. Review them before applying a change."
            : action === "approve"
              ? "Plan updated. Your approval is recorded."
              : "Saved to your workspace.",
        );
      }
      return data;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setBusy("");
    }
  }
  const m = metrics(doc, doc.plan),
    violations = validate(doc, doc.plan),
    rules = effective(doc, doc.scenario),
    p = doc.proposal;
  const selected = doc.plan.map((a) => ({
    ...a,
    c: doc.candidates.find((c) => c.id === a.candidateId)!,
    s: doc.slots.find((s) => s.id === a.slotId)!,
  }));
  const run = () =>
    action("propose", {
      scenario:
        scenario.type === "budget" ? { type: "budget", budget } : scenario,
    });
  return (
    <div className="shell">
      <aside className={"sidebar " + (mobile ? "open" : "")}>
        <Link href="/" className="brand" aria-label="MEND home">
          <MendMark />
        </Link>
        <div className="workspace-label">THE ORGANIZER&apos;S WORKSPACE</div>
        <div className="event-switch">
          <button onClick={() => setMenu(!menu)}>
            <span className="event-icon">
              <Leaf size={18} />
            </span>
            <span>
              {doc.brief.name}
              <small>Music & culture market</small>
            </span>
            <ChevronDown size={14} />
          </button>
          {menu && (
            <div className="event-menu">
              {events.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    load(e.id);
                    setMenu(false);
                  }}
                >
                  {e.name}
                </button>
              ))}
              <button
                onClick={() => {
                  action("create");
                  setMenu(false);
                }}
              >
                <Plus size={14} /> New demo event
              </button>
            </div>
          )}
        </div>
        <nav aria-label="Workspace">
          {views.map((v) => (
            <button
              key={v.id}
              className={view === v.id ? "active" : ""}
              onClick={() => navigate(v.id)}
            >
              <v.icon size={18} />
              {v.name}
              {v.id === "repair" && <span className="nav-tag">TRY IT</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <div className="note-orbit">
              <Waypoints size={20} />
            </div>
            <p>
              A change of plan.
              <br />
              The same good feeling.
            </p>
            <span>Thoughtful recovery starts here.</span>
          </div>
          <div className="account">
            <span className="avatar">{demo ? "D" : "M"}</span>
            <span>
              {demo ? "Demo visitor" : "Organizer"}
              <small>
                {demo ? "No account required" : "Your private events"}
              </small>
            </span>
            <span className="online" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-toggle"
              aria-label="Open navigation"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <span className="slash">/</span>
            <span>{views.find((v) => v.id === view)?.name}</span>
          </div>
          <div className="top-actions">
            <span
              className={"mode-pill " + (doc.mode === "live" ? "live" : "")}
            >
              <i />
              {doc.mode === "demo" ? "Demo workspace" : "Live evidence mode"}
            </span>
            <Link
              href="/settings"
              className="top-avatar"
              aria-label="Organizer settings"
            >
              M
            </Link>
          </div>
        </header>
        <main>
          <div className="statusline">
            <span>
              <i className="dot green" />
              {persisted
                ? (demo
                    ? "Temporary sample session · revision "
                    : "Saved workspace · revision ") + doc.revision
                : "Sample event · not saved yet"}
            </span>
            <span>
              {doc.mode === "demo"
                ? "Fictional participants and sample affinities"
                : "Qloo affinities · booking facts supplied by organizer"}
            </span>
          </div>
          {error && (
            <div className="alert error" role="alert">
              <AlertCircle size={17} />
              <span>
                {error}{" "}
                {error.includes("Sign in") && (
                  <a href="/signin-with-chatgpt?return_to=/" target="_top">
                    Sign in
                  </a>
                )}
              </span>
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {notice && (
            <div className="alert success" role="status">
              <CheckCircle2 size={16} />
              {notice}
              <button aria-label="Dismiss notice" onClick={() => setNotice("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {!persisted && (
            <div className="start-banner">
              <span>
                Explore the sample, then save your own copy to try the planner.
              </span>
              <button
                className="btn small"
                disabled={!!busy}
                onClick={() => action("create")}
              >
                {busy === "create" ? (
                  <Loader2 className="spin" size={14} />
                ) : (
                  <Plus size={14} />
                )}{" "}
                Create my workspace
              </button>
            </div>
          )}
          {view === "overview" && (
            <>
              <section className="page-heading">
                <div>
                  <div className="eyebrow">
                    GOOD CULTURE. BETTER CONNECTIONS.
                  </div>
                  <h1>
                    Keep the feeling.
                    <br />
                    <em>Repair the plan.</em>
                  </h1>
                  <p>
                    Your event has a point of view. Let&apos;s keep it that way.
                  </p>
                </div>
                <button className="btn" onClick={() => navigate("repair")}>
                  Open repair studio <ArrowUpRight size={16} />
                </button>
              </section>
              <section className="event-hero">
                <div className="hero-text">
                  <span className="pill">THE NEXT GATHERING</span>
                  <h2>{doc.brief.name}</h2>
                  <p>{doc.brief.description}</p>
                  <div className="hero-meta">
                    <span>
                      <MapPin size={14} />
                      {doc.brief.city}
                    </span>
                    <span>
                      <CalendarDays size={14} />
                      {new Date(
                        doc.brief.date + "T12:00:00",
                      ).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>
                      <Users size={14} />
                      {doc.brief.attendees} guests
                    </span>
                  </div>
                  <button onClick={() => navigate("brief")}>
                    Shape your event <ArrowRight size={16} />
                  </button>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="orbit one" />
                  <div className="orbit two" />
                  <div className="orbit three" />
                  <div className="art-flower">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <i
                        key={i}
                        style={{
                          transform: `rotate(${i * 60}deg) translateY(-49px)`,
                        }}
                      />
                    ))}
                    <span />
                  </div>
                  <div className="art-label">
                    SOUNDS • TASTES • SHARED SPACES
                  </div>
                </div>
              </section>
              <section className="stats">
                <div>
                  <span>Program & market</span>
                  <strong>
                    {doc.plan.length}
                    <small> / {doc.slots.length} slots</small>
                  </strong>
                  <p>
                    <Music2 size={12} />{" "}
                    {doc.slots.filter((s) => s.kind === "artist").length} sets{" "}
                    <span>·</span>{" "}
                    {doc.slots.filter((s) => s.kind === "vendor").length} market
                    spots
                  </p>
                </div>
                <div>
                  <span>Planning budget</span>
                  <strong>
                    {money(m.cost)}
                    <small> / {money(rules.budget)}</small>
                  </strong>
                  <div className="budget-track">
                    <i
                      style={{
                        width:
                          Math.min(100, (m.cost / rules.budget) * 100) + "%",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <span>
                    Relative rank index{" "}
                    <small className="sample-tag">
                      {doc.mode === "demo" ? "SAMPLE" : "HEURISTIC"}
                    </small>
                  </span>
                  <strong>
                    {m.unknowns.some((s) => s.startsWith("Missing"))
                      ? "—"
                      : pct(m.weighted)}
                    <small> / 100</small>
                  </strong>
                  <p>Ordinal preference ranks, not an attendance forecast</p>
                </div>
                <div>
                  <span>Operational checks</span>
                  <strong>
                    {violations.length ? "Review needed" : "All clear"}
                    <ShieldCheck size={22} />
                  </strong>
                  <p>
                    {violations.length
                      ? violations[0]
                      : "Budget, availability, site capacity & power"}
                  </p>
                </div>
              </section>
              <div className="overview-grid">
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <span className="eyebrow">A PLACE FOR EVERYTHING</span>
                      <h3>Your gathering, mapped.</h3>
                    </div>
                    <button
                      className="icon-btn"
                      aria-label="Open site plan"
                      onClick={() => navigate("site")}
                    >
                      <ArrowUpRight size={20} />
                    </button>
                  </div>
                  <SiteMap
                    doc={doc}
                    onZone={(z) => {
                      setZone(z);
                      navigate("site");
                    }}
                  />
                  <div className="panel-foot">
                    <span>
                      {doc.zones.length} zones <span>·</span>{" "}
                      {doc.zones.filter((z) => z.covered).length} sheltered
                      spaces
                    </span>
                    <button onClick={() => navigate("site")}>
                      Explore the site <ArrowRight size={14} />
                    </button>
                  </div>
                </section>
                <section className="panel audience-panel">
                  <div className="panel-head">
                    <div>
                      <span className="eyebrow">
                        MORE THAN ONE KIND OF GOOD TASTE
                      </span>
                      <h3>Everyone has a place.</h3>
                    </div>
                  </div>
                  <p>
                    See how your mix serves each audience group, including the
                    smallest one.
                  </p>
                  <AudienceBars doc={doc} />
                  <div className="audience-note">
                    <Users size={17} />
                    <span>
                      Lowest group fit{" "}
                      <b>
                        {m.unknowns.some((s) => s.startsWith("Missing"))
                          ? "—"
                          : pct(m.floor) + "/100"}
                      </b>
                      <small>A guard against only pleasing the majority.</small>
                    </span>
                  </div>
                  <button
                    className="text-btn"
                    onClick={() => navigate("brief")}
                  >
                    Meet your audience <ArrowRight size={14} />
                  </button>
                </section>
              </div>
              <section className="repair-callout">
                <span className="callout-icon">
                  <Waypoints size={25} />
                </span>
                <div>
                  <span className="eyebrow">WHEN LIFE HAPPENS</span>
                  <h3>A cancellation shouldn&apos;t change the whole story.</h3>
                  <p>
                    Try a missing performer, a rain closure or a tighter budget.
                    Compare the repairs before making a call.
                  </p>
                </div>
                <button
                  className="btn outline"
                  onClick={() => navigate("repair")}
                >
                  Try a scenario <ArrowRight size={16} />
                </button>
              </section>
            </>
          )}
          {view === "brief" && (
            <>
              <Heading
                eyebrow="START WITH THE INTENTION"
                title="Make room for your people."
                description="Set the brief. Give each audience a voice. Keep the practical limits clear."
              />
              <BriefEditor
                key={doc.id + "-" + doc.revision}
                doc={doc}
                busy={!!busy}
                disabled={!persisted}
                save={(brief) => action("brief", { brief })}
                resolve={(cohortId) => {
                  setResolver({ cohortId, kind: "artist" });
                  setResults([]);
                  setSearchText("");
                }}
                clear={(cohortId) => action("clearSeeds", { cohortId })}
              />
            </>
          )}
          {view === "lineup" && (
            <>
              <Heading
                eyebrow="THE PEOPLE WHO MAKE IT"
                title="A mix with a point of view."
                description="Cultural fit and bookability are separate. Confirm fees, hours and availability with each participant."
              />
              <div className="section-tools">
                <span>
                  {doc.candidates.length} participants <span>·</span>{" "}
                  {selected.length} on the active plan
                </span>
                <button
                  className="btn quiet"
                  onClick={() => navigate("evidence")}
                >
                  Review evidence <ArrowUpRight size={14} />
                </button>
              </div>
              <RosterTools
                doc={doc}
                action={action}
                disabled={!!busy || !persisted}
              />
              <div className="candidate-grid">
                {doc.candidates.map((c, i) => (
                  <article className="candidate-card" key={c.id}>
                    <div
                      className="candidate-art"
                      style={{ background: c.color }}
                    >
                      <span className="candidate-type">
                        {c.kind === "artist" ? (
                          <Music2 size={14} />
                        ) : (
                          <Utensils size={14} />
                        )}{" "}
                        {c.kind === "artist" ? "PERFORMER" : "MARKET"}
                      </span>
                      <div className={"abstract abstract-" + (i % 4)}>
                        <i />
                        <i />
                        <i />
                      </div>
                      <span className="art-index">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="candidate-content">
                      <div className="candidate-title">
                        <h3>{c.name}</h3>
                        {selected.some((a) => a.candidateId === c.id) && (
                          <span className="tiny-pill">In plan</span>
                        )}
                      </div>
                      <p>{c.category}</p>
                      <div className="candidate-facts">
                        <span>{money(c.fee)}</span>
                        <span>
                          <Zap size={12} />
                          {c.power} kW
                        </span>
                        <span className={c.available ? "" : "red"}>
                          {c.available ? "Available*" : "Unavailable"}
                        </span>
                      </div>
                      <div className="candidate-disclosure">
                        {c.verified
                          ? "Organizer confirmed terms"
                          : "Terms unverified"}{" "}
                        ·{" "}
                        {c.entityId
                          ? "Qloo entity linked"
                          : "No Qloo entity linked"}
                      </div>
                      <div className="candidate-actions">
                        <button onClick={() => setEditor({ ...c })}>
                          Edit terms <ArrowRight size={13} />
                        </button>
                        <button
                          disabled={!configured || !persisted}
                          onClick={() => {
                            setResolver({ candidateId: c.id, kind: c.kind });
                            setSearchText(c.name);
                            setResults([]);
                          }}
                        >
                          Link Qloo <Search size={12} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <OfferingEditor
                doc={doc}
                action={action}
                disabled={!!busy || !persisted}
              />
              <p className="fineprint">
                * Availability is organizer-supplied. Demo participants are
                fictional. USD budgets cover participant fees only, not a full
                production budget.
              </p>
            </>
          )}
          {view === "site" && (
            <>
              <Heading
                eyebrow="SOUNDS, TASTES & SHARED SPACES"
                title="Give every moment a place."
                description="A conceptual site allocation with capacity, cover and simultaneous power checks."
              />
              <SpatialCanvas
                key={doc.id + "-" + doc.revision}
                doc={doc}
                action={action}
                disabled={!!busy || !persisted}
              />
              <div className="site-layout">
                <section className="panel">
                  <SiteMap doc={doc} large onZone={setZone} />
                </section>
                <section className="panel zone-detail">
                  <span className="eyebrow">
                    {zone ? "SELECTED ZONE" : "YOUR SITE"}
                  </span>
                  <h3>{zone?.name ?? "Five spaces. One gathering."}</h3>
                  {zone ? (
                    <>
                      <div className="zone-facts">
                        <span>
                          Use
                          <strong>
                            {zone.kind === "artist"
                              ? "Performance"
                              : "Market stalls"}
                          </strong>
                        </span>
                        <span>
                          Capacity
                          <strong>
                            {zone.capacity}{" "}
                            {zone.kind === "artist" ? "guests" : "stalls"}
                          </strong>
                        </span>
                        <span>
                          Power<strong>{zone.power} kW</strong>
                        </span>
                        <span>
                          Weather
                          <strong>
                            {zone.covered ? "Sheltered" : "Open air"}
                          </strong>
                        </span>
                      </div>
                      <h4>Assigned here</h4>
                      {selected
                        .filter((a) => a.zoneId === zone.id)
                        .map((a) => (
                          <div className="zone-person" key={a.slotId}>
                            <span>
                              {a.c.name}
                              <small>
                                {a.s.from}:00 – {a.s.to}:00
                              </small>
                            </span>
                          </div>
                        ))}
                      {!selected.some((a) => a.zoneId === zone.id) && (
                        <p>No current assignments.</p>
                      )}
                    </>
                  ) : (
                    <p>
                      Select a space on the map to see its limits and current
                      program.
                    </p>
                  )}
                  <div className="info-note">
                    Site capacities are sample assumptions. This map
                    doesn&apos;t certify access routes, sound levels or event
                    safety.
                  </div>
                </section>
              </div>
              <section className="panel program-panel">
                <div className="panel-head">
                  <h3>The running order</h3>
                  <span className="tiny-pill">Active plan</span>
                </div>
                <Program doc={doc} />
              </section>
              <LayoutTools
                key={doc.id}
                doc={doc}
                action={action}
                disabled={!!busy || !persisted}
              />
            </>
          )}
          {view === "repair" && (
            <>
              <Heading
                eyebrow="PLAN B, WITH THE SAME SOUL"
                title="Something changed. What stays?"
                description="Explore feasible repairs, see who benefits and choose what happens next."
              />
              <div className="repair-layout">
                <section className="panel scenario-panel">
                  <span className="eyebrow">01 / WHAT HAPPENED?</span>
                  <h3>Choose a disruption.</h3>
                  {[
                    {
                      type: "cancellation",
                      icon: Music2,
                      title: "A participant drops out",
                      desc: "Find a culturally compatible replacement.",
                    },
                    {
                      type: "rain",
                      icon: CloudRain,
                      title: "The weather turns",
                      desc: "Move all activity to sheltered spaces.",
                    },
                    {
                      type: "budget",
                      icon: SlidersHorizontal,
                      title: "The budget shrinks",
                      desc: "Keep the audience mix with less to spend.",
                    },
                    {
                      type: "closure",
                      icon: MapPin,
                      title: "A stall or zone closes",
                      desc: "Repair only the affected placements.",
                    },
                    {
                      type: "offering",
                      icon: Utensils,
                      title: "An offering is unavailable",
                      desc: "Use declared alternatives and allergen restrictions.",
                    },
                    {
                      type: "none",
                      icon: RefreshCw,
                      title: "Rethink the whole mix",
                      desc: "Improve the current plan within its limits.",
                    },
                  ].map((s) => (
                    <button
                      key={s.type}
                      className={
                        "scenario-choice " +
                        (scenario.type === s.type ? "chosen" : "")
                      }
                      onClick={() =>
                        setScenario(
                          s.type === "cancellation"
                            ? {
                                type: "cancellation",
                                candidateId: doc.plan[0]?.candidateId,
                              }
                            : s.type === "budget"
                              ? { type: "budget", budget }
                              : s.type === "closure"
                                ? { type: "closure", zoneId: doc.zones[0]?.id }
                                : s.type === "offering"
                                  ? {
                                      type: "offering",
                                      candidateId: doc.candidates.find(
                                        (c) => c.kind === "vendor",
                                      )?.id,
                                      offeringId: "original",
                                    }
                                  : { type: s.type as "none" | "rain" },
                        )
                      }
                    >
                      <s.icon size={20} />
                      <span>
                        {s.title}
                        <small>{s.desc}</small>
                      </span>
                      <i />
                    </button>
                  ))}
                  {scenario.type === "cancellation" && (
                    <label className="field">
                      Unavailable participant
                      <select
                        value={scenario.candidateId}
                        onChange={(e) =>
                          setScenario({
                            type: "cancellation",
                            candidateId: e.target.value,
                          })
                        }
                      >
                        {doc.candidates.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {scenario.type === "closure" && (
                    <label className="field">
                      Unavailable space
                      <select
                        value={scenario.zoneId}
                        onChange={(e) =>
                          setScenario({
                            type: "closure",
                            zoneId: e.target.value,
                          })
                        }
                      >
                        {doc.zones.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {scenario.type === "offering" && (
                    <>
                      <label className="field">
                        Affected vendor
                        <select
                          value={scenario.candidateId}
                          onChange={(e) =>
                            setScenario({
                              ...scenario,
                              candidateId: e.target.value,
                              offeringId: doc.candidates.find(
                                (c) => c.id === e.target.value,
                              )?.offerings?.[0]?.id,
                            })
                          }
                        >
                          {doc.candidates
                            .filter((c) => c.kind === "vendor")
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label className="field">
                        Unavailable offering
                        <select
                          value={scenario.offeringId}
                          onChange={(e) =>
                            setScenario({
                              ...scenario,
                              offeringId: e.target.value,
                            })
                          }
                        >
                          {doc.candidates
                            .find((c) => c.id === scenario.candidateId)
                            ?.offerings?.map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.name}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label className="field">
                        Exclude allergens, comma-separated
                        <input
                          value={scenario.excludedAllergens?.join(", ") ?? ""}
                          onChange={(e) =>
                            setScenario({
                              ...scenario,
                              excludedAllergens: e.target.value
                                .split(",")
                                .map((v) => v.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                      </label>
                    </>
                  )}
                  {scenario.type === "budget" && (
                    <label className="field">
                      New fee budget, USD
                      <input
                        type="number"
                        min="100"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                      />
                    </label>
                  )}
                  <button
                    className="btn wide"
                    disabled={!!busy || !persisted}
                    onClick={run}
                  >
                    {busy === "propose" ? (
                      <Loader2 size={17} className="spin" />
                    ) : (
                      <Waypoints size={17} />
                    )}{" "}
                    Find a thoughtful repair <ArrowRight size={16} />
                  </button>
                  <ObjectiveControls
                    key={doc.id}
                    doc={doc}
                    action={action}
                    disabled={!!busy || !persisted}
                  />
                  <p className="fineprint">
                    The planner proposes. You decide. No performers are
                    contacted and no bookings are made.
                  </p>
                </section>
                <section className="repair-results">
                  <AgentPanel
                    doc={doc}
                    demo={demo}
                    onSaved={(d, a) => {
                      setDoc(d);
                      if (a) setAudit(a);
                    }}
                  />
                  <div className="section-label">
                    <span className="eyebrow">
                      02 / COMPARE THE POSSIBILITIES
                    </span>
                    <span>
                      {p?.status === "pending"
                        ? "Awaiting your decision"
                        : (p?.status ?? "Ready when you are")}
                    </span>
                  </div>
                  {!p ? (
                    <div className="empty-state">
                      <div className="empty-orbit">
                        <Waypoints size={36} />
                      </div>
                      <h3>The feeling is worth keeping.</h3>
                      <p>
                        Run a scenario to see three possible repairs, with the
                        tradeoffs out in the open.
                      </p>
                      <div className="empty-checks">
                        <span>
                          <Check size={13} /> Practical constraints
                        </span>
                        <span>
                          <Check size={13} /> Audience balance
                        </span>
                        <span>
                          <Check size={13} /> Your approval
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="run-summary">
                        <span>
                          <Radio size={14} />{" "}
                          {p.mode === "demo"
                            ? "Sample-data planner"
                            : "Qloo-grounded planner"}
                        </span>
                        <span>
                          {p.examined.toLocaleString()} assignments examined ·{" "}
                          {p.durationMs} ms
                        </span>
                      </div>
                      {!p.options.length && (
                        <div className="alert error">
                          <AlertCircle size={18} />
                          <span>
                            No feasible repair. Try a higher budget or revise
                            the participant roster. The current plan is
                            unchanged.
                          </span>
                        </div>
                      )}
                      {p.options.map((o, i) => (
                        <article
                          className={
                            "option-card " + (i === 0 ? "recommended" : "")
                          }
                          key={o.id}
                        >
                          <div className="option-head">
                            <span className="eyebrow">
                              OPTION {i + 1} /{" "}
                              {i === 0
                                ? "HIGHEST PLANNER SCORE"
                                : "ALTERNATIVE MIX"}
                            </span>
                            <span className="tiny-pill">
                              <ShieldCheck size={12} />{" "}
                              {o.conditional
                                ? "Terms need confirmation"
                                : "Constraints passed"}
                            </span>
                          </div>
                          <h3>
                            {i === 0
                              ? "Keep the thread."
                              : i === 1
                                ? "A different rhythm."
                                : "Make space for discovery."}
                          </h3>
                          <div className="option-metrics">
                            <span>
                              <small>Fee budget</small>
                              <b>{money(o.metrics.cost)}</b>
                              <em>
                                {money(
                                  effective(doc, p.scenario).budget -
                                    o.metrics.cost,
                                )}{" "}
                                headroom
                              </em>
                            </span>
                            <span>
                              <small>Audience fit</small>
                              <b>
                                {pct(o.metrics.weighted)}
                                <em>/100</em>
                              </b>
                              <em>
                                Current{" "}
                                {m.unknowns.some((s) => s.startsWith("Missing"))
                                  ? "—"
                                  : pct(m.weighted)}
                              </em>
                            </span>
                            <span>
                              <small>Continuity</small>
                              <b>
                                {pct(o.metrics.continuity)}
                                <em>/100</em>
                              </b>
                              <em>{o.metrics.changes} slot changes</em>
                            </span>
                          </div>
                          {o.offeringChange && (
                            <div className="info-note">
                              Declared offering substitution:{" "}
                              {
                                doc.candidates
                                  .find(
                                    (c) =>
                                      c.id === o.offeringChange!.candidateId,
                                  )
                                  ?.offerings?.find(
                                    (v) => v.id === o.offeringChange!.from,
                                  )?.name
                              }{" "}
                              →{" "}
                              {
                                doc.candidates
                                  .find(
                                    (c) =>
                                      c.id === o.offeringChange!.candidateId,
                                  )
                                  ?.offerings?.find(
                                    (v) => v.id === o.offeringChange!.to,
                                  )?.name
                              }
                              . Ingredients are organizer supplied.
                            </div>
                          )}
                          <div className="changes">
                            {o.assignments
                              .filter((a) => {
                                const b = doc.plan.find(
                                  (x) => x.slotId === a.slotId,
                                );
                                return (
                                  b?.candidateId !== a.candidateId ||
                                  b?.zoneId !== a.zoneId
                                );
                              })
                              .map((a) => {
                                const old = doc.plan.find(
                                    (x) => x.slotId === a.slotId,
                                  ),
                                  c = doc.candidates.find(
                                    (c) => c.id === a.candidateId,
                                  )!,
                                  z = doc.zones.find((z) => z.id === a.zoneId)!;
                                return (
                                  <div key={a.slotId}>
                                    <ArrowRight size={13} />
                                    <span>
                                      {
                                        doc.candidates.find(
                                          (c) => c.id === old?.candidateId,
                                        )?.name
                                      }{" "}
                                      → <b>{c.name}</b>
                                      <small>
                                        {
                                          doc.slots.find(
                                            (s) => s.id === a.slotId,
                                          )?.name
                                        }{" "}
                                        · {z.name}
                                      </small>
                                    </span>
                                  </div>
                                );
                              })}
                            {o.metrics.changes === 0 && (
                              <p>
                                The current assignment is the planner&apos;s
                                best fit within these limits.
                              </p>
                            )}
                          </div>
                          <AudienceBars doc={doc} plan={o.assignments} />
                          <div className="option-bottom">
                            <span>
                              {doc.mode === "demo"
                                ? "Synthetic affinities. Unverified terms."
                                : `${doc.candidates.filter((c) => o.assignments.some((a) => a.candidateId === c.id) && !c.verified).length} participants have unverified booking terms.`}
                            </span>
                            <button
                              className="btn small"
                              disabled={
                                !!busy ||
                                p.status !== "pending" ||
                                (doc.mode === "live" && o.conditional)
                              }
                              onClick={() =>
                                action("approve", { optionId: o.id })
                              }
                            >
                              {p.selectedId === o.id
                                ? "Applied"
                                : p.status === "pending"
                                  ? "Approve this repair"
                                  : p.status === "rejected"
                                    ? "Rejected"
                                    : "Closed"}{" "}
                              <Check size={14} />
                            </button>
                          </div>
                        </article>
                      ))}
                      {p.status === "pending" && (
                        <button
                          className="text-btn"
                          disabled={!!busy}
                          onClick={() => action("reject")}
                        >
                          Reject proposal and keep the active plan
                        </button>
                      )}
                      <details className="trace">
                        <summary>
                          See the planner&apos;s steps <ChevronDown size={14} />
                        </summary>
                        {p.trace.map((t, i) => (
                          <div key={t.tool}>
                            <span>{String(i + 1).padStart(2, "0")}</span>
                            <section>
                              <h4>{t.tool.replaceAll("_", " ")}</h4>
                              <p>{t.detail}</p>
                            </section>
                          </div>
                        ))}
                      </details>
                    </>
                  )}
                </section>
              </div>
            </>
          )}
          {view === "reports" && <Reports doc={doc} />}
          {view === "evidence" && (
            <>
              <Heading
                eyebrow="SHOW YOUR WORK"
                title="Every decision leaves a thread."
                description="Keep source receipts, planner logic and human decisions together."
              />
              <div className="section-tools">
                <span>Evidence belongs to this event and its revisions.</span>
                <DownloadButton doc={doc} audit={audit} />
              </div>
              <div className="evidence-grid">
                <section className="panel integration-panel">
                  <div className="panel-head">
                    <h3>Cultural intelligence</h3>
                    <span
                      className={"tiny-pill " + (configured ? "" : "amber")}
                    >
                      {configured ? "Key configured" : "Key needed"}
                    </span>
                  </div>
                  <p>
                    Qloo supplies preference affinities. Organizers supply fees,
                    availability and site facts.
                  </p>
                  <div className="mode-switch">
                    <button
                      className={doc.mode === "demo" ? "selected" : ""}
                      disabled={!!busy || !persisted}
                      onClick={() => action("mode", { mode: "demo" })}
                    >
                      Sample data
                    </button>
                    <button
                      className={doc.mode === "live" ? "selected" : ""}
                      disabled={!!busy || !persisted}
                      onClick={() => action("mode", { mode: "live" })}
                    >
                      Live Qloo
                    </button>
                  </div>
                  <div className="info-note">
                    {configured
                      ? "Resolve the roster and audience seeds, then fetch each audience/domain batch."
                      : "The live integration needs a server-side QLOO_API_KEY. No Qloo calls or real-world impact have been verified yet."}
                  </div>
                  <h4>Evidence batches</h4>
                  {doc.brief.cohorts.map((co) => (
                    <div className="batch-row" key={co.id}>
                      <span>
                        {co.name}
                        <small>{co.seeds.length} resolved interests</small>
                      </span>
                      <div>
                        {(["artist", "vendor"] as const).map((kind) => (
                          <button
                            disabled={
                              !!busy ||
                              !configured ||
                              !persisted ||
                              doc.mode !== "live"
                            }
                            key={kind}
                            onClick={() =>
                              action("evidence", { cohortId: co.id, kind })
                            }
                          >
                            {doc.evidence.some(
                              (e) => e.kind === kind && e.cohortId === co.id,
                            ) ? (
                              <Check size={12} />
                            ) : (
                              <RefreshCw size={12} />
                            )}{" "}
                            {kind === "artist" ? "Music" : "Food"}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <p className="fineprint">
                    Affinities are query-relative. The cross-group fit index is
                    an explicit planning heuristic. It isn&apos;t a measure of
                    attendance, cultural identity or guaranteed demand.
                  </p>
                </section>
                <section className="panel integration-panel">
                  <span className="eyebrow">WHAT WE CAN PROVE TODAY</span>
                  <h3>Built with the limits visible.</h3>
                  <ul className="proof-list">
                    <li>
                      <CheckCircle2 size={17} />
                      <span>
                        Constraint-aware planning
                        <small>
                          Budget, availability, zone type, power and capacity.
                        </small>
                      </span>
                    </li>
                    <li>
                      <CheckCircle2 size={17} />
                      <span>
                        Human approval before change
                        <small>
                          Proposals never replace the active plan automatically.
                        </small>
                      </span>
                    </li>
                    <li>
                      <CheckCircle2 size={17} />
                      <span>
                        Server-persisted decisions
                        <small>
                          Per-user records, revision checks and an audit trail.
                        </small>
                      </span>
                    </li>
                    <li>
                      <Clock size={17} />
                      <span>
                        Live cultural validation
                        <small>
                          {doc.evidence.length
                            ? doc.evidence.length + " Qloo batches saved."
                            : "Waiting for Qloo credentials and live API verification."}
                        </small>
                      </span>
                    </li>
                    <li>
                      <Clock size={17} />
                      <span>
                        Real-world impact
                        <small>
                          No organizer study or measured attendance claim yet.
                        </small>
                      </span>
                    </li>
                  </ul>
                </section>
              </div>
              {doc.evidence.map((e) => (
                <details className="receipt" key={e.id}>
                  <summary>
                    <ShieldCheck size={17} />
                    <span>
                      Qloo receipt · {e.kind} ·{" "}
                      {doc.brief.cohorts.find((c) => c.id === e.cohortId)?.name}
                      <small>{new Date(e.at).toLocaleString()}</small>
                    </span>
                    <ChevronDown size={16} />
                  </summary>
                  <pre>{JSON.stringify(e, null, 2)}</pre>
                </details>
              ))}
              <section className="panel audit-panel">
                <div className="panel-head">
                  <h3>The decision trail</h3>
                  <span>{audit.length} entries</span>
                </div>
                {!audit.length ? (
                  <div className="audit-empty">
                    Save a workspace to begin recording decisions.
                  </div>
                ) : (
                  audit.map((a) => (
                    <div className="audit-row" key={a.id}>
                      <span className="audit-marker">
                        <Check size={13} />
                      </span>
                      <div>
                        <h4>
                          {a.action.replaceAll(".", " ").replaceAll("_", " ")}
                          <span>r{a.revision}</span>
                        </h4>
                        <p>{a.detail}</p>
                        <small>{new Date(a.at).toLocaleString()}</small>
                      </div>
                    </div>
                  ))
                )}
                <p className="fineprint">
                  Application audit records support review. They aren&apos;t an
                  independently immutable ledger. Exports contain user-supplied
                  event information.
                </p>
              </section>
            </>
          )}
          <footer>
            <span className="footer-brand" role="img" aria-label="MEND">
              <MendMark />
            </span>
            <span>Culture is the connection. Keep it together.</span>
            <span>
              {doc.mode === "demo"
                ? "DEMO / FICTIONAL DATA"
                : "LIVE / QUERY-RELATIVE EVIDENCE"}
            </span>
          </footer>
        </main>
      </div>
      {busy && (
        <div className="working" role="status">
          <Loader2 size={15} className="spin" />
          {busy === "propose" ? "Finding feasible repairs…" : "Working…"}
        </div>
      )}
      {editor && (
        <Modal title="Participant details" close={closeEditor}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const data = await action("candidate", {
                candidateId: editor.id,
                fields: {
                  name: editor.name,
                  category: editor.category,
                  fee: editor.fee,
                  feeKnown: editor.feeKnown ?? true,
                  availabilityKnown: editor.availabilityKnown ?? true,
                  width: editor.width ?? 2,
                  depth: editor.depth ?? 2,
                  power: editor.power,
                  available: editor.available,
                  verified: editor.verified,
                  from: editor.from,
                  to: editor.to,
                },
              });
              if (data) setEditor(null);
            }}
          >
            <p className="modal-note">
              Confirm these details directly with the participant. Qloo
              doesn&apos;t verify booking availability or fees.
            </p>
            {(["name", "category"] as const).map((k) => (
              <label className="field" key={k}>
                {k}
                <input
                  required
                  maxLength={100}
                  value={editor[k]}
                  onChange={(e) =>
                    setEditor({ ...editor, [k]: e.target.value })
                  }
                />
              </label>
            ))}
            <div className="form-grid">
              {(["fee", "power", "from", "to"] as const).map((k) => (
                <label className="field" key={k}>
                  {k === "fee"
                    ? "Fee, USD"
                    : k === "power"
                      ? "Power, kW"
                      : k === "from"
                        ? "Available from, hour"
                        : "Available until, hour"}
                  <input
                    required
                    type="number"
                    min="0"
                    max={k === "from" || k === "to" ? 24 : 10000000}
                    value={editor[k]}
                    onChange={(e) =>
                      setEditor({ ...editor, [k]: Number(e.target.value) })
                    }
                  />
                </label>
              ))}
            </div>
            <label className="check-field">
              <input
                type="checkbox"
                checked={editor.feeKnown ?? true}
                onChange={(e) =>
                  setEditor({ ...editor, feeKnown: e.target.checked })
                }
              />{" "}
              Fee is known
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                checked={editor.availabilityKnown ?? true}
                onChange={(e) =>
                  setEditor({ ...editor, availabilityKnown: e.target.checked })
                }
              />{" "}
              Availability is known
            </label>
            <div className="form-grid">
              {(["width", "depth"] as const).map((k) => (
                <label className="field" key={k}>
                  {k}, meters
                  <input
                    type="number"
                    min=".1"
                    step=".1"
                    value={editor[k] ?? 2}
                    onChange={(e) =>
                      setEditor({ ...editor, [k]: Number(e.target.value) })
                    }
                  />
                </label>
              ))}
            </div>
            <label className="check-field">
              <input
                type="checkbox"
                checked={editor.available}
                onChange={(e) =>
                  setEditor({ ...editor, available: e.target.checked })
                }
              />{" "}
              Available for this event
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                checked={editor.verified}
                onChange={(e) =>
                  setEditor({ ...editor, verified: e.target.checked })
                }
              />{" "}
              I confirmed these terms with the participant
            </label>
            <button className="btn wide" disabled={!!busy || !persisted}>
              Save participant <Check size={14} />
            </button>
          </form>
        </Modal>
      )}
      {resolver && (
        <Modal
          title={
            resolver.cohortId
              ? "Add an audience interest"
              : "Link a Qloo entity"
          }
          close={closeResolver}
        >
          <p className="modal-note">
            Choose the exact entity. A cultural match doesn&apos;t confirm
            booking terms or local availability.
          </p>
          <form
            className="search-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const data = await action("search", {
                query: searchText,
                kind: resolver.kind,
              });
              if (data) setResults(data.results ?? []);
            }}
          >
            <input
              autoFocus
              aria-label="Entity name"
              placeholder="Search an artist or place…"
              minLength={2}
              required
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button className="btn" disabled={!!busy || !configured}>
              <Search size={16} />
            </button>
          </form>
          <div className="search-results">
            {results.map((r) => (
              <button
                key={r.id}
                disabled={!!busy}
                onClick={async () => {
                  const data = await action("resolve", {
                    ...resolver,
                    entity: { id: r.id, name: r.name },
                  });
                  if (data) setResolver(null);
                }}
              >
                <span>
                  {r.name}
                  <small>{r.description || r.id}</small>
                </span>
                <Plus size={16} />
              </button>
            ))}
          </div>
          {!configured && (
            <div className="info-note">
              Qloo credentials haven&apos;t been configured yet.
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-heading subpage">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
function Program({ doc }: { doc: EventDoc }) {
  return (
    <div className="program">
      {doc.plan.map((a) => {
        const c = doc.candidates.find((c) => c.id === a.candidateId)!,
          s = doc.slots.find((s) => s.id === a.slotId)!,
          z = doc.zones.find((z) => z.id === a.zoneId)!;
        return (
          <div className="program-row" key={a.slotId}>
            <span className="program-time">
              {s.from}:00<small>{s.to}:00</small>
            </span>
            <span className="program-icon" style={{ background: c.color }}>
              {c.kind === "artist" ? (
                <Music2 size={20} />
              ) : (
                <Utensils size={20} />
              )}
            </span>
            <span>
              <b>{c.name}</b>
              <small>
                {s.name} · {c.category}
              </small>
            </span>
            <span className="program-zone">
              <MapPin size={13} />
              {z.name}
            </span>
            <span>{money(c.fee)}</span>
          </div>
        );
      })}
    </div>
  );
}
function BriefEditor({
  doc,
  busy,
  disabled,
  save,
  resolve,
  clear,
}: {
  doc: EventDoc;
  busy: boolean;
  disabled: boolean;
  save: (b: Brief) => void;
  resolve: (id: string) => void;
  clear: (id: string) => void;
}) {
  const [b, setB] = useState(doc.brief);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(b);
      }}
    >
      <div className="brief-layout">
        <section className="panel form-panel">
          <span className="eyebrow">01 / THE GATHERING</span>
          <h3>A few things to build around.</h3>
          <label className="field">
            Event name
            <input
              required
              minLength={2}
              maxLength={100}
              value={b.name}
              onChange={(e) => setB({ ...b, name: e.target.value })}
            />
          </label>
          <div className="form-grid">
            <label className="field">
              City
              <input
                required
                minLength={2}
                maxLength={80}
                value={b.city}
                onChange={(e) => setB({ ...b, city: e.target.value })}
              />
            </label>
            <label className="field">
              Event date
              <input
                required
                type="date"
                value={b.date}
                onChange={(e) => setB({ ...b, date: e.target.value })}
              />
            </label>
            <label className="field">
              Participant fee budget, USD
              <input
                type="number"
                required
                min="100"
                max="10000000"
                value={b.budget}
                onChange={(e) => setB({ ...b, budget: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              Expected guests
              <input
                type="number"
                required
                min="1"
                max="50000"
                value={b.attendees}
                onChange={(e) =>
                  setB({ ...b, attendees: Number(e.target.value) })
                }
              />
            </label>
          </div>
          <label className="field">
            What should the event feel like?
            <textarea
              rows={4}
              maxLength={1500}
              value={b.description}
              onChange={(e) => setB({ ...b, description: e.target.value })}
            />
          </label>
          <div className="info-note">
            Fee budgets exclude security, venue hire, production and other
            operating costs.
          </div>
        </section>
        <section className="panel form-panel">
          <span className="eyebrow">02 / THE PEOPLE</span>
          <h3>A shared space. Different tastes.</h3>
          <p>
            Weights express your intended audience mix. They normalize
            automatically when the planner runs.
          </p>
          {b.cohorts.map((c, i) => (
            <div className="cohort-editor" key={c.id}>
              <div className="cohort-top">
                <span className={"cohort-number n" + i}>0{i + 1}</span>
                <label className="field">
                  Audience group
                  <input
                    required
                    value={c.name}
                    maxLength={60}
                    onChange={(e) =>
                      setB({
                        ...b,
                        cohorts: b.cohorts.map((co) =>
                          co.id === c.id ? { ...co, name: e.target.value } : co,
                        ),
                      })
                    }
                  />
                </label>
                <label className="field weight-field">
                  Weight
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={c.weight}
                    onChange={(e) =>
                      setB({
                        ...b,
                        cohorts: b.cohorts.map((co) =>
                          co.id === c.id
                            ? { ...co, weight: Number(e.target.value) }
                            : co,
                        ),
                      })
                    }
                  />
                </label>
              </div>
              <div className="seed-chips">
                {c.seeds.length ? (
                  c.seeds.map((s) => <span key={s.id}>{s.name}</span>)
                ) : (
                  <small>No Qloo interests resolved yet.</small>
                )}
              </div>
              <div className="cohort-actions">
                <button
                  type="button"
                  disabled={disabled || busy}
                  onClick={() => resolve(c.id)}
                >
                  <Plus size={12} /> Add Qloo interest
                </button>
                {c.seeds.length > 0 && (
                  <button
                    type="button"
                    disabled={disabled || busy}
                    onClick={() => clear(c.id)}
                  >
                    Clear interests
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
      <div className="save-bar">
        <span>
          Saving a changed brief clears old evidence and pending proposals.
        </span>
        <button className="btn" disabled={busy || disabled}>
          Save event brief <Check size={15} />
        </button>
      </div>
    </form>
  );
}
function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const modal = document.querySelector('[role="dialog"]');
        const items = Array.from(
          modal?.querySelectorAll<HTMLElement>(
            "button:not(:disabled),input:not(:disabled),select,textarea,a[href]",
          ) ?? [],
        );
        if (!items.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    const first = document.querySelector<HTMLElement>('[role="dialog"] button');
    first?.focus();
    return () => {
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [close]);
  return (
    <div className="modal-backdrop" onClick={close}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-heading">
          <h3>{title}</h3>
          <button aria-label="Close dialog" onClick={close}>
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
