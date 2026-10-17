import { runtimeEnv } from "./runtime";
import * as store from "./store";
import type { EventDoc } from "./model";
async function postgres() {
  return import("../server/postgres");
}
export async function listEvents(owner: string) {
  const d = runtimeEnv().DB;
  return d ? store.listEvents(d, owner) : (await postgres()).listEvents(owner);
}
export async function loadEvent(owner: string, id: string) {
  const d = runtimeEnv().DB;
  return d
    ? store.loadEvent(d, owner, id)
    : (await postgres()).loadEvent(owner, id);
}
export async function auditFor(owner: string, id: string) {
  const d = runtimeEnv().DB;
  return d
    ? store.auditFor(d, owner, id)
    : (await postgres()).auditFor(owner, id);
}
export async function createEvent(
  owner: string,
  doc: EventDoc,
  requestKey?: string,
) {
  const d = runtimeEnv().DB;
  return d
    ? store.createEvent(d, owner, doc, requestKey)
    : (await postgres()).createEvent(owner, doc, requestKey);
}
export async function saveEvent(
  owner: string,
  before: EventDoc,
  after: EventDoc,
  action: string,
  detail: string,
  requestKey?: string,
) {
  const d = runtimeEnv().DB;
  return d
    ? store.saveEvent(d, owner, before, after, action, detail, requestKey)
    : (await postgres()).saveEvent(
        owner,
        before,
        after,
        action,
        detail,
        requestKey,
      );
}
export async function revisionsFor(owner: string, id: string) {
  const d = runtimeEnv().DB;
  return d
    ? store.revisionsFor(d, owner, id)
    : (await postgres()).revisionsFor(owner, id);
}

export async function operationResult(owner: string, key: string) {
  const d = runtimeEnv().DB;
  return d
    ? store.operationResult(d, owner, key)
    : (await postgres()).operationResult(owner, key);
}
