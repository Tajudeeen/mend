// @vitest-environment jsdom
import React from "react";
import { webcrypto } from "node:crypto";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import EvidenceLedger from "../components/mend/evidence-ledger";
import { sampleEvent } from "../lib/seed";
import { digest } from "../lib/integrity";
import { culturalPoolKey } from "../lib/culture";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
test("receipt inspection reports actual consistency failures and drops stale results after a revision change", async () => {
  vi.stubGlobal("crypto", webcrypto);
  const doc = sampleEvent();
  doc.mode = "live";
  doc.candidates[0].entityId = "fixture-artist";
  doc.brief.cohorts[0].seeds = [
    { id: "fixture-interest", name: "Fixture interest" },
  ];
  const rawResponse = {
    results: [{ entity_id: "fixture-artist", query: { affinity: 0.5 } }],
  };
  doc.evidence = [
    {
      id: "fixture-receipt",
      provider: "qloo",
      origin: "https://hackathon.api.qloo.com",
      at: new Date().toISOString(),
      endpoint: "/v2/insights",
      params: { "signal.interests.entities": "fixture-interest" },
      responseHash: await digest(rawResponse),
      rawResponse,
      entities: { "fixture-artist": 0.5 },
      explainability: {},
      cohortId: doc.brief.cohorts[0].id,
      kind: "artist",
      normalization: "Test fixture only",
      poolKey: culturalPoolKey(doc.candidates, "artist"),
    },
  ];
  const props = { audit: [], demo: false, reload: vi.fn(), busy: false };
  const { rerender } = render(<EvidenceLedger {...props} doc={doc} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Check receipt integrity" }),
  );
  expect(
    await screen.findByText(
      "Stored source bodies and affinity values are consistent.",
    ),
  ).toBeTruthy();
  const changed = structuredClone(doc);
  changed.revision++;
  changed.evidence[0].entities["fixture-artist"] = 0.9;
  rerender(<EvidenceLedger {...props} doc={changed} />);
  expect(
    screen.queryByText(
      "Stored source bodies and affinity values are consistent.",
    ),
  ).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Check receipt integrity" }),
  );
  expect(await screen.findByText(/Receipt checks failed/)).toBeTruthy();
  expect(screen.getByText(/affinities FAILED/)).toBeTruthy();
});
