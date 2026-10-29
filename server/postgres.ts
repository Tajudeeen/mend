import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "@/generated/prisma/client";
import type { EventDoc } from "@/lib/model";
import { databaseConfig } from "@/server/database-config";
let singleton: PrismaClient | undefined;
function db() {
  if (!process.env.DATABASE_URL)
    throw new Error(
      "PostgreSQL is not configured. Use the public demo until Supabase is connected.",
    );
  return (singleton ??= new PrismaClient({
    adapter: new PrismaPg(
      databaseConfig(process.env.DATABASE_URL, process.env.DATABASE_CA_CERT),
    ),
  }));
}
// Readiness probes expose only a bounded status, never a connection URL or raw error.
let readiness: { expires: number; result: Promise<boolean> } | undefined;
export function postgresReady(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return Promise.resolve(false);
  if (readiness && readiness.expires > Date.now()) return readiness.result;
  const result = withOwner(
    "00000000-0000-4000-8000-000000000000",
    async (tx) => {
      const roles = await tx.$queryRaw<
        { rolsuper: boolean; rolbypassrls: boolean }[]
      >`
      SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user
    `;
      if (!roles.length || roles[0].rolsuper || roles[0].rolbypassrls)
        return false;
      // Exercise the actual Prisma table and RLS path without returning organizer data.
      await tx.event.findMany({
        where: { owner: "00000000-0000-4000-8000-000000000000" },
        select: { id: true },
        take: 1,
      });
      return true;
    },
  ).catch((error: unknown) => {
    // Log classified diagnostics only, never provider messages or connection strings.
    const e = error as {
      code?: string;
      message?: string;
      meta?: { driverAdapterError?: { cause?: { originalCode?: string } } };
    };
    const message = String(e.message ?? "");
    const reason = /certificate|SSL|TLS|self.signed/i.test(message)
      ? "tls"
      : /password|SASL|Tenant or user/i.test(message)
        ? "credentials"
        : /permission denied/i.test(message)
          ? "permissions"
          : /timed out|timeout/i.test(message)
            ? "timeout"
            : /ENOTFOUND|EAI_AGAIN/i.test(message)
              ? "dns"
              : /does not exist|P2021/i.test(message)
                ? "schema"
                : "connection";
    const code = String(e.code ?? "");
    const driverCode = String(
      e.meta?.driverAdapterError?.cause?.originalCode ?? "",
    );
    console.error("MEND database readiness failed", {
      reason,
      code: /^[A-Z0-9_]{1,24}$/.test(code) ? code : "unknown",
      driverCode: /^[A-Z0-9_]{1,24}$/.test(driverCode) ? driverCode : "unknown",
    });
    return false;
  });
  readiness = { expires: Date.now() + 30000, result };
  return result;
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

// This probe deliberately never commits. Random owners and record IDs keep it
// isolated from organizer data, even if an RLS policy is broken.
export async function verifyPostgresIsolation() {
  const ownerA = crypto.randomUUID(),
    ownerB = crypto.randomUUID();
  const id = crypto.randomUUID(),
    auditId = crypto.randomUUID();
  const checks: string[] = [];
  class ProbeRollback extends Error {}
  const ensure = (ok: boolean, label: string) => {
    if (!ok) throw new Error("Storage isolation check failed.");
    checks.push(label);
  };
  try {
    await withOwner(ownerA, async (tx) => {
      const roles = await tx.$queryRaw<
        { rolsuper: boolean; rolbypassrls: boolean }[]
      >`
        SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user`;
      ensure(
        roles.length === 1 && !roles[0].rolsuper && !roles[0].rolbypassrls,
        "Limited runtime role",
      );
      const tables = await tx.$queryRaw<
        { relname: string; relrowsecurity: boolean }[]
      >`
        SELECT relname, relrowsecurity FROM pg_class JOIN pg_namespace ON pg_namespace.oid = relnamespace
        WHERE nspname = 'public' AND relname IN ('Event','Participant','VendorOffering','Zone','LineupSlot','PlanRevision','Assignment','EvidenceRecord','RecoveryRun','RecoveryReport','AuditEvent','OperationKey')`;
      ensure(
        tables.length === 12 && tables.every((t) => t.relrowsecurity),
        "RLS enabled on all 12 application tables",
      );
      await tx.event.create({
        data: {
          id,
          owner: ownerA,
          name: "Rollback-only storage probe",
          document: { probe: true },
        },
      });
      await tx.auditEvent.create({
        data: {
          id: auditId,
          eventId: id,
          owner: ownerA,
          revision: 0,
          action: "storage.probe",
          detail: "Never committed",
        },
      });
      ensure(
        !!(await tx.event.findUnique({ where: { id } })),
        "Owner can create and read a test event",
      );
      const ownWrite = await tx.event.updateMany({
        where: { id },
        data: { name: "Owner write confirmed" },
      });
      ensure(ownWrite.count === 1, "Owner can update a test event");
      await tx.$queryRaw`SELECT set_config('request.jwt.claim.sub', ${ownerB}, true)`;
      ensure(
        !(await tx.event.findUnique({ where: { id } })),
        "Other owner cannot read the test event",
      );
      ensure(
        (await tx.auditEvent.findMany({ where: { id: auditId } })).length === 0,
        "Other owner cannot read its audit record",
      );
      ensure(
        (
          await tx.event.updateMany({
            where: { id },
            data: { name: "Must not change" },
          })
        ).count === 0,
        "Other owner cannot update the test event",
      );
      ensure(
        (await tx.event.deleteMany({ where: { id } })).count === 0,
        "Other owner cannot delete the test event",
      );
      // A denied INSERT aborts a PostgreSQL transaction; contain it in a savepoint
      // so we can distinguish the expected RLS rejection from unrelated errors.
      await tx.$executeRawUnsafe("SAVEPOINT mend_probe_insert");
      let denied = false;
      try {
        await tx.event.create({
          data: {
            id: crypto.randomUUID(),
            owner: ownerA,
            name: "Must not insert",
            document: {},
          },
        });
      } catch (error) {
        const e = error as {
          meta?: { driverAdapterError?: { cause?: { originalCode?: string } } };
          message?: string;
        };
        denied =
          e.meta?.driverAdapterError?.cause?.originalCode === "42501" ||
          /row.level security/i.test(e.message ?? "");
      }
      await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT mend_probe_insert");
      ensure(denied, "Other owner cannot insert an event for the first owner");
      await tx.$queryRaw`SELECT set_config('request.jwt.claim.sub', ${ownerA}, true)`;
      const preserved = await tx.event.findUnique({ where: { id } });
      ensure(
        preserved?.name === "Owner write confirmed",
        "Original test record remains unchanged",
      );
      throw new ProbeRollback();
    });
    throw new Error("Storage probe unexpectedly committed.");
  } catch (error) {
    if (!(error instanceof ProbeRollback))
      throw new Error(
        "Storage isolation check failed. No organizer records were targeted.",
      );
  }
  const remaining = await withOwner(ownerA, (tx) =>
    tx.event.findUnique({ where: { id } }),
  );
  ensure(remaining === null, "Rollback confirmed by a separate database read");
  return {
    status: "passed" as const,
    checkedAt: new Date().toISOString(),
    checks,
    limitation:
      "Tests isolated Event writes and AuditEvent reads through the production database role. It does not test every table policy, two real browser sessions, Qloo, model recovery or organizer impact.",
  };
}
