import fs from "node:fs";
import cp from "node:child_process";
const files = cp
  .execFileSync("git", ["ls-files", "-co", "--exclude-standard"], {
    encoding: "utf8",
  })
  .trim()
  .split("\n");
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bsk-[A-Za-z0-9_-]{30,}\b/,
  /postgres(?:ql)?:\/\/[^\s:]+:(?!\[|<|unconfigured)[^\s@]{20,}@/,
];
const bad = [];
for (const file of new Set(files)) {
  if (
    !file ||
    file === "scripts/check-secrets.mjs" ||
    !fs.existsSync(file) ||
    fs.statSync(file).isDirectory()
  )
    continue;
  const text = fs.readFileSync(file, "utf8");
  if (patterns.some((p) => p.test(text))) bad.push(file);
}
if (bad.length) {
  console.error("Potential secret in tracked source:", bad.join(", "));
  process.exit(1);
}
console.log("Tracked-source secret pattern check passed.");
