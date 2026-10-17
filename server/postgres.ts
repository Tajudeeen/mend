import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "@/generated/prisma/client";
import type { EventDoc } from "@/lib/model";
let singleton: PrismaClient | undefined;
function db() {
  if (!process.env.DATABASE_URL)
    throw new Error(
      "PostgreSQL is not configured. Use the public demo until Supabase is connected.",
    );
  return (singleton ??= new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      max: 3,
    }),
  }));
}
const json = (value: unknown) => JSON.parse(JSON.stringify(value));
async function snapshot(
  tx: Prisma.TransactionClient,
  owner: string,
  doc: EventDoc,
  action: string,
  detail: string,
) {
  await tx.planRevision.create({
    data: {
      id: crypto.randomUUID(),
      eventId: doc.id,
      revision: doc.revision,
      status: doc.proposal?.status ?? "draft",
      document: json(doc),
      assignments: {
        create: doc.plan.map((a) => ({
          slotId: a.slotId,
          participantId: a.candidateId,
          zoneId: a.zoneId,
          locked: doc.locks?.includes(a.slotId) ?? false,
        })),
      },
    },
  });
  await tx.auditEvent.create({
    data: {
      id: crypto.randomUUID(),
      eventId: doc.id,
      owner,
      revision: doc.revision,
      action,
      detail,
    },
  });
  // Keep queryable operational entities alongside the immutable revision document.
  await tx.participant.deleteMany({ where: { eventId: doc.id } });
  await tx.zone.deleteMany({ where: { eventId: doc.id } });
  await tx.lineupSlot.deleteMany({ where: { eventId: doc.id } });
  for (const c of doc.candidates)
    await tx.participant.create({
      data: {
        id: c.id,
        eventId: doc.id,
        name: c.name,
        kind: c.kind,
        category: c.category,
        fee: c.feeKnown === false ? null : c.fee,
        availability: c.availabilityKnown === false ? null : c.available,
        confirmed: c.verified,
        properties: json(c),
        offerings: {
          create: (c.offerings ?? []).map((o) => ({ ...o, eventId: doc.id })),
        },
      },
    });
  if (doc.zones.length)
    await tx.zone.createMany({
      data: doc.zones.map((z) => ({
        id: z.id,
        eventId: doc.id,
        name: z.name,
        kind: z.kind,
        properties: json(z),
      })),
    });
  if (doc.slots.length)
    await tx.lineupSlot.createMany({
      data: doc.slots.map((s) => ({
        id: s.id,
        eventId: doc.id,
        name: s.name,
        kind: s.kind,
        start: s.from,
        end: s.to,
      })),
    });
  for (const e of doc.evidence) {
    if (await tx.evidenceRecord.findUnique({ where: { id: e.id } })) continue;
    await tx.evidenceRecord.create({
      data: {
        id: e.id,
        eventId: doc.id,
        provider: e.provider,
        hash: e.responseHash,
        context: json(e.params),
        payload: json(e),
      },
    });
  }
  for (const r of doc.reports ?? []) {
    if (await tx.recoveryReport.findUnique({ where: { id: r.id } })) continue;
    await tx.recoveryReport.create({
      data: {
        id: r.id,
        eventId: doc.id,
        proposalId: r.proposalId,
        payload: json(r),
      },
    });
  }
  for (const r of doc.agentRuns ?? []) {
    if (await tx.recoveryRun.findUnique({ where: { id: r.id } })) continue;
    await tx.recoveryRun.create({
      data: { id: r.id, eventId: doc.id, state: r.state, payload: json(r) },
    });
  }
}
async function withOwner<T>(
  owner: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return db().$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT set_config('request.jwt.claim.sub', ${owner}, true)`;
      return fn(tx);
    },
    { timeout: 15000 },
  );
}
export async function listEvents(owner: string) {
  return withOwner(owner, (tx) =>
    tx.event.findMany({
      where: { owner },
      select: { id: true, name: true, revision: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
  );
}
export async function loadEvent(owner: string, id: string) {
  return withOwner(owner, async (tx) => {
    const row = await tx.event.findFirst({ where: { id, owner } });
    if (!row) throw new Error("Event not found.");
    return row.document as unknown as EventDoc;
  });
}
export async function auditFor(owner: string, id: string) {
  return withOwner(owner, async (tx) =>
    (
      await tx.auditEvent.findMany({
        where: { owner, eventId: id },
        orderBy: { revision: "desc" },
        take: 100,
      })
    ).map((r) => ({ ...r, actor: r.owner, at: r.at.toISOString() })),
  );
}
export async function revisionsFor(owner: string, id: string) {
  return withOwner(owner, async (tx) => {
    const event = await tx.event.findFirst({
      where: { id, owner },
      select: { id: true },
    });
    if (!event) throw new Error("Event not found.");
    const rows = await tx.planRevision.findMany({
      where: { eventId: id },
      orderBy: { revision: "desc" },
      take: 100,
    });
    return rows.map((r) => r.document as unknown as EventDoc);
  });
}
export async function createEvent(
  owner: string,
  doc: EventDoc,
  requestKey?: string,
) {
  await withOwner(owner, async (tx) => {
    await tx.event.create({
      data: { id: doc.id, owner, name: doc.brief.name, document: json(doc) },
    });
    await snapshot(
      tx,
      owner,
      doc,
      "event.created",
      "Created an organizer event.",
    );
    if (requestKey)
      await tx.operationKey.create({
        data: { owner, key: requestKey, result: json(doc) },
      });
  });
  return doc;
}
export async function saveEvent(
  owner: string,
  before: EventDoc,
  after: EventDoc,
  action: string,
  detail: string,
  requestKey?: string,
) {
  after.revision = before.revision + 1;
  await withOwner(owner, async (tx) => {
    const result = await tx.event.updateMany({
      where: { id: before.id, owner, revision: before.revision },
      data: {
        revision: after.revision,
        name: after.brief.name,
        document: json(after),
      },
    });
    if (result.count !== 1)
      throw new Error(
        "This event changed in another session. Reload before trying again.",
      );
    await snapshot(tx, owner, after, action, detail);
    if (requestKey)
      await tx.operationKey.create({
        data: { owner, key: requestKey, result: json(after) },
      });
  });
  return after;
}

export async function operationResult(owner: string, key: string) {
  return withOwner(owner, async (tx) => {
    const row = await tx.operationKey.findUnique({
      where: { owner_key: { owner, key } },
    });
    return row ? (row.result as unknown as EventDoc) : null;
  });
}
