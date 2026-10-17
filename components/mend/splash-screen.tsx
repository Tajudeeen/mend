"use client";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import MendMark from "./mark";

export default function SplashScreen() {
  const splash = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const element = splash.current;
    const content = document.getElementById("mend-document");
    if (!element) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("mend.intro.v1") === "seen";
    } catch {
      /* Storage can be unavailable in embedded contexts. */
    }
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (seen || reduced) {
      element.hidden = true;
      return;
    }
    try {
      sessionStorage.setItem("mend.intro.v1", "seen");
    } catch {
      /* The intro still dismisses normally without storage. */
    }
    // If the CSS safety timeout already elapsed during slow hydration, don't
    // hide the usable page behind an invisible intro.
    const appearance = window.getComputedStyle(element);
    if (appearance.visibility === "hidden" || appearance.display === "none") {
      element.hidden = true;
      return;
    }
    const previous = document.activeElement as HTMLElement | null;
    const wasInert = content?.hasAttribute("inert") ?? false;
    content?.setAttribute("inert", "");
    skip.current?.focus({ preventScroll: true });
    let closing = false;
    let exitTimer: number | undefined;
    function dismiss() {
      if (closing) return;
      closing = true;
      element!.classList.add("is-leaving");
      if (!wasInert) content?.removeAttribute("inert");
      if (element!.contains(document.activeElement)) {
        if (previous?.isConnected && previous !== document.body)
          previous.focus({ preventScroll: true });
        else content?.focus({ preventScroll: true });
      }
      exitTimer = window.setTimeout(() => {
        element!.hidden = true;
      }, 200);
    }
    const timer = window.setTimeout(dismiss, 1000);
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
      }
      if (event.key === "Tab" && !closing) {
        event.preventDefault();
        skip.current?.focus();
      }
    }
    element.addEventListener("keydown", keydown);
    const button = skip.current;
    button?.addEventListener("click", dismiss);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(exitTimer);
      element.removeEventListener("keydown", keydown);
      button?.removeEventListener("click", dismiss);
      if (!wasInert) content?.removeAttribute("inert");
    };
  }, []);
  return (
    <div
      ref={splash}
      className="mend-splash"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to MEND"
      aria-describedby="splash-tagline"
    >
      <div className="splash-edition">
        <span>EVENT PRODUCTION</span>
        <span>THE PLAN CAN CHANGE.</span>
      </div>
      <div className="splash-identity">
        <span className="splash-mark" aria-hidden="true">
          <MendMark />
        </span>
        <div className="splash-rule" aria-hidden="true" />
        <p id="splash-tagline">
          Keep the feeling.
          <br />
          <span>Repair the plan.</span>
        </p>
      </div>
      <div className="splash-bottom">
        <span>MUSIC / MARKETS / PEOPLE</span>
        <button ref={skip} type="button">
          Enter MEND <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
