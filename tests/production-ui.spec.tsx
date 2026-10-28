// @vitest-environment jsdom
import React from "react";
import { test, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  createEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import Workspace from "../app/workspace";
import VendorProfile from "../components/mend/vendor-profile";
import Study from "../app/study/page";
import { sampleEvent } from "../lib/seed";
beforeEach(() => {
  history.replaceState({}, "", "/");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
test("past assignments can be proposed from the register and still require explicit approval", async () => {
  render(<Workspace demo initialView="site" />);
  fireEvent.click(screen.getAllByRole("button", { name: "Lock" })[0]);
  fireEvent.click(screen.getByRole("button", { name: "Versions" }));
  fireEvent.click(screen.getByText("R00"));
  fireEvent.click(
    screen.getByRole("button", { name: /Review restoration of R0/i }),
  );
  expect(
    await screen.findByText(/Restoration proposal from revision 0/),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /Approve this repair/i }));
  fireEvent.click(screen.getByRole("button", { name: "Recovery reports" }));
  expect(screen.getByText(/Cultural coverage:/)).toBeTruthy();
});
test("vendor proxy selection retains explicit chosen references and organizer rationale", async () => {
  const doc = sampleEvent(),
    action = vi.fn().mockResolvedValue({});
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json({
        results: [
          {
            id: "00000000-0000-4000-8000-000000000003",
            name: "Comparable Place",
            description: "Reference place",
          },
        ],
      }),
    ),
  );
  render(
    <VendorProfile doc={doc} action={action} demo={false} disabled={false} />,
  );
  fireEvent.change(
    screen.getByRole("textbox", { name: /Search a comparable place/ }),
    { target: { value: "Comparable" } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  fireEvent.click(
    await screen.findByRole("button", { name: /Comparable Place/ }),
  );
  fireEvent.change(
    screen.getByRole("textbox", { name: /Why these references/ }),
    {
      target: {
        value:
          "A comparable independent food format; only a reference, not the vendor identity.",
      },
    },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Save reference profile" }),
  );
  expect(action).toHaveBeenCalledWith(
    "vendorProfile",
    expect.objectContaining({
      candidateId: "v1",
      profile: expect.objectContaining({
        entities: [
          {
            id: "00000000-0000-4000-8000-000000000003",
            name: "Comparable Place",
          },
        ],
      }),
    }),
  );
});
test("timed organizer trial rejects a withdrawn act, keeps running and records genuine elapsed time", async () => {
  let time = 1000;
  vi.spyOn(performance, "now").mockImplementation(() => time);
  render(<Study />);
  fireEvent.click(screen.getByRole("checkbox"));
  const clickAt = (name: string, at: number) => {
    const button = screen.getByRole("button", { name });
    const event = createEvent.click(button);
    Object.defineProperty(event, "timeStamp", { value: at });
    fireEvent(button, event);
  };
  clickAt("Start manual trial", 1000);
  fireEvent.change(
    screen.getByRole("combobox", { name: "Replacement performer" }),
    { target: { value: "a1" } },
  );
  time = 7000;
  clickAt("Check and submit manual repair", time);
  expect(screen.getByRole("alert").textContent).toContain("timer continues");
  fireEvent.change(
    screen.getByRole("combobox", { name: "Replacement performer" }),
    { target: { value: "a3" } },
  );
  time = 17000;
  clickAt("Check and submit manual repair", time);
  await waitFor(() => expect(screen.getByText("16.0 seconds")).toBeTruthy());
  expect(
    screen.getByText(/2 submission attempts \/ 1 failed checks/),
  ).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Start assisted trial" }),
  ).toBeTruthy();
});
