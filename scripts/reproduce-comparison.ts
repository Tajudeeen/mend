import { readFile, stat } from "node:fs/promises";
import { z } from "zod";
import { compareRepairs } from "../lib/comparison.ts";
import {
  briefSchema,
  candidateFieldsSchema,
  zoneSchema,
  slotSchema,
  scenarioSchema,
  type EventDoc,
} from "../lib/model.ts";

const assignment = z.object({
  slotId: z.string(),
  candidateId: z.string(),
  zoneId: z.string(),
});
const finiteScore = z.number().finite().min(0).max(1);
const event = z.object({
  id: z.string().uuid(),
  revision: z.number().int().min(0),
  createdAt: z.string(),
  brief: briefSchema,
  mode: z.enum(["demo", "live"]),
  scenario: scenarioSchema,
  candidates: z
    .array(
      z
        .object({
          id: z.string(),
          affinity: z.record(finiteScore),
          entityId: z.string().optional(),
          culturalProfile: z
            .object({
              entities: z
                .array(z.object({ id: z.string(), name: z.string() }))
                .max(3),
            })
            .optional(),
        })
        .passthrough(),
    )
    .max(40),
  zones: z.array(zoneSchema).max(30),
  slots: z.array(slotSchema).max(18),
  plan: z.array(assignment).max(18),
  referencePlan: z.array(assignment).max(18).optional(),
  locks: z.array(z.string()).max(18).optional(),
  constraints: z
    .object({
      excludedAllergens: z.array(z.string()).max(30),
      minimumSpacing: z.number().min(0).max(20),
    })
    .optional(),
  optimizer: z.object({
    version: z.literal("rank-v2"),
    relevance: z.number().min(0).max(100),
    balance: z.number().min(0).max(100),
    continuity: z.number().min(0).max(100),
    stability: z.number().min(0).max(100),
    maxNodes: z.number().int().min(100).max(50000),
  }),
  evidence: z
    .array(
      z
        .object({
          cohortId: z.string(),
          kind: z.enum(["artist", "vendor"]),
          entities: z.record(finiteScore),
          poolKey: z.string().optional(),
        })
        .passthrough(),
    )
    .max(6),
});
try {
  if (process.argv.length !== 3)
    throw new Error("Usage: pnpm reproduce:comparison FILE");
  if ((await stat(process.argv[2])).size > 5_000_000)
    throw new Error("Comparison exceeds 5 MB.");
  const data = JSON.parse(await readFile(process.argv[2], "utf8"));
  z.object({
    format: z.literal("mend-comparison-v1"),
    scenario: scenarioSchema,
    inputSnapshot: event,
  }).parse(data);
  for (const candidate of data.inputSnapshot.candidates)
    candidateFieldsSchema.parse(candidate);
  // Validate without replacing absent legacy fields with schema defaults.
  const replay = compareRepairs(data.inputSnapshot as EventDoc, data.scenario);
  for (const key of [
    "cultural",
    "rulesOnly",
    "assignmentChanged",
    "maxNodes",
    "evidenceIds",
  ]) {
    if (
      JSON.stringify(replay[key as keyof typeof replay]) !==
      JSON.stringify(data[key])
    )
      throw new Error(`Comparison does not reproduce: ${key}`);
  }
  console.log(
    JSON.stringify(
      {
        status: "reproduced",
        mode: replay.mode,
        assignmentChanged: replay.assignmentChanged,
        limitation:
          "Reproduces the exported inputs with this planner revision. Does not authenticate Qloo, prove live requests or establish better real-world outcomes.",
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(
    error instanceof z.ZodError
      ? "Invalid comparison inputs."
      : (error as Error).message,
  );
  process.exitCode = 1;
}
