// Request-scoped services also enforce provider concurrency. This local limiter is
// defense-in-depth per process. Global enforcement belongs at the deployment edge.
const windows = new Map<string, { count: number; until: number }>();
export function rateLimit(key: string, limit = 20, now = Date.now()) {
  if (windows.size > 5000) {
    for (const [k, v] of windows) if (v.until < now) windows.delete(k);
    if (windows.size > 5000) windows.clear();
  }
  let w = windows.get(key);
  if (!w || w.until < now) {
    w = { count: 0, until: now + 60000 };
    windows.set(key, w);
  }
  if (++w.count > limit)
    throw new Error("Rate limit reached. Try again in one minute.");
}
let active = 0;
export async function boundedRequest<T>(fn: () => Promise<T>) {
  if (active >= 4)
    throw new Error("Cultural service is busy. Try again shortly.");
  active++;
  try {
    return await fn();
  } finally {
    active--;
  }
}
