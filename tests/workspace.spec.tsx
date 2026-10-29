// @vitest-environment jsdom
import React from "react";
import { test, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import Workspace from "../app/workspace";
import { sampleEvent } from "../lib/seed";
import { newEvent } from "../lib/new-event";
beforeEach(() => {
  history.replaceState({}, "", "/");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
test("a failed live load never shows the sample or allows sample repair actions", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementation(async () =>
        Response.json(
          { error: "Sign in to load this event." },
          { status: 401 },
        ),
      ),
  );
  render(<Workspace eventId="00000000-0000-4000-8000-000000000099" />);
  expect(screen.getByText("Loading your event…")).toBeTruthy();
  expect(await screen.findByRole("alert")).toHaveProperty(
    "textContent",
    "Sign in to load this event.",
  );
  expect(screen.queryByText("Midnight Culture Market")).toBeNull();
  expect(
    screen.queryByRole("button", { name: /Find a thoughtful repair/ }),
  ).toBeNull();
});
test("a blank live event reports unassessed checks and no cultural index", async () => {
  const doc = newEvent(sampleEvent().brief);
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) =>
      String(url).includes("?id=")
        ? Response.json({ event: doc, audit: [], qlooConfigured: true })
        : Response.json({ events: [], qlooConfigured: true }),
    ),
  );
  render(<Workspace eventId={doc.id} />);
  expect(await screen.findByText("Not assessed")).toBeTruthy();
  expect(screen.queryByText("Passed")).toBeNull();
  expect(screen.getAllByText("Awaiting plan").length).toBe(3);
});
test("saved live evidence starts empty, exposes real readback and navigates with focus and reduced motion", async () => {
  const doc = sampleEvent("00000000-0000-4000-8000-000000000099");
  doc.mode = "live";
  doc.brief.name = "Organizer's actual event";
  const fetch = vi.fn(async (url) =>
    String(url).includes("?id=")
      ? Response.json({ event: doc, audit: [], qlooConfigured: true })
      : Response.json({
          events: [{ id: doc.id, name: doc.brief.name }],
          qlooConfigured: true,
        }),
  );
  vi.stubGlobal("fetch", fetch);
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: true })),
  );
  render(<Workspace eventId={doc.id} initialView="evidence" />);
  expect(
    await screen.findByText("Follow the evidence for this event."),
  ).toBeTruthy();
  expect(screen.getByText(/No Qloo receipt has been collected/)).toBeTruthy();
  expect(screen.getByText(/Server read confirmed at/)).toBeTruthy();
  expect(screen.queryByText("Server-persisted decisions")).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Reload saved evidence" }),
  );
  await screen.findByText("Follow the evidence for this event.");
  expect(
    fetch.mock.calls.filter(([url]) => String(url).includes("?id=")).length,
  ).toBe(2);
  fireEvent.click(screen.getByRole("button", { name: "Repair studio" }));
  await waitFor(() =>
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "instant",
    }),
  );
  expect(document.activeElement?.id).toBe("workspace-content");
  expect(
    screen
      .getByRole("button", { name: "Repair studio" })
      .getAttribute("aria-current"),
  ).toBe("page");
  expect(location.search).toContain("view=repair");
});
test("sample evidence labels its storage and audit trail without making server claims", () => {
  render(<Workspace demo initialView="evidence" />);
  expect(
    screen.getByText("Sample activity is not live evidence."),
  ).toBeTruthy();
  expect(screen.getByText("Temporary browser session")).toBeTruthy();
  expect(screen.getByText("Sample interaction trail")).toBeTruthy();
  expect(screen.getByText("Sample only")).toBeTruthy();
  expect(screen.queryByText("Key needed")).toBeNull();
  expect(screen.getByRole("button", { name: "Live Qloo" })).toHaveProperty(
    "disabled",
    true,
  );
});
test("a delayed previous event load cannot replace the currently requested event", async () => {
  const first = sampleEvent("00000000-0000-4000-8000-000000000091");
  const second = sampleEvent("00000000-0000-4000-8000-000000000092");
  first.brief.name = "Previous event";
  second.brief.name = "Current event";
  let releaseFirst!: (response: Response) => void;
  const pending = new Promise<Response>((resolve) => {
    releaseFirst = resolve;
  });
  const fetch = vi.fn(async (url) =>
    String(url).includes(first.id)
      ? pending
      : String(url).includes(second.id)
        ? Response.json({ event: second, audit: [], qlooConfigured: true })
        : Response.json({ events: [], qlooConfigured: true }),
  );
  vi.stubGlobal("fetch", fetch);
  const { rerender } = render(
    <Workspace eventId={first.id} initialView="evidence" />,
  );
  await waitFor(() =>
    expect(fetch).toHaveBeenCalledWith(`/api/mend?id=${first.id}`),
  );
  rerender(<Workspace eventId={second.id} initialView="evidence" />);
  await screen.findByText("Current event");
  releaseFirst(
    Response.json({ event: first, audit: [], qlooConfigured: true }),
  );
  await waitFor(() => expect(screen.queryByText("Previous event")).toBeNull());
  expect(screen.getByText("Current event")).toBeTruthy();
});
test("registration-free demo completes cancellation, explicit approval and report display", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  render(<Workspace demo initialView="repair" />);
  expect(screen.getByText("Something changed. What stays?")).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: /Find a thoughtful repair/i }),
  );
  const approve = await screen.findAllByRole(
    "button",
    { name: /Approve this repair/i },
    { timeout: 10000 },
  );
  expect(fetch).not.toHaveBeenCalled();
  expect(approve.length).toBeGreaterThan(0);
  fireEvent.click(approve[0]);
  await waitFor(() =>
    expect(screen.getByText(/Sample repair applied/)).toBeTruthy(),
  );
  fireEvent.click(screen.getByRole("button", { name: /View approved report/ }));
  expect(screen.getByText("A decision you can explain.")).toBeTruthy();
  expect(
    screen.getByText(/organizer approved.*assignment changes/i),
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: /Download report/i })).toBeTruthy();
});
test("sample explains how to access the live assistant without offering an unavailable run", () => {
  render(<Workspace demo initialView="repair" />);
  expect(screen.getByText(/fictional sample uses the structured/)).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Investigate/ })).toBeNull();
  expect(screen.queryByRole("textbox", { name: "What changed?" })).toBeNull();
});
test("public sample offers individual closure and organizer-controlled venue editing", () => {
  render(<Workspace demo initialView="repair" />);
  fireEvent.click(
    screen.getByRole("button", { name: /A stall or zone closes/i }),
  );
  expect(screen.getByText("Unavailable space")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Site plan" }));
  expect(screen.getByText("Move the pieces, keep the promises.")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Zoom in" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Save zone" })).toBeTruthy();
});

test("mobile drawer contains keyboard focus, prevents background scrolling and restores it on Escape", () => {
  render(<Workspace demo />);
  fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
  expect(
    screen.getByRole("dialog", { name: "Workspace navigation" }),
  ).toBeTruthy();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Close navigation" }),
  );
  expect(document.body.style.overflow).toBe("hidden");
  const account = screen.getByRole("link", {
    name: "Sign in or create an organizer account",
  });
  account.focus();
  fireEvent.keyDown(window, { key: "Tab" });
  expect(document.activeElement?.getAttribute("aria-label")).toBe("MEND home");
  fireEvent.keyDown(window, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.body.style.overflow).toBe("");
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Open navigation" }),
  );
});
