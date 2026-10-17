import { test, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
const mock = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: mock.create }));
import { proxy } from "../proxy";
import { withRuntime } from "../lib/runtime";
afterEach(() => {
  vi.unstubAllEnvs();
  mock.create.mockReset();
});
test("proxy forwards renewed tokens to the request and browser with private cache headers", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-test");
  mock.create.mockImplementation((_url, _key, options) => ({
    auth: {
      getClaims: async () => {
        options.cookies.setAll(
          [
            {
              name: "sb-session",
              value: "renewed",
              options: { path: "/", sameSite: "lax" },
            },
          ],
          {
            "Cache-Control": "private, no-store",
            Expires: "0",
            Pragma: "no-cache",
          },
        );
        return { data: { claims: { sub: "owner" } } };
      },
    },
  }));
  const request = new NextRequest("https://mend.test/events");
  const response = await proxy(request);
  expect(request.cookies.get("sb-session")?.value).toBe("renewed");
  expect(response.cookies.get("sb-session")?.value).toBe("renewed");
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(response.headers.get("pragma")).toBe("no-cache");
});
test("compatibility dispatch retains ChatGPT identity and never initializes Supabase", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-test");
  await withRuntime({}, () =>
    proxy(new NextRequest("https://mend.test/events")),
  );
  expect(mock.create).not.toHaveBeenCalled();
});
