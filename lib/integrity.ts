export async function digest(value: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

export type ResponseHashAlgorithm =
  "sha256-json-v1" | "sha256-canonical-json-v2";
/** Semantic JSON integrity survives JSONB object-key reordering; array order matters. */
export async function canonicalDigest(value: unknown) {
  const text = JSON.stringify(value, (_key, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(
          Object.keys(item)
            .sort()
            .map((key) => [key, item[key]]),
        )
      : item,
  );
  const bytes = new TextEncoder().encode(text);
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function responseDigest(
  value: unknown,
  algorithm?: ResponseHashAlgorithm,
) {
  if (algorithm === "sha256-canonical-json-v2") return canonicalDigest(value);
  if (algorithm === undefined || algorithm === "sha256-json-v1")
    return digest(value);
  throw new Error("Unsupported response hash algorithm.");
}
