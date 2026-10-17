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
beforeEach(() => history.replaceState({}, "", "/"));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
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
    expect(screen.getByText(/Organizer approved proposal/)).toBeTruthy(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Recovery reports" }));
  expect(screen.getByText("A decision you can explain.")).toBeTruthy();
  expect(
    screen.getByText(/organizer approved.*assignment changes/i),
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: /Download report/i })).toBeTruthy();
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
