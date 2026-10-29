import { test } from "node:test";
import assert from "node:assert/strict";
import {
  organizerStudyFixture,
  studyFixture,
  parseStudyRecord,
  summarizeStudyRecords,
} from "../lib/organizer-study.ts";
import { propose } from "../lib/planner.ts";
function record(kind = "organizer", complete = true) {
  const doc = organizerStudyFixture();
  const plan = propose(doc, { type: "cancellation", candidateId: "a1" })
    .options[0].assignments;
  return {
    schema: "mend-organizer-trial-v2",
    sessionId: crypto.randomUUID(),
    participant: "anonymous",
    participantKind: kind,
    consent: true,
    fixture: studyFixture,
    order: ["manual", "mend"],
    trials: ["manual", "mend"].map((method, i) => ({
      method,
      status: i === 1 && !complete ? "abandoned" : "completed",
      startedAt: "2026-10-29T00:00:00.000Z",
      finishedAt: "2026-10-29T00:01:00.000Z",
      elapsedMs: i ? 30000 : 60000,
      attempts: [
        {
          at: "2026-10-29T00:00:30.000Z",
          violations: ["Unavailable participant"],
        },
        { at: "2026-10-29T00:01:00.000Z", violations: [] },
      ],
      assignments: plan,
    })),
  };
}
test("impact aggregation retains failures and unfinished trials and excludes builder/automation from organizer pairs", () => {
  const summary = summarizeStudyRecords([
    record(),
    record("organizer", false),
    record("builder"),
    record("automated"),
  ]);
  assert.equal(summary.organizerSessions, 2);
  assert.equal(summary.nonOrganizerSessions, 2);
  assert.equal(summary.completedOrganizerPairs, 1);
  assert.equal(summary.organizerTrials[1].abandoned, 1);
  assert.equal(summary.organizerTrials[0].failedSubmissions, 2);
  assert.equal(summary.medianPairedTimeDifferenceMs, 30000);
});
test("duplicate sessions, invalid completed assignments and reversed times cannot enter the summary", () => {
  const d = record();
  assert.throws(() => summarizeStudyRecords([d, d]), /Duplicate/);
  d.trials[0].assignments = [];
  assert.throws(() => parseStudyRecord(d), /feasible/);
  const reversed = record();
  reversed.trials[0].elapsedMs = -1;
  assert.throws(() => parseStudyRecord(reversed));
  const invalid = record();
  invalid.trials[0].finishedAt = "2026-10-28T00:00:00.000Z";
  assert.throws(() => parseStudyRecord(invalid), /reversed/);
});
test("empty organizer samples report no measured benefit", () => {
  const summary = summarizeStudyRecords([record("automated")]);
  assert.equal(summary.completedOrganizerPairs, 0);
  assert.equal(summary.medianPairedTimeDifferenceMs, null);
});
