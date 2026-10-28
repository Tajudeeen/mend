import { spawnSync, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const pnpm = process.env.SITES_PNPM_BIN
  ? [process.execPath, process.env.SITES_PNPM_BIN]
  : ["pnpm"];
const command = (name) => [...pnpm, "run", name];
const steps = [
  ["repository", [process.execPath, "scripts/check-repo.mjs"]],
  ["secret-patterns", [process.execPath, "scripts/check-secrets.mjs"]],
  ["prisma-client", command("db:generate:postgres")],
  ["types", command("typecheck")],
  ["lint", command("lint")],
  ["native-tests", command("test")],
  ["component-provider-tests", command("test:ui")],
  ["synthetic-benchmark", command("benchmark")],
  ["node-build", command("build:node")],
  ["worker-build", command("build")],
  ["worker-database-workflow", [process.execPath, "tests/worker-smoke.mjs"]],
];
const files = execFileSync(
  "git",
  ["ls-files", "-co", "--exclude-standard", "-z"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);
const hash = createHash("sha256");
for (const file of [...new Set(files)].sort())
  if (existsSync(file)) hash.update(file + "\0").update(readFileSync(file));
const report = {
  startedAt: new Date().toISOString(),
  node: process.version,
  sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  sourceDigest: hash.digest("hex"),
  workingTreeDirty: !!execFileSync("git", ["status", "--porcelain"], {
    encoding: "utf8",
  }).trim(),
  checks: [],
  externalRequirementsVerified: false,
  pending: [
    "Live Qloo/model repair",
    "Anonymous hosted demo",
    "Deployed production auth/persistence",
    "Browser/mobile QA",
    "Entrant eligibility and Devpost submission",
  ],
};
for (const [name, args] of steps) {
  console.log(`\nChecking ${name}`);
  const started = Date.now();
  const result = spawnSync(args[0], args.slice(1), {
    stdio: "inherit",
    timeout: 300000,
  });
  report.checks.push({
    name,
    status: result.status === 0 && !result.error ? "passed" : "failed",
    durationMs: Date.now() - started,
    exitCode: result.status,
  });
  if (result.status !== 0 || result.error) {
    process.exitCode = 1;
    break;
  }
}
report.finishedAt = new Date().toISOString();
report.status =
  report.checks.length === steps.length &&
  report.checks.every((c) => c.status === "passed")
    ? "passed-local-checks"
    : "failed";
mkdirSync("outputs", { recursive: true });
writeFileSync(
  "outputs/verification.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  `Verification report: outputs/verification.json (${report.status}). External host gates remain separate.`,
);
