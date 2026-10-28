import { z } from "zod";
import { digest } from "./integrity.ts";

export const maxReportBytes = 5_000_000;
export const verificationLimit =
  "This checks stored response integrity only. It does not authenticate the issuer, validate derived scores, establish a live API call, or prove real-world impact.";

const schema = z.object({
  id: z.string().uuid(),
  summary: z.string().max(2000),
  status: z.literal("approved"),
  mode: z.enum(["demo", "live"]).optional(),
  evidenceIds: z.array(z.string().min(1).max(200)).max(200),
  evidenceSnapshot: z
    .array(
      z.object({
        id: z.string().min(1).max(200),
        provider: z.literal("qloo"),
        responseHash: z.string().regex(/^[a-f0-9]{64}$/),
        rawResponse: z.record(z.unknown()),
      }),
    )
    .max(200)
    .optional(),
  missingEvidenceIds: z.array(z.string()).max(200).optional(),
});

export async function verifyReport(text: string) {
  if (new TextEncoder().encode(text).byteLength > maxReportBytes)
    throw new Error("Report exceeds 5 MB.");
  let report: z.infer<typeof schema>;
  try {
    report = schema.parse(JSON.parse(text));
  } catch {
    throw new Error(
      "Invalid report structure. Choose an approved MEND report export.",
    );
  }
  const receipts = report.evidenceSnapshot ?? [];
  if (
    new Set(report.evidenceIds).size !== report.evidenceIds.length ||
    new Set(receipts.map((r) => r.id)).size !== receipts.length
  )
    throw new Error("Duplicate source receipt IDs.");
  const missing = report.evidenceIds.filter(
    (id) => !receipts.some((r) => r.id === id),
  );
  if (report.missingEvidenceIds?.length || missing.length)
    throw new Error(
      "Source receipts are missing. Integrity cannot be checked for every reference.",
    );
  for (const receipt of receipts) {
    if (!report.evidenceIds.includes(receipt.id))
      throw new Error("Unreferenced source receipt.");
    if ((await digest(receipt.rawResponse)) !== receipt.responseHash)
      throw new Error(
        "A source response hash does not match. The stored response may have changed.",
      );
  }
  return {
    id: report.id,
    summary: report.summary,
    mode: report.mode ?? "legacy-unknown",
    checkedReceipts: receipts.length,
    status: receipts.length
      ? ("consistent" as const)
      : ("no-evidence" as const),
    result: receipts.length
      ? "Stored response hashes match."
      : "No source receipts to verify.",
    limitation: verificationLimit,
  };
}
