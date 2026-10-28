// @vitest-environment jsdom
import React from "react";
import { test, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import RepairComparison from "../components/mend/repair-comparison";
import { sampleEvent } from "../lib/seed";
afterEach(cleanup);
function fixture() {
  const doc = sampleEvent();
  doc.slots = doc.slots.slice(0, 1);
  doc.plan = doc.plan.slice(0, 1);
  doc.candidates = doc.candidates
    .filter((c) => c.kind === "artist")
    .slice(0, 3);
  doc.zones = doc.zones.filter((z) => z.kind === "artist");
  return doc;
}
test("comparison labels synthetic inputs and hides a result after the event revision changes", () => {
  const doc = fixture();
  const { rerender } = render(
    <RepairComparison
      doc={doc}
      scenario={{ type: "cancellation", candidateId: "a1" }}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Compare repair strategies" }),
  );
  expect(screen.getByText(/Synthetic preference comparison/)).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Download comparison and inputs" }),
  ).toBeTruthy();
  rerender(
    <RepairComparison
      doc={{ ...doc, revision: 1 }}
      scenario={{ type: "cancellation", candidateId: "a1" }}
    />,
  );
  expect(
    screen.queryByRole("button", { name: "Download comparison and inputs" }),
  ).toBeNull();
});
test("live comparison gives an actionable missing-evidence error", () => {
  const doc = fixture();
  doc.mode = "live";
  render(<RepairComparison doc={doc} scenario={{ type: "none" }} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Compare repair strategies" }),
  );
  expect(screen.getByRole("alert").textContent).toContain(
    "collect Qloo evidence",
  );
});
