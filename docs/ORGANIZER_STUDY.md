# Organizer comparison protocol

The local instrument at `/study` supports measurement collection. It does not supply evidence by itself.

1. Recruit event organizers who agree to an anonymous test. Explain that the task, fees, participants and cultural ranks are synthetic. Do not enter personal details in the participant code.
2. Alternate manual-first and MEND-first order across participants. Record familiarity with planning tools separately with consent. Give both conditions the same inputs and unaffected-slot locks.
3. Let each person start the timer after reading the brief. The timer stops only after a feasible submission. Preserve failed attempts and the full raw JSON. Do not edit times or discard slow results merely because they favor the manual condition.
4. Collect short qualitative feedback separately: Was the change clear? Were missing facts visible? Could the person explain why they chose a repair? What would prevent use at a real event?
5. Report participant count, task scope, order, raw paired times, failed checks, and uncertainty. Small convenience samples and learning effects limit generalization. A synthetic one-act cancellation is narrower than real festival production.
6. Run additional credentialed real-market tasks before claiming that Qloo improves cultural continuity. This instrument measures operational interaction time, not real booking success, attendance, sales or cultural authenticity.

The browser uses event timestamps for elapsed interaction time and wall-clock ISO dates for record context. Records are self-reported local measurements without independent attestation. No study has been completed or outcome improvement asserted in this release.

## Version 2 records and reproducible summaries

The instrument now records participant role explicitly: event organizer, builder or automated test. It defaults to builder. Stop a trial with **Stop this trial and record it as unfinished** to retain its elapsed time and rejected attempts as `abandoned`. Downloading during an active trial includes an `in_progress` snapshot. Neither state is counted as a completed trial. Unsaved records are in memory and are lost on reload, as the page now states explicitly.

Download distinct JSON session records and run:

```sh
node --experimental-strip-types scripts/evaluation/organizer-study.ts path/to/session-a.json path/to/session-b.json
```

The summary validates v2 records, consent, method order, timestamps and feasible completed repairs. Duplicate session IDs are rejected. It reports unfinished trials and failed submissions, separates builder/automated records from organizer sessions, retains paired raw times and trial-order counts, and reports the median paired time difference only for completed organizer pairs. With no organizer pairs it returns `null`, never a fabricated benefit. Role and records remain self-reported, not an independently verified organizer study. V1 files retain their historical meaning and are not silently upgraded or counted as v2 organizer evidence.
