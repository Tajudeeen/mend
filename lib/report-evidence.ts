import type { Evidence, RecoveryReport } from "./model.ts";

/** Prefer immutable approval-time receipts. Legacy reports may lack snapshots. */
export function reportEvidence(report: RecoveryReport, current: Evidence[]) {
  const source = report.evidenceSnapshot ?? current;
  const receipts = source.filter((receipt) =>
    report.evidenceIds.includes(receipt.id),
  );
  return {
    receipts,
    missingIds: report.evidenceIds.filter(
      (id) => !receipts.some((receipt) => receipt.id === id),
    ),
  };
}
