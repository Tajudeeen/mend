import { test, expect, vi, beforeEach } from "vitest";
const mocks = vi.hoisted(() => ({
  client: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      exchangeCodeForSession: vi.fn(),
      verifyOtp: vi.fn(),
    },
  },
  owner: vi.fn(),
  runtime: vi.fn(() => ({})),
}));
vi.mock("@/server/auth", () => ({
  supabaseServer: vi.fn(async () => mocks.client),
  authenticatedOwner: mocks.owner,
}));
vi.mock("@/lib/runtime", () => ({ runtimeEnv: mocks.runtime }));
import { POST, GET } from "../app/api/auth/route";
import { GET as callback } from "../app/auth/callback/route";
import { smallJson } from "../server/http";
const origin = "https://mend.test";
const req = (body: unknown, source = origin) =>
  new Request(origin + "/api/auth", {
    method: "POST",
    headers: { origin: source, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.runtime.mockReturnValue({});
});
test("auth rejects cross-origin and oversized requests before reaching Supabase", async () => {
  expect(
    (await POST(req({ action: "signout" }, "https://other.test"))).status,
  ).toBe(403);
  expect(
    (
      await POST(
        req({
          action: "signin",
          email: "a@mend.test",
          password: "x".repeat(9000),
        }),
      )
    ).status,
  ).toBe(400);
  expect(mocks.client.auth.signInWithPassword).not.toHaveBeenCalled();
  await expect(smallJson(req("x".repeat(9000)))).rejects.toThrow("too large");
});
test("signup sets this origin's callback and surfaces email confirmation", async () => {
  mocks.client.auth.signUp.mockResolvedValue({
    data: { session: null },
    error: null,
  });
  const response = await POST(
    req({ action: "signup", email: "a@mend.test", password: "password123" }),
  );
  expect(await response.json()).toEqual({
    ok: true,
    confirmationRequired: true,
  });
  expect(mocks.client.auth.signUp).toHaveBeenCalledWith({
    email: "a@mend.test",
    password: "password123",
    options: { emailRedirectTo: origin + "/auth/callback" },
  });
  expect(response.headers.get("cache-control")).toBe("private, no-store");
});
test("signout needs no credentials and ends only this browser's Supabase session", async () => {
  mocks.client.auth.signOut.mockResolvedValue({ error: null });
  expect((await POST(req({ action: "signout" }))).status).toBe(200);
  expect(mocks.client.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
});
test("account status does not return identity or tokens", async () => {
  mocks.owner.mockResolvedValue("private-owner");
  expect(await (await GET(new Request(origin))).json()).toEqual({
    signedIn: true,
  });
  mocks.owner.mockRejectedValue(new Error("Sign in"));
  expect(await (await GET(new Request(origin))).json()).toEqual({
    signedIn: false,
  });
});
test("callback exchanges PKCE and email token hashes and never follows an external next URL", async () => {
  mocks.client.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
  let response = await callback(
    new Request(origin + "/auth/callback?code=valid&next=https://evil.test"),
  );
  expect(response.headers.get("location")).toBe(origin + "/events");
  mocks.client.auth.verifyOtp.mockResolvedValue({ error: null });
  response = await callback(
    new Request(origin + "/auth/callback?token_hash=hash&type=email"),
  );
  expect(mocks.client.auth.verifyOtp).toHaveBeenCalledWith({
    token_hash: "hash",
    type: "email",
  });
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  mocks.client.auth.exchangeCodeForSession.mockRejectedValue(
    new Error("unavailable"),
  );
  response = await callback(
    new Request(origin + "/auth/callback?code=expired"),
  );
  expect(response.headers.get("location")).toBe(
    origin + "/settings?auth=failed",
  );
});
