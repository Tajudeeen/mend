import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const required = [
  "qloo-agent",
  "public-demo",
  "public-source",
  "open-source-license",
  "written-description",
  "eligibility-registration",
  "testing-language",
  "finalist-availability",
];
const manifest = JSON.parse(
  readFileSync("docs/host-requirements.json", "utf8"),
);
const ids = manifest.requirements.map((r) => r.id);
if (ids.length !== required.length || required.some((id) => !ids.includes(id)))
  throw new Error("A required host gate is missing or duplicated.");
const rubric = [
  "technological-implementation",
  "design",
  "potential-impact",
  "quality-of-idea",
];
if (
  manifest.rubric.length !== rubric.length ||
  rubric.some(
    (id) => !manifest.rubric.some((r) => r.id === id && r.weight === 25),
  )
)
  throw new Error("Preserve all four equally weighted judging criteria.");
if (manifest.videoRequired !== false)
  throw new Error("The current host does not require a video.");
for (const gate of manifest.requirements) {
  if (!gate.externalCheck)
    throw new Error(`Missing verification boundary for ${gate.id}`);
  for (const file of gate.implementation)
    if (!existsSync(file))
      throw new Error(`Missing required evidence/source file: ${file}`);
}
if (!readFileSync("LICENSE", "utf8").includes("MIT License"))
  throw new Error("Retain the MIT license.");
const files = execFileSync(
  "git",
  ["ls-files", "-co", "--exclude-standard", "-z"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);
for (const file of new Set(files)) {
  if (!existsSync(file)) continue;
  if (
    /^(node_modules|dist|generated|outputs|coverage|\.next|\.next-node|\.wrangler)\//.test(
      file,
    )
  )
    throw new Error(`Generated/runtime output must not be tracked: ${file}`);
  if (!file.endsWith(".md")) continue;
  for (const match of readFileSync(file, "utf8").matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (!target || /^(?:[a-z]+:|\/)/i.test(target) || target.includes("<"))
      continue;
    if (!existsSync(path.resolve(path.dirname(file), target)))
      throw new Error(`Broken documentation link in ${file}: ${target}`);
  }
}
// The hosting adapter must consume the directory Next actually builds.
const nextConfig = (await import("../next.config.ts")).default;
const vercelConfig = JSON.parse(readFileSync("vercel.json", "utf8"));
if ((nextConfig.distDir ?? ".next") !== vercelConfig.outputDirectory)
  throw new Error("Vercel outputDirectory must match Next.js distDir.");

console.log(
  JSON.stringify({
    repositoryChecks: "passed",
    hostGatesPreserved: ids,
    externalRequirementsVerified: false,
  }),
);
