// @vitest-environment jsdom
import React from "react";
import { test, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Landing from "../components/mend/landing";

afterEach(cleanup);

test("workspace entry leaves the browser free to request the destination document", () => {
  render(<Landing />);
  const workspace = screen.getByRole("link", { name: /Open workspace/i });
  let intercepted: boolean | undefined;
  // Observe after React's root handler, then suppress JSDOM's unsupported navigation.
  document.addEventListener(
    "click",
    (event) => {
      intercepted = event.defaultPrevented;
      event.preventDefault();
    },
    { once: true },
  );
  fireEvent.click(workspace, { button: 0 });
  expect(intercepted).toBe(false);
  expect(workspace.getAttribute("href")).toBe("/events");
});
