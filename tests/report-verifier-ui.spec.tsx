// @vitest-environment jsdom
import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Verify from "../app/verify/page";
import ReadinessPanel from "../components/mend/readiness-panel";
import { sampleEvent } from "../lib/seed";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
test("report checking is local and clears a previous result when a new invalid file is selected", async () => {
  const network = vi.fn();
  vi.stubGlobal("fetch", network);
  render(<Verify />);
  const input = screen.getByLabelText(/Approved report file/);
  fireEvent.change(input, {
    target: {
      files: [
        {
          size: 200,
          text: async () =>
            JSON.stringify({
              id: crypto.randomUUID(),
              summary: "Synthetic repair",
              status: "approved",
              mode: "demo",
              evidenceIds: [],
            }),
        },
      ],
    },
  });
  expect(await screen.findByText("No source receipts to verify.")).toBeTruthy();
  expect(
    screen.getByText("This is a synthetic demonstration report."),
  ).toBeTruthy();
  fireEvent.change(input, {
    target: { files: [{ size: 10, text: async () => "invalid JSON" }] },
  });
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.queryByText("Synthetic repair")).toBeNull();
  expect(network).not.toHaveBeenCalled();
});
test("oversized reports are rejected before their contents are read", async () => {
  render(<Verify />);
  const read = vi.fn();
  fireEvent.change(screen.getByLabelText(/Approved report file/), {
    target: { files: [{ size: 5_000_001, text: read }] },
  });
  expect(await screen.findByRole("alert")).toHaveProperty(
    "textContent",
    "Report exceeds 5 MB.",
  );
  expect(read).not.toHaveBeenCalled();
});
test("live preparation points the organizer to the selected missing step", () => {
  const doc = sampleEvent();
  doc.mode = "live";
  const navigate = vi.fn();
  render(<ReadinessPanel doc={doc} navigate={navigate} />);
  fireEvent.click(
    screen.getByRole("button", {
      name: "Resolve interests for every audience group",
    }),
  );
  expect(navigate).toHaveBeenCalledWith("brief");
  expect(
    screen.getByText(
      /Connection checks and a successful live repair are separate/,
    ),
  ).toBeTruthy();
});
