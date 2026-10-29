import { readFile } from "node:fs/promises";
import { summarizeStudyRecords } from "../../lib/organizer-study.ts";
const files = process.argv.slice(2);
try {
  if (!files.length || files.length > 1000) throw new Error("usage");
  const records = await Promise.all(
    files.map(async (file) => {
      const bytes = await readFile(file);
      if (bytes.byteLength > 1_000_000) throw new Error("size");
      return JSON.parse(bytes.toString("utf8"));
    }),
  );
  console.log(JSON.stringify(summarizeStudyRecords(records), null, 2));
} catch {
  console.error(
    "Study records could not be summarized. Supply distinct v2 JSON records with consent, valid trial order and feasible completed assignments. Maximum 1 MB per file. Raw content is not printed.",
  );
  process.exitCode = 1;
}
