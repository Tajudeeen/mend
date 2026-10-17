// @vitest-environment jsdom
import React from "react";
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import SplashScreen from "../components/mend/splash-screen";
function app() {
  return render(
    <>
      <SplashScreen />
      <div id="mend-document" tabIndex={-1}>
        <button>Workspace action</button>
      </div>
    </>,
  );
}
beforeEach(() => {
  sessionStorage.clear();
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
test("intro dismisses automatically, releases content and does not repeat in the same session", () => {
  const first = app();
  expect(screen.getByRole("dialog", { name: "Welcome to MEND" })).toBeTruthy();
  expect(document.getElementById("mend-document")?.hasAttribute("inert")).toBe(
    true,
  );
  vi.advanceTimersByTime(1200);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.getElementById("mend-document")?.hasAttribute("inert")).toBe(
    false,
  );
  first.unmount();
  app();
  expect(screen.queryByRole("dialog")).toBeNull();
});
test("keyboard escape and the enter button both release the underlying app immediately", () => {
  const first = app();
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  expect(document.getElementById("mend-document")?.hasAttribute("inert")).toBe(
    false,
  );
  vi.advanceTimersByTime(200);
  expect(screen.queryByRole("dialog")).toBeNull();
  first.unmount();
  sessionStorage.clear();
  app();
  fireEvent.click(screen.getByRole("button", { name: "Enter MEND" }));
  expect(document.getElementById("mend-document")?.hasAttribute("inert")).toBe(
    false,
  );
  vi.advanceTimersByTime(200);
  expect(screen.queryByRole("dialog")).toBeNull();
});
test("reduced-motion users enter the app without a blocking splash", () => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
  app();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.getElementById("mend-document")?.hasAttribute("inert")).toBe(
    false,
  );
});

test("late hydration cannot block content after the CSS safety timeout", () => {
  vi.spyOn(window, "getComputedStyle").mockReturnValue({
    visibility: "hidden",
    display: "flex",
  } as CSSStyleDeclaration);
  app();
  expect(document.getElementById("mend-document")?.hasAttribute("inert")).toBe(
    false,
  );
  expect(document.querySelector<HTMLElement>(".mend-splash")?.hidden).toBe(
    true,
  );
});
