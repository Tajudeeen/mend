// @vitest-environment jsdom
import React from "react";
import { test, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Study from "../app/study/page";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
test("study preserves a rejected attempt when the participant stops and labels the trial unfinished", () => {
  render(<Study />);
  expect(
    screen.getByRole("button", { name: "Start manual trial" }),
  ).toHaveProperty("disabled", true);
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.change(screen.getByLabelText("Participant role"), {
    target: { value: "automated" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Start manual trial" }));
  fireEvent.change(screen.getByLabelText("Replacement performer"), {
    target: { value: "a1" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Check and submit manual repair" }),
  );
  expect(screen.getByRole("alert").textContent).toContain("unavailable");
  fireEvent.click(
    screen.getByRole("button", {
      name: "Stop this trial and record it as unfinished",
    }),
  );
  expect(screen.getByText(/abandoned/)).toBeTruthy();
  expect(screen.getByText(/1 submission attempts/).textContent).toContain(
    "1 failed checks",
  );
  expect(
    screen.getByRole("button", { name: /Download raw trial record/ }),
  ).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Start assisted trial" }),
  ).toBeTruthy();
});
