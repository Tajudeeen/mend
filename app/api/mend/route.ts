import {
  smallJson,
  sameOrigin,
  privateHeaders,
  RequestBodyError,
} from "@/server/http";
import { proposeRestoration } from "@/lib/restoration";
import { runtimeEnv } from "@/lib/runtime";
import { authenticatedOwner } from "@/server/auth";
import { applyCommand } from "@/lib/commands";
import { z } from "zod";
import { sampleEvent } from "@/lib/seed";
import { newEvent } from "@/lib/new-event";
import { rateLimit } from "@/lib/rate-limit";
import { collect, search, type QlooEnv } from "@/lib/qloo";
import {
  operationResult,
  auditFor,
  createEvent,
  listEvents,
  loadEvent,
  saveEvent,
  revisionsFor,
} from "@/lib/repository";
export const dynamic = "force-dynamic";
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: privateHeaders });
const uuid = z.string().uuid();
const owner = authenticatedOwner;
function fail(error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed";
  const status =
    error instanceof RequestBodyError
      ? error.status
      : error instanceof z.ZodError
        ? 400
        : message.includes("Sign in")
          ? 401
          : message.includes("not found")
            ? 404
            : message.includes("another session") || message.includes("stale")
              ? 409
              : 400;
  return json(
    {
      error:
        error instanceof z.ZodError
          ? "Please check the supplied fields."
          : message,
    },
    status,
  );
}
export async function GET(request: Request) {
  const env = runtimeEnv();
  try {
    const user = await owner(request),
      url = new URL(request.url),
      id = url.searchParams.get("id");
    if (!id)
      return json({
        events: await listEvents(user),
        qlooConfigured: !!(env as QlooEnv).QLOO_API_KEY,
      });
    uuid.parse(id);
    return json({
      event: await loadEvent(user, id),
      audit: await auditFor(user, id),
      qlooConfigured: !!(env as QlooEnv).QLOO_API_KEY,
      ...(url.searchParams.get("history") === "1"
        ? { revisions: await revisionsFor(user, id) }
        : {}),
    });
  } catch (e) {
    return fail(e);
  }
}
export async function POST(request: Request) {
  const env = runtimeEnv();
  try {
    if (!sameOrigin(request))
      return json({ error: "Cross-origin request refused." }, 403);
    const user = await owner(request);
    const body = z.record(z.unknown()).parse(await smallJson(request, 40000));
    const action = z.string().min(1).max(40).parse(body.action);
    const requestKey = body.requestKey
      ? uuid.parse(body.requestKey)
      : undefined;
    if (requestKey) {
      const previous = await operationResult(user, requestKey);
      if (previous)
        return json({
          event: previous,
          audit: await auditFor(user, previous.id),
          replayed: true,
        });
    }
    if (body.action === "create") {
      rateLimit(user + ":create", 10);
      const event = await createEvent(
        user,
        body.brief ? newEvent(body.brief) : sampleEvent(),
        requestKey,
      );
      return json({ event, audit: await auditFor(user, event.id) });
    }
    if (body.action === "search") {
      rateLimit(user + ":qloo", 12);
      const q = z.string().min(2).max(100).parse(body.query),
        kind = z.enum(["artist", "vendor"]).parse(body.kind);
      return json({ results: await search(env as QlooEnv, q, kind) });
    }
    rateLimit(user + ":write", 60);
    const id = uuid.parse(body.id);
    const before = await loadEvent(user, id);
    if (z.number().int().parse(body.revision) !== before.revision)
      throw new Error(
        "This event changed in another session. Reload before trying again.",
      );
    let after = structuredClone(before),
      detail = "";
    switch (body.action) {
      case "restoreRevision": {
        const target = z.number().int().min(0).parse(body.targetRevision);
        const history = await revisionsFor(user, id);
        const historical = history.find((r) => r.revision === target);
        if (!historical)
          throw new Error(
            "Historical revision not found in the available history.",
          );
        const result = proposeRestoration(before, historical);
        after = result.event;
        detail = result.detail;
        break;
      }
      case "vendorProfile": {
        const candidate = after.candidates.find(
          (c) => c.id === body.candidateId,
        );
        if (!candidate || candidate.kind !== "vendor")
          throw new Error("Vendor not found.");
        if (body.clear === true) {
          candidate.culturalProfile = undefined;
          candidate.proxyEntityIds = [];
          detail = "Removed vendor proxy profile and invalidated evidence.";
        } else {
          const profile = z
            .object({
              rationale: z.string().trim().min(20).max(600),
              entities: z
                .array(z.object({ id: uuid, name: z.string().min(1).max(100) }))
                .min(1)
                .max(3),
            })
            .parse(body.profile);
          if (
            new Set(profile.entities.map((e) => e.id)).size !==
            profile.entities.length
          )
            throw new Error("Proxy references must be unique.");
          for (const entity of profile.entities) {
            const matches = await search(env as QlooEnv, entity.name, "vendor");
            if (
              !matches.some((m) => m.id === entity.id && m.name === entity.name)
            )
              throw new Error(
                "A selected proxy place could not be reverified with Qloo.",
              );
          }
          candidate.entityId = undefined;
          candidate.culturalProfile = {
            ...profile,
            version: "proxy-v1",
            resolvedAt: new Date().toISOString(),
          };
          candidate.proxyEntityIds = profile.entities.map((e) => e.id);
          detail = `Saved explicit place-reference proxy profile for ${candidate.name}. This is not a direct Qloo identity.`;
        }
        after.evidence = [];
        after.proposal = undefined;
        break;
      }
      case "resolve": {
        const result = z
          .object({ id: uuid, name: z.string().min(1).max(100) })
          .parse(body.entity);
        const kind = z.enum(["artist", "vendor"]).parse(body.kind);
        const verified = await search(env as QlooEnv, result.name, kind);
        if (!verified.some((v) => v.id === result.id))
          throw new Error("Selected entity could not be verified with Qloo.");
        if (body.cohortId) {
          const co = after.brief.cohorts.find((c) => c.id === body.cohortId);
          if (!co) throw new Error("Audience group not found.");
          if (co.seeds.length >= 8)
            throw new Error("Maximum eight seeds per group.");
          if (!co.seeds.some((s) => s.id === result.id)) co.seeds.push(result);
        } else {
          const c = after.candidates.find((c) => c.id === body.candidateId);
          if (!c || c.kind !== kind) throw new Error("Participant not found.");
          c.entityId = result.id;
          c.culturalProfile = undefined;
          c.proxyEntityIds = [];
          // A canonical graph identity must not rename an independent event participant.
          // Organizer booking names remain distinct from their graph references.
        }
        after.evidence = [];
        after.proposal = undefined;
        detail = `Resolved ${result.name} through Qloo entity search. Booking terms still need manual confirmation.`;
        break;
      }
      case "clearSeeds": {
        const co = after.brief.cohorts.find((c) => c.id === body.cohortId);
        if (!co) throw new Error("Audience group not found.");
        co.seeds = [];
        after.evidence = [];
        after.proposal = undefined;
        detail = "Cleared audience interests and invalidated evidence.";
        break;
      }
      case "evidence": {
        if (after.mode !== "live")
          throw new Error("Switch to live mode before fetching Qloo evidence.");
        const co = after.brief.cohorts.find((c) => c.id === body.cohortId);
        if (!co) throw new Error("Audience group not found.");
        const kind = z.enum(["artist", "vendor"]).parse(body.kind);
        const receipt = await collect(
          env as QlooEnv,
          co.id,
          co.seeds.map((s) => s.id),
          after.candidates,
          kind,
        );
        after.evidence = after.evidence.filter(
          (e) => !(e.cohortId === co.id && e.kind === kind),
        );
        after.evidence.push(receipt);
        after.proposal = undefined;
        detail = `Saved a live Qloo ${kind} affinity batch for ${co.name}, SHA-256 ${receipt.responseHash}.`;
        break;
      }
      default: {
        const result = applyCommand(before, action, body);
        after = result.event;
        detail = result.detail;
        break;
      }
    }
    after = await saveEvent(user, before, after, action, detail, requestKey);
    return json({ event: after, audit: await auditFor(user, id) });
  } catch (e) {
    return fail(e);
  }
}
