import { test } from "node:test";
import assert from "node:assert/strict";
import { qloo } from "../lib/qloo.ts";

const env = { QLOO_API_KEY: "synthetic-qloo-key" };
test("Qloo stops an oversized streamed body before consuming the rest", async () => {
  const previous = globalThis.fetch;
  let cancelled = false;
  try {
    globalThis.fetch = async () =>
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new Uint8Array(60000).fill(32));
            controller.enqueue(new Uint8Array(60000).fill(32));
            // Deliberately never close. Overflow must cancel, not await the tail.
          },
          cancel() {
            cancelled = true;
          },
        }),
      );
    await assert.rejects(qloo(env, "/search", {}), /evidence size limit/);
    assert.equal(cancelled, true);
  } finally {
    globalThis.fetch = previous;
  }
});

test("Qloo size limits count UTF-8 bytes rather than JavaScript characters", async () => {
  const previous = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      Response.json({ message: "é".repeat(60000), results: [] });
    await assert.rejects(qloo(env, "/search", {}), /evidence size limit/);
  } finally {
    globalThis.fetch = previous;
  }
});

test("Qloo decodes UTF-8 characters split between streamed chunks", async () => {
  const previous = globalThis.fetch;
  try {
    const bytes = new TextEncoder().encode(
      JSON.stringify({ results: [], name: "Beyoncé" }),
    );
    const split = bytes.indexOf(0xc3) + 1;
    globalThis.fetch = async () =>
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(bytes.slice(0, split));
            controller.enqueue(bytes.slice(split));
            controller.close();
          },
        }),
      );
    assert.equal((await qloo(env, "/search", {})).name, "Beyoncé");
  } finally {
    globalThis.fetch = previous;
  }
});

test("Qloo holds all four concurrency slots while response bodies are pending", async () => {
  const previous = globalThis.fetch;
  const streams: ReadableStreamDefaultController<Uint8Array>[] = [];
  let calls = 0;
  const pending: ReturnType<typeof qloo>[] = [];
  const finish = () => {
    for (const controller of streams.splice(0)) {
      controller.enqueue(new TextEncoder().encode('{"results":[]}'));
      controller.close();
    }
  };
  try {
    globalThis.fetch = async () => {
      if (++calls > 4) return Response.json({ results: [] });
      return new Response(
        new ReadableStream({
          start(controller) {
            streams.push(controller);
          },
        }),
      );
    };
    for (let i = 0; i < 4; i++) pending.push(qloo(env, "/search", {}));
    await new Promise<void>((resolve) => setImmediate(resolve));
    await assert.rejects(qloo(env, "/search", {}), /service is busy/);
    assert.equal(calls, 4);
    finish();
    await Promise.all(pending);
    await qloo(env, "/search", {});
    assert.equal(calls, 5);
  } finally {
    finish();
    await Promise.allSettled(pending);
    globalThis.fetch = previous;
  }
});
