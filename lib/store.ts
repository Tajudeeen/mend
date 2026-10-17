import type { EventDoc, Audit } from "./model";
export async function listEvents(database: D1Database, owner: string) {
  const { results } = await database
    .prepare(
      "SELECT id, document FROM events WHERE owner = ? ORDER BY updated_at DESC LIMIT 30",
    )
    .bind(owner)
    .all<{ id: string; document: string }>();
  return results.map((r) => {
    const d = JSON.parse(r.document) as EventDoc;
    return {
      id: r.id,
      name: d.brief.name,
      city: d.brief.city,
      revision: d.revision,
    };
  });
}
export async function loadEvent(
  database: D1Database,
  owner: string,
  id: string,
) {
  const row = await database
    .prepare("SELECT document FROM events WHERE id = ? AND owner = ?")
    .bind(id, owner)
    .first<{ document: string }>();
  if (!row) throw new Error("Event not found.");
  return JSON.parse(row.document) as EventDoc;
}
export async function auditFor(
  database: D1Database,
  owner: string,
  id: string,
) {
  const { results } = await database
    .prepare(
      "SELECT id, event_id AS eventId, revision, action, at, detail, actor FROM audit WHERE owner = ? AND event_id = ? ORDER BY revision DESC LIMIT 100",
    )
    .bind(owner, id)
    .all<Audit>();
  return results;
}
export async function createEvent(
  database: D1Database,
  owner: string,
  doc: EventDoc,
  requestKey?: string,
) {
  const now = new Date().toISOString();
  await database.batch([
    database
      .prepare(
        "INSERT INTO events (id,owner,revision,document,updated_at) VALUES (?,?,?,?,?)",
      )
      .bind(doc.id, owner, 0, JSON.stringify(doc), now),
    database
      .prepare(
        "INSERT INTO revisions (id,event_id,owner,revision,document,at) VALUES (?,?,?,?,?,?)",
      )
      .bind(crypto.randomUUID(), doc.id, owner, 0, JSON.stringify(doc), now),
    database
      .prepare(
        "INSERT INTO audit (id,event_id,owner,revision,action,detail,actor,at) VALUES (?,?,?,?,?,?,?,?)",
      )
      .bind(
        crypto.randomUUID(),
        doc.id,
        owner,
        0,
        "event.created",
        "Created a fictional planning sandbox. No bookings or real Qloo evidence.",
        owner,
        now,
      ),
    ...(requestKey
      ? [
          database
            .prepare(
              "INSERT INTO operations (id,owner,result,at) VALUES (?,?,?,?)",
            )
            .bind(owner + ":" + requestKey, owner, JSON.stringify(doc), now),
        ]
      : []),
  ]);
  return doc;
}
export async function saveEvent(
  database: D1Database,
  owner: string,
  before: EventDoc,
  after: EventDoc,
  action: string,
  detail: string,
  requestKey?: string,
) {
  const now = new Date().toISOString();
  after.revision = before.revision + 1;
  const auditId = crypto.randomUUID();
  // D1 batch is transactional. Audit insert depends on successful compare-and-swap update.
  const result = await database.batch([
    database
      .prepare(
        "UPDATE events SET document = ?, revision = ?, updated_at = ? WHERE id = ? AND owner = ? AND revision = ?",
      )
      .bind(
        JSON.stringify(after),
        after.revision,
        now,
        before.id,
        owner,
        before.revision,
      ),
    database
      .prepare(
        "INSERT INTO revisions (id,event_id,owner,revision,document,at) SELECT ?,?,?,?,?,? WHERE changes() = 1",
      )
      .bind(
        crypto.randomUUID(),
        before.id,
        owner,
        after.revision,
        JSON.stringify(after),
        now,
      ),
    database
      .prepare(
        "INSERT INTO audit (id,event_id,owner,revision,action,detail,actor,at) SELECT ?,?,?,?,?,?,?,? WHERE changes() = 1",
      )
      .bind(
        auditId,
        before.id,
        owner,
        after.revision,
        action,
        detail,
        owner,
        now,
      ),
    ...(requestKey
      ? [
          database
            .prepare(
              "INSERT INTO operations (id,owner,result,at) SELECT ?,?,?,? WHERE changes() = 1",
            )
            .bind(owner + ":" + requestKey, owner, JSON.stringify(after), now),
        ]
      : []),
  ]);
  if (result[0].meta.changes !== 1)
    throw new Error(
      "This event changed in another session. Reload before trying again.",
    );
  return after;
}

export async function revisionsFor(
  database: D1Database,
  owner: string,
  id: string,
) {
  const { results } = await database
    .prepare(
      "SELECT document FROM revisions WHERE owner = ? AND event_id = ? ORDER BY revision DESC LIMIT 100",
    )
    .bind(owner, id)
    .all<{ document: string }>();
  return results.map((r) => JSON.parse(r.document) as EventDoc);
}

export async function operationResult(
  database: D1Database,
  owner: string,
  key: string,
) {
  const row = await database
    .prepare("SELECT result FROM operations WHERE id=? AND owner=?")
    .bind(owner + ":" + key, owner)
    .first<{ result: string }>();
  return row ? (JSON.parse(row.result) as EventDoc) : null;
}
