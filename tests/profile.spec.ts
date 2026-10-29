import { test, expect, vi, beforeEach } from "vitest";
const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  updateUser: vi.fn(),
  runtime: vi.fn(() => ({})),
  limit: vi.fn(),
}));
vi.mock("@/server/auth", () => ({
  supabaseServer: async () => ({ auth: mocks }),
}));
vi.mock("@/lib/runtime", () => ({ runtimeEnv: mocks.runtime }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.limit }));
import { GET, POST } from "../app/api/profile/route";
const request = (body: unknown, origin = "https://mend.test") =>
  new Request("https://mend.test/api/profile", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.runtime.mockReturnValue({});
  mocks.getUser.mockResolvedValue({
    data: {
      user: {
        id: "owner",
        email: "owner@mend.test",
        user_metadata: { full_name: "Organizer", role: "admin" },
        app_metadata: { secret: "hidden" },
      },
    },
    error: null,
  });
});
test("profile returns only authenticated display fields with private no-store caching", async () => {
  const result = await GET(new Request("https://mend.test/api/profile"));
  expect(result.headers.get("cache-control")).toBe("private, no-store");
  expect(await result.json()).toEqual({
    profile: {
      displayName: "Organizer",
      organization: "",
      email: "owner@mend.test",
      editable: true,
    },
  });
  mocks.getUser.mockResolvedValue({
    data: { user: null },
    error: new Error("secret"),
  });
  expect((await GET(new Request("https://mend.test"))).status).toBe(401);
});
test("profile update rejects cross-origin, unauthenticated and ownership/role fields", async () => {
  expect((await POST(request({}, "https://evil.test"))).status).toBe(403);
  for (const body of [
    { displayName: "Name", organization: "", owner: "another" },
    { displayName: "", organization: "" },
    { displayName: "Name\nInjected", organization: "" },
    { displayName: "Name", organization: "", role: "admin" },
  ])
    expect((await POST(request(body))).status).toBe(400);
  expect(mocks.updateUser).not.toHaveBeenCalled();
  mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
  expect(
    (await POST(request({ displayName: "Name", organization: "" }))).status,
  ).toBe(401);
});
test("profile edits only display metadata and reuses verified user for throttling", async () => {
  mocks.updateUser.mockResolvedValue({
    data: {
      user: {
        email: "owner@mend.test",
        user_metadata: { display_name: "New Name", organization: "Studio" },
      },
    },
    error: null,
  });
  expect(
    (await POST(request({ displayName: " New Name ", organization: "Studio" })))
      .status,
  ).toBe(200);
  expect(mocks.updateUser).toHaveBeenCalledWith({
    data: { display_name: "New Name", organization: "Studio" },
  });
  expect(mocks.limit).toHaveBeenCalledWith("profile:owner", 10);
  mocks.updateUser.mockResolvedValue({
    data: { user: null },
    error: { message: "private-provider-secret" },
  });
  expect(
    JSON.stringify(
      await (
        await POST(request({ displayName: "Name", organization: "" }))
      ).json(),
    ),
  ).not.toContain("private-provider-secret");
});
test("compatibility identities cannot be edited through Supabase", async () => {
  mocks.runtime.mockReturnValue({ MEND_SITE_COMPAT: true });
  expect(
    (await POST(request({ displayName: "Name", organization: "" }))).status,
  ).toBe(409);
  expect(mocks.getUser).not.toHaveBeenCalled();
});
