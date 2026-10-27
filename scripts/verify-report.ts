import { readFile } from "node:fs/promises";
import { z } from "zod";
import { digest } from "../lib/qloo.ts";

const schema = z.object({
  mode: z.enum(["demo", "live"]).optional(),
  evidenceIds: z.array(z.string()),
  evidenceSnapshot: z
    .array(
      z.object({
        id: z.string(),
        provider: z.literal("qloo"),
        responseHash: z.string(),
        rawResponse: z.unknown(),
      }),
    )
    .optional(),
  missingEvidenceIds: z.array(z.string()).optional(),
});
try {
  if (process.argv.length !== 3)
    throw new Error(
      "Usage: pnpm verify:report /absolute/path/to/mend-report.json",
    );
  const file = await readFile(process.argv[2], "utf8");
  if (Buffer.byteLength(file) > 5_000_000)
    throw new Error("Report exceeds 5 MB.");
  const report = schema.parse(JSON.parse(file));
  const receipts = report.evidenceSnapshot ?? [];
  if (new Set(receipts.map((r) => r.id)).size !== receipts.length)
    throw new Error("Duplicate source receipt IDs.");
  if (
    report.missingEvidenceIds?.length ||
    report.evidenceIds.some((id) => !receipts.some((r) => r.id === id))
  )
    throw new Error(
      "Source receipts are missing. Integrity cannot be checked for every reference.",
    );
  for (const receipt of receipts) {
    if (!report.evidenceIds.includes(receipt.id))
      throw new Error("Unreferenced source receipt.");
    if ((await digest(receipt.rawResponse)) !== receipt.responseHash)
      throw new Error("A source response hash does not match.");
  }
  console.log(
    JSON.stringify(
      {
        mode: report.mode ?? "legacy-unknown",
        checkedReceipts: receipts.length,
        result: receipts.length
          ? "Stored response hashes match."
          : "No source receipts to verify.",
        limitation:
          "This checks stored response integrity only. It does not authenticate the issuer, validate derived scores, establish a live API call, or prove real-world impact.",
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(
    error instanceof z.ZodError
      ? "Invalid report structure."
      : (error as Error).message,
  );
  process.exitCode = 1;
}
