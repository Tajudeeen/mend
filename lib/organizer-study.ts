import { z } from "zod";
import { sampleEvent } from "./seed.ts";
import { validate } from "./planner.ts";
export const studyFixture = "synthetic-cancellation-locked-rest-v1";
export function organizerStudyFixture() {
  const doc = sampleEvent("00000000-0000-4000-8000-000000000002");
  doc.locks = doc.slots.filter((s) => s.id !== "opening").map((s) => s.id);
  return doc;
}
const method = z.enum(["manual", "mend"]);
export const trialSchema = z.object({
  method,
  status: z.enum(["completed", "abandoned", "in_progress"]),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime(),
  elapsedMs: z.number().int().min(0).max(86_400_000),
  attempts: z
    .array(
      z.object({
        at: z.string().datetime(),
        violations: z.array(z.string().max(1000)).max(100),
      }),
    )
    .max(1000),
  assignments: z
    .array(
      z.object({
        slotId: z.string(),
        candidateId: z.string(),
        zoneId: z.string(),
      }),
    )
    .max(18),
});
export type StudyTrial = z.infer<typeof trialSchema>;
const recordSchema = z.object({
  schema: z.literal("mend-organizer-trial-v2"),
  sessionId: z.string().uuid(),
  participant: z.string().max(60),
  participantKind: z.enum(["organizer", "builder", "automated"]),
  consent: z.literal(true),
  fixture: z.literal(studyFixture),
  order: z.array(method).length(2),
  trials: z.array(trialSchema).max(2),
});
export function parseStudyRecord(input: unknown) {
  const record = recordSchema.parse(input);
  if (new Set(record.order).size !== 2)
    throw new Error("Each method must occur once.");
  record.trials.forEach((trial, i) => {
    if (trial.method !== record.order[i])
      throw new Error("Trial order does not match the recorded order.");
    if (Date.parse(trial.finishedAt) < Date.parse(trial.startedAt))
      throw new Error("Trial timestamps are reversed.");
    if (trial.status === "in_progress" && i !== record.trials.length - 1)
      throw new Error("Only the last trial can be in progress.");
    if (trial.status === "completed") {
      const errors = validate(organizerStudyFixture(), trial.assignments, {
        type: "cancellation",
        candidateId: "a1",
      });
      if (
        errors.length ||
        !trial.attempts.length ||
        trial.attempts.at(-1)!.violations.length
      )
        throw new Error(
          "Completed trial does not contain a feasible submitted repair.",
        );
    }
  });
  return record;
}
export function summarizeStudyRecords(inputs: unknown[]) {
  if (!inputs.length || inputs.length > 1000)
    throw new Error("Provide 1–1000 trial records.");
  const records = inputs.map(parseStudyRecord);
  if (new Set(records.map((r) => r.sessionId)).size !== records.length)
    throw new Error(
      "Duplicate study session. Do not count the same session twice.",
    );
  const organizers = records.filter((r) => r.participantKind === "organizer");
  const paired = organizers.filter(
    (r) =>
      r.trials.length === 2 && r.trials.every((t) => t.status === "completed"),
  );
  const median = (values: number[]) => {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b),
      mid = Math.floor(sorted.length / 2);
    return sorted.length % 2
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  };
  return {
    schema: "mend-organizer-summary-v1",
    records: records.length,
    organizerSessions: organizers.length,
    nonOrganizerSessions: records.length - organizers.length,
    completedOrganizerPairs: paired.length,
    organizerTrials: (["manual", "mend"] as const).map((method) => {
      const trials = organizers.flatMap((r) =>
        r.trials.filter((t) => t.method === method),
      );
      return {
        method,
        started: trials.length,
        completed: trials.filter((t) => t.status === "completed").length,
        abandoned: trials.filter((t) => t.status === "abandoned").length,
        inProgress: trials.filter((t) => t.status === "in_progress").length,
        failedSubmissions: trials.reduce(
          (n, t) => n + t.attempts.filter((a) => a.violations.length).length,
          0,
        ),
      };
    }),
    pairedResults: paired.map((r) => ({
      sessionId: r.sessionId,
      order: r.order,
      manualMs: r.trials.find((t) => t.method === "manual")!.elapsedMs,
      mendMs: r.trials.find((t) => t.method === "mend")!.elapsedMs,
    })),
    medianPairedTimeDifferenceMs: median(
      paired.map(
        (r) =>
          r.trials.find((t) => t.method === "manual")!.elapsedMs -
          r.trials.find((t) => t.method === "mend")!.elapsedMs,
      ),
    ),
    orderCounts: {
      manualFirst: paired.filter((r) => r.order[0] === "manual").length,
      mendFirst: paired.filter((r) => r.order[0] === "mend").length,
    },
    limitation:
      "Self-reported local records, not participant authentication or independent attestation. Positive paired time difference means the assisted task was faster in this sample. Incomplete trials remain counted. A synthetic task does not prove live Qloo relevance, booking success, attendance, revenue or population-level benefit.",
  };
}
