export const privateHeaders = { "Cache-Control": "private, no-store" };

export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

export async function smallJson(request: Request, maxBytes = 8192) {
  if (
    !request.headers.get("content-type")?.split(";")[0].trim().endsWith("/json")
  )
    throw new Error("Expected JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body.");
  let size = 0;
  let text = "";
  const decoder = new TextDecoder();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error("Request body too large.");
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode()) as unknown;
  } finally {
    reader.releaseLock();
  }
}
