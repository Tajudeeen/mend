import { readFile, stat } from "node:fs/promises";
import { maxReportBytes, verifyReport } from "../lib/verify-report.ts";

try {
  if (process.argv.length !== 3)
    throw new Error(
      "Usage: pnpm verify:report /absolute/path/to/mend-report.json",
    );
  if ((await stat(process.argv[2])).size > maxReportBytes)
    throw new Error("Report exceeds 5 MB.");
  console.log(
    JSON.stringify(
      await verifyReport(await readFile(process.argv[2], "utf8")),
      null,
      2,
    ),
  );
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
