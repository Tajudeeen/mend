// @vitest-environment jsdom
import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import Settings from "../app/settings/page";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
test("signup waits for confirmation instead of entering the workspace", async () => {
  const fetcher = vi.fn(async (url: string) =>
    Response.json(
      url === "/api/health"
        ? { auth: "supabase-configured" }
        : url === "/api/auth" && fetcher.mock.calls.length <= 2
          ? { signedIn: false }
          : { ok: true, confirmationRequired: true },
    ),
  );
  vi.stubGlobal("fetch", fetcher);
  render(<Settings />);
  fireEvent.click(
    screen.getByRole("button", { name: "New here? Create an account" }),
  );
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "organizer@mend.test" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "test-password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));
  expect(await screen.findByText(/Check your email to confirm/)).toBeTruthy();
  expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
});
test("connection results remain separate from configured status and signout clears them", async () => {
  const fetcher = vi.fn(async (url: string, options?: RequestInit) => {
    if (url === "/api/health")
      return Response.json({
        auth: "supabase-configured",
        qloo: true,
        model: true,
      });
    if (url === "/api/connections")
      return Response.json({
        checkedAt: "2026-10-17T00:00:00Z",
        qloo: { state: "passed", detail: "Resolved artists" },
        model: { state: "failed", detail: "Check model access" },
      });
    return Response.json(
      options?.method === "POST" ? { ok: true } : { signedIn: true },
    );
  });
  vi.stubGlobal("fetch", fetcher);
  render(<Settings />);
  await screen.findByRole("button", { name: "Sign out" });
  fireEvent.click(screen.getByRole("button", { name: "Test Qloo and model" }));
  expect(await screen.findByText("Qloo: passed")).toBeTruthy();
  expect(screen.getByText("Model: failed")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
  await waitFor(() =>
    expect(screen.queryByLabelText("Connection check results")).toBeNull(),
  );
  expect(
    (
      screen.getByRole("button", {
        name: "Test Qloo and model",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
});

test("missing auth configuration explains the blocker before asking for credentials", async () => {
  const fetcher = vi.fn(async (url: string, _options?: RequestInit) =>
    Response.json(
      url === "/api/health" ? { auth: "not-configured" } : { signedIn: false },
    ),
  );
  vi.stubGlobal("fetch", fetcher);
  render(<Settings />);
  expect(await screen.findByText(/Account sign-in is not set up/)).toBeTruthy();
  expect(screen.queryByLabelText("Password")).toBeNull();
  expect(screen.queryByRole("button", { name: "Sign in" })).toBeNull();
  expect(
    fetcher.mock.calls.every(
      ([, options]) => !(options as RequestInit | undefined)?.method,
    ),
  ).toBe(true);
});
