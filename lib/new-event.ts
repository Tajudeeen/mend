import { sampleEvent } from "./seed.ts";
import { briefSchema, type EventDoc } from "./model.ts";
export function newEvent(input: unknown): EventDoc {
  const doc = sampleEvent();
  doc.brief = briefSchema.parse(input);
  doc.candidates = [];
  doc.slots = [];
  doc.zones = [];
  doc.plan = [];
  doc.referencePlan = [];
  doc.locks = [];
  doc.evidence = [];
  doc.reports = [];
  doc.agentRuns = [];
  doc.mode = "live";
  return doc;
}
