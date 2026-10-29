import type { CulturalFingerprint } from "./fingerprint.ts";
import { z } from "zod";
export const cohortSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(60),
  weight: z.number().min(1).max(100),
  seeds: z
    .array(z.object({ id: z.string().min(1), name: z.string().min(1) }))
    .max(8),
});
export const briefSchema = z.object({
  name: z.string().min(2).max(100),
  city: z.string().min(2).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  budget: z.number().int().min(100).max(10000000),
  attendees: z.number().int().min(1).max(50000),
  description: z.string().max(1500),
  cohorts: z.array(cohortSchema).length(3),
});
export type Brief = z.infer<typeof briefSchema>;
export type Candidate = {
  id: string;
  name: string;
  kind: "artist" | "vendor";
  category: string;
  fee: number;
  power: number;
  available: boolean;
  verified: boolean;
  from: number;
  to: number;
  entityId?: string;
  affinity: Record<string, number>;
  note: string;
  color: string;
  feeKnown?: boolean;
  availabilityKnown?: boolean;
  width?: number;
  depth?: number;
  excluded?: boolean;
  tags?: string[];
  proxyEntityIds?: string[];
  culturalProfile?: {
    version: "proxy-v1";
    rationale: string;
    entities: { id: string; name: string }[];
    resolvedAt: string;
  };
  offerings?: Offering[];
};
export type Zone = {
  id: string;
  name: string;
  kind: "artist" | "vendor";
  capacity: number;
  power: number;
  covered: boolean;
  x: number;
  y: number;
  width?: number;
  depth?: number;
  blocked?: boolean;
  allowedCategories?: string[];
};
export type Slot = {
  id: string;
  name: string;
  kind: "artist" | "vendor";
  from: number;
  to: number;
};
export type Assignment = {
  slotId: string;
  candidateId: string;
  zoneId: string;
};
export type Evidence = {
  id: string;
  provider: "qloo";
  origin?: string;
  at: string;
  endpoint: string;
  params: Record<string, string>;
  responseHash: string;
  hashAlgorithm?: "sha256-json-v1" | "sha256-canonical-json-v2";
  rawResponse: unknown;
  entities: Record<string, number>;
  explainability: unknown;
  cohortId: string;
  kind: "artist" | "vendor";
  normalization: string;
  poolKey?: string;
  candidateProfiles?: Record<
    string,
    { source: "direct" | "proxy"; entityIds: string[]; rationale?: string }
  >;
};
export type Scenario = {
  type: "none" | "cancellation" | "rain" | "budget" | "closure" | "offering";
  candidateId?: string;
  budget?: number;
  zoneId?: string;
  offeringId?: string;
  replacementOfferingId?: string;
  excludedAllergens?: string[];
};
export type Metrics = {
  cost: number;
  weighted: number;
  floor: number;
  cohorts: Record<string, number>;
  changes: number;
  unknowns: string[];
  continuity: number;
  stability: number;
  domains: Record<string, number>;
};
export type Option = {
  id: string;
  assignments: Assignment[];
  metrics: Metrics;
  violations: string[];
  objective: number;
  conditional?: boolean;
  offeringChange?: { candidateId: string; from: string; to: string };
};
export type Proposal = {
  id: string;
  baseRevision: number;
  scenario: Scenario;
  options: Option[];
  mode: "demo" | "live";
  evidenceIds: string[];
  at: string;
  durationMs: number;
  examined: number;
  trace: { tool: string; detail: string }[];
  status: "pending" | "approved" | "rejected";
  selectedId?: string;
  optimizer?: OptimizerConfig;
  truncated?: boolean;
  inputHash?: string;
  reasons?: string[];
  originRevision?: number;
};
export type EventDoc = {
  id: string;
  revision: number;
  brief: Brief;
  candidates: Candidate[];
  zones: Zone[];
  slots: Slot[];
  plan: Assignment[];
  mode: "demo" | "live";
  evidence: Evidence[];
  proposal?: Proposal;
  scenario: Scenario;
  createdAt: string;
  locks?: string[];
  optimizer?: OptimizerConfig;
  reports?: RecoveryReport[];
  agentRuns?: AgentRun[];
  constraints?: { excludedAllergens: string[]; minimumSpacing: number };
  referencePlan?: Assignment[];
  draftPlan?: Assignment[];
};
export type Audit = {
  id: string;
  eventId: string;
  revision: number;
  action: string;
  at: string;
  detail: string;
  actor: string;
};
export function effective(doc: EventDoc, scenario: Scenario) {
  return {
    budget:
      scenario.type === "budget"
        ? (scenario.budget ?? doc.brief.budget)
        : doc.brief.budget,
    closedZones: [
      ...doc.zones.filter((z) => z.blocked).map((z) => z.id),
      ...(scenario.type === "rain"
        ? doc.zones.filter((z) => !z.covered).map((z) => z.id)
        : scenario.type === "closure"
          ? [scenario.zoneId ?? ""]
          : []),
    ],
    unavailable:
      scenario.type === "cancellation" ? [scenario.candidateId ?? ""] : [],
  };
}
export const scenarioSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("none") }),
  z.object({ type: z.literal("rain") }),
  z.object({ type: z.literal("cancellation"), candidateId: z.string().min(1) }),
  z.object({
    type: z.literal("budget"),
    budget: z.number().int().min(100).max(10000000),
  }),
  z.object({ type: z.literal("closure"), zoneId: z.string().min(1) }),
  z.object({
    type: z.literal("offering"),
    candidateId: z.string().min(1),
    offeringId: z.string().min(1),
    replacementOfferingId: z.string().optional(),
    excludedAllergens: z.array(z.string().max(80)).max(30).optional(),
  }),
]);
export type Offering = {
  id: string;
  name: string;
  available: boolean;
  allergens: string[];
  restrictions: string[];
};
export type OptimizerConfig = {
  version: "rank-v2";
  relevance: number;
  balance: number;
  continuity: number;
  stability: number;
  maxNodes: number;
};
export const defaultOptimizer: OptimizerConfig = {
  version: "rank-v2",
  relevance: 35,
  balance: 25,
  continuity: 25,
  stability: 15,
  maxNodes: 40000,
};
export type RecoveryReport = {
  id: string;
  proposalId: string;
  at: string;
  status: string;
  summary: string;
  before: Assignment[];
  after: Assignment[];
  changes: { slot: string; from: string; to: string; location: string }[];
  checks: string[];
  unknowns: string[];
  evidenceIds: string[];
  limitations: string[];
  fingerprint?: CulturalFingerprint;
  mode?: "demo" | "live";
  evidenceSnapshot?: Evidence[];
  decisionSnapshot?: {
    scenario: Scenario;
    optimizer: OptimizerConfig;
    metrics: Metrics;
    revision: number;
  };
};
export type AgentStep = {
  trigger?: "model" | "server";
  id: string;
  tool: string;
  input: unknown;
  output: unknown;
  at: string;
};
export type AgentRun = {
  id: string;
  configuration?: {
    providerOrigin: string;
    model: string;
    sourceCommit?: string;
    maxSteps: number;
    maxToolCalls: number;
  };
  state:
    | "validating"
    | "investigating"
    | "evaluating"
    | "awaiting_approval"
    | "needs_information"
    | "failed";
  at: string;
  instruction: string;
  steps: AgentStep[];
  explanation?: { text: string; evidenceIds: string[] }[];
  error?: string;
};
export const candidateFieldsSchema = z
  .object({
    name: z.string().min(2).max(100),
    kind: z.enum(["artist", "vendor"]),
    category: z.string().min(1).max(80),
    fee: z.number().int().min(0).max(10000000),
    feeKnown: z.boolean().default(false),
    power: z.number().min(0).max(100),
    available: z.boolean(),
    availabilityKnown: z.boolean().default(false),
    verified: z.boolean(),
    from: z.number().min(0).max(23.99),
    to: z.number().min(0.01).max(24),
    width: z.number().min(0.1).max(50).default(2),
    depth: z.number().min(0.1).max(50).default(2),
    excluded: z.boolean().default(false),
    tags: z.array(z.string().max(100)).max(30).default([]),
    proxyEntityIds: z.array(z.string().uuid()).max(5).default([]),
  })
  .refine((c) => c.from < c.to, "Availability must end after it starts.");
export const zoneSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(80),
  kind: z.enum(["artist", "vendor"]),
  capacity: z.number().int().min(1).max(50000),
  power: z.number().min(0).max(1000),
  covered: z.boolean(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(0.1).max(100).default(5),
  depth: z.number().min(0.1).max(100).default(5),
  blocked: z.boolean().default(false),
  allowedCategories: z.array(z.string().max(80)).max(20).default([]),
});
export const slotSchema = z
  .object({
    id: z.string().min(1).max(80),
    name: z.string().min(1).max(80),
    kind: z.enum(["artist", "vendor"]),
    from: z.number().min(0).max(23.99),
    to: z.number().min(0.01).max(24),
  })
  .refine((s) => s.from < s.to, "Slot must end after it starts.");
