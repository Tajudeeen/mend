// @vitest-environment jsdom
import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import OrganizerAccount, {
  OrganizerProfileEditor,
} from "../components/mend/organizer-account";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
test("organizer identity is a keyboard accessible profile link and handles long labels", () => {
  render(
    <OrganizerAccount
      demo={false}
      status=""
      profile={{
        displayName: "Ada Okafor",
        organization: "Culture studio",
        email: "private@mend.test",
        editable: true,
      }}
    />,
  );
  expect(
    screen
      .getByRole("link", {
        name: "Open organizer profile and account settings",
      })
      .getAttribute("href"),
  ).toBe("/settings#organizer-profile");
  expect(screen.getByText("AO")).toBeTruthy();
  expect(screen.getByText("Ada Okafor")).toBeTruthy();
  expect(screen.queryByText("private@mend.test")).toBeNull();
});
test("sample account stays visibly separate and requests no private profile", () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  render(<OrganizerAccount demo status="" profile={null} />);
  expect(screen.getByText("Demo visitor")).toBeTruthy();
  expect(fetch).not.toHaveBeenCalled();
});
test("profile can save display fields and shows confirmed server result", async () => {
  const profile = {
    displayName: "Ada",
    organization: "",
    email: "owner@mend.test",
    editable: true,
  };
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ profile }))
    .mockResolvedValueOnce(
      Response.json({
        profile: {
          ...profile,
          displayName: "Ada Okafor",
          organization: "Culture studio",
        },
      }),
    );
  vi.stubGlobal("fetch", fetch);
  render(<OrganizerProfileEditor />);
  fireEvent.change(await screen.findByLabelText("Organizer name"), {
    target: { value: "Ada Okafor" },
  });
  fireEvent.change(screen.getByLabelText(/Organization/), {
    target: { value: "Culture studio" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
  expect(await screen.findByText(/Profile saved/)).toBeTruthy();
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
    displayName: "Ada Okafor",
    organization: "Culture studio",
  });
});
