"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import {
  Music,
  Music2,
  Guitar,
  Drum,
  Headphones,
  MicVocal,
  UtensilsCrossed,
  Store,
  Ticket,
  Disc3,
  Pause,
  Play,
} from "lucide-react";

// Fixed placements keep the server and browser render identical. Motion uses
// CSS transforms only, with no timers, canvas, scroll listeners or network work.
const motifs = [
  {
    Icon: Music,
    x: 8,
    y: 14,
    size: 64,
    tilt: -15,
    duration: 27,
    delay: -9,
    tone: "rust",
  },
  {
    Icon: Guitar,
    x: 86,
    y: 10,
    size: 104,
    tilt: 24,
    duration: 36,
    delay: -18,
    tone: "sage",
  },
  {
    Icon: Drum,
    x: 4,
    y: 69,
    size: 88,
    tilt: -12,
    duration: 33,
    delay: -12,
    tone: "sage",
  },
  {
    Icon: Music2,
    x: 94,
    y: 51,
    size: 58,
    tilt: 18,
    duration: 24,
    delay: -5,
    tone: "rust",
  },
  {
    Icon: Disc3,
    x: 69,
    y: 83,
    size: 90,
    tilt: 0,
    duration: 38,
    delay: -21,
    tone: "sage",
    record: true,
  },
  {
    Icon: Headphones,
    x: 47,
    y: 7,
    size: 75,
    tilt: -21,
    duration: 32,
    delay: -7,
    tone: "ochre",
  },
  {
    Icon: MicVocal,
    x: 89,
    y: 78,
    size: 92,
    tilt: -23,
    duration: 31,
    delay: -15,
    tone: "rust",
  },
  {
    Icon: Music,
    x: 27,
    y: 88,
    size: 55,
    tilt: 12,
    duration: 26,
    delay: -13,
    tone: "ochre",
  },
  {
    Icon: UtensilsCrossed,
    x: 24,
    y: 34,
    size: 60,
    tilt: 14,
    duration: 35,
    delay: -23,
    tone: "ochre",
  },
  {
    Icon: Ticket,
    x: 65,
    y: 35,
    size: 76,
    tilt: -25,
    duration: 29,
    delay: -11,
    tone: "sage",
  },
  {
    Icon: Store,
    x: 47,
    y: 67,
    size: 79,
    tilt: 9,
    duration: 39,
    delay: -19,
    tone: "sage",
  },
  {
    Icon: Music2,
    x: 9,
    y: 44,
    size: 45,
    tilt: 17,
    duration: 25,
    delay: -16,
    tone: "rust",
  },
  {
    Icon: Music,
    x: 75,
    y: 60,
    size: 42,
    tilt: -13,
    duration: 30,
    delay: -20,
    tone: "ochre",
  },
  {
    Icon: Guitar,
    x: 41,
    y: 96,
    size: 100,
    tilt: 36,
    duration: 40,
    delay: -27,
    tone: "rust",
  },
];
const artwork = motifs.map(
  ({ Icon, x, y, size, tilt, duration, delay, tone, record }, i) => (
    <span
      key={i}
      className={`event-motif event-motif-${tone}`}
      style={
        {
          left: `${x}%`,
          top: `${y}%`,
          "--motif-size": `${size}px`,
          "--motif-tilt": `${tilt}deg`,
          "--motif-duration": `${duration}s`,
          "--motif-delay": `${delay}s`,
        } as CSSProperties
      }
    >
      <span
        className={`event-motif-drawing${record ? " event-motif-record" : ""}`}
      >
        <Icon strokeWidth={1.15} aria-hidden="true" focusable="false" />
      </span>
    </span>
  ),
);

function subscribe(callback: () => void) {
  window.addEventListener("mend:motion-change", callback);
  return () => window.removeEventListener("mend:motion-change", callback);
}
const readPaused = () =>
  document.documentElement.dataset.mendMotion === "paused";
const serverPaused = () => false;

export default function EventAtmosphere() {
  const paused = useSyncExternalStore(subscribe, readPaused, serverPaused);
  return (
    <>
      <div className="event-atmosphere" aria-hidden="true" data-paused={paused}>
        {artwork}
      </div>
      <button
        className="event-motion-toggle"
        type="button"
        aria-label={
          paused ? "Resume background motion" : "Pause background motion"
        }
        title={paused ? "Resume background motion" : "Pause background motion"}
        onClick={() => {
          const next = paused ? "playing" : "paused";
          document.documentElement.dataset.mendMotion = next;
          try {
            sessionStorage.setItem("mend.motion.v1", next);
          } catch {
            /* Motion can still be paused when storage is unavailable. */
          }
          window.dispatchEvent(new Event("mend:motion-change"));
        }}
      >
        {paused ? (
          <Play size={15} aria-hidden="true" />
        ) : (
          <Pause size={15} aria-hidden="true" />
        )}
      </button>
    </>
  );
}
