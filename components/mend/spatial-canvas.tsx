"use client";
import { useRef, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Check } from "lucide-react";
import type { EventDoc } from "@/lib/model";
export default function SpatialCanvas({
  doc,
  action,
  disabled,
}: {
  doc: EventDoc;
  action: (a: string, b?: Record<string, unknown>) => Promise<unknown>;
  disabled: boolean;
}) {
  const [zones, setZones] = useState(doc.zones),
    [scale, setScale] = useState(1),
    [pan, setPan] = useState({ x: 0, y: 0 }),
    [selected, setSelected] = useState<string>(),
    [dirty, setDirty] = useState(false),
    [message, setMessage] = useState("");
  const svg = useRef<SVGSVGElement>(null),
    drag = useRef<{
      id?: string;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
    } | null>(null);
  const locked = (id: string) =>
    doc.plan.some((a) => a.zoneId === id && doc.locks?.includes(a.slotId));
  function move(id: string, x: number, y: number) {
    if (locked(id)) {
      setMessage("Unlock placements in this zone before moving its geometry.");
      return;
    }
    setZones((zs) =>
      zs.map((z) =>
        z.id === id
          ? {
              ...z,
              x: Math.max(5, Math.min(95, x)),
              y: Math.max(8, Math.min(90, y)),
            }
          : z,
      ),
    );
    setDirty(true);
  }
  return (
    <section className="panel spatial-panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">FLOORPLAN STUDIO</span>
          <h3>Move the pieces, keep the promises.</h3>
        </div>
        <div className="spatial-toolbar">
          <button
            aria-label="Zoom out"
            onClick={() => setScale((v) => Math.max(0.6, v - 0.2))}
          >
            <ZoomOut size={18} />
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button
            aria-label="Zoom in"
            onClick={() => setScale((v) => Math.min(2.5, v + 0.2))}
          >
            <ZoomIn size={18} />
          </button>
          <button
            aria-label="Undo uncommitted layout edits"
            onClick={() => {
              setZones(doc.zones);
              setPan({ x: 0, y: 0 });
              setScale(1);
              setDirty(false);
            }}
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </div>
      <svg
        ref={svg}
        viewBox="0 0 900 500"
        className="spatial-svg"
        role="group"
        aria-label="Editable conceptual venue layout. Select a zone and use arrow keys to move it. Drag empty space to pan."
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            drag.current = {
              startX: e.clientX,
              startY: e.clientY,
              originX: pan.x,
              originY: pan.y,
            };
            e.currentTarget.setPointerCapture(e.pointerId);
          }
        }}
        onPointerMove={(e) => {
          if (!drag.current || !svg.current) return;
          const box = svg.current.getBoundingClientRect(),
            dx = ((e.clientX - drag.current.startX) / box.width) * 900,
            dy = ((e.clientY - drag.current.startY) / box.height) * 500;
          if (drag.current.id)
            move(
              drag.current.id,
              drag.current.originX + dx / (9 * scale),
              drag.current.originY + dy / (5 * scale),
            );
          else
            setPan({
              x: drag.current.originX + dx,
              y: drag.current.originY + dy,
            });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <defs>
          <pattern
            id="studio-grid"
            width="25"
            height="25"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M25 0H0V25"
              fill="none"
              stroke="#cdd6bf"
              strokeWidth=".6"
            />
          </pattern>
        </defs>
        <rect
          width="900"
          height="500"
          fill="url(#studio-grid)"
          pointerEvents="none"
        />
        <g transform={`translate(${pan.x} ${pan.y}) scale(${scale})`}>
          {zones.map((z) => (
            <g
              key={z.id}
              role="button"
              tabIndex={0}
              aria-label={`${z.name}, ${locked(z.id) ? "locked" : z.blocked ? "blocked" : "editable"}. Arrow keys move one unit.`}
              transform={`translate(${z.x * 9} ${z.y * 5})`}
              onFocus={() => setSelected(z.id)}
              onKeyDown={(e) => {
                const d: Record<string, [number, number]> = {
                  ArrowLeft: [-1, 0],
                  ArrowRight: [1, 0],
                  ArrowUp: [0, -1],
                  ArrowDown: [0, 1],
                };
                if (d[e.key]) {
                  e.preventDefault();
                  move(z.id, z.x + d[e.key][0], z.y + d[e.key][1]);
                }
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                setSelected(z.id);
                if (!disabled && !locked(z.id)) {
                  drag.current = {
                    id: z.id,
                    startX: e.clientX,
                    startY: e.clientY,
                    originX: z.x,
                    originY: z.y,
                  };
                  svg.current?.setPointerCapture(e.pointerId);
                }
              }}
              className="spatial-zone"
            >
              <rect
                x="-60"
                y="-35"
                width="120"
                height="70"
                rx="6"
                stroke={selected === z.id ? "#7b9452" : "#a9b89a"}
                strokeWidth={selected === z.id ? 3 : 1}
                fill={
                  z.blocked
                    ? "#e5b7a3"
                    : z.kind === "artist"
                      ? "#324d3b"
                      : z.covered
                        ? "#d4dfbf"
                        : "#e3d2b1"
                }
              />
              <text
                textAnchor="middle"
                y="-10"
                fill={z.kind === "artist" ? "#e9f0df" : "#4a6040"}
                fontSize="12"
              >
                {z.name.slice(0, 20)}
              </text>
              <text
                textAnchor="middle"
                y="8"
                fill={z.kind === "artist" ? "#bccca8" : "#6e805d"}
                fontSize="10"
              >
                {z.blocked
                  ? "BLOCKED"
                  : `${z.width ?? 5} × ${z.depth ?? 5} m · ${z.power} kW`}
              </text>
              <text
                textAnchor="middle"
                y="24"
                fill={z.kind === "artist" ? "#bccca8" : "#6e805d"}
                fontSize="9"
              >
                {locked(z.id) ? "LOCKED · " : ""}
                {doc.plan.filter((a) => a.zoneId === z.id).length} assignments
              </text>
            </g>
          ))}
        </g>
      </svg>
      <div className="spatial-footer">
        <span>
          {message ||
            "Drag zones or use arrow keys. Drag empty space to pan. Layout is conceptual, not a surveyed safety plan."}
        </span>
        <button
          className="btn small"
          disabled={!dirty || disabled}
          onClick={async () => {
            const result = await action("layout", { zones });
            if (result) setDirty(false);
          }}
        >
          <Check size={14} /> Save layout
        </button>
      </div>
    </section>
  );
}
