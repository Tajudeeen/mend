import Link from "@/components/mend/page-link";
import MendMark from "@/components/mend/mark";

export default function Review() {
  return (
    <main className="simple-page">
      <nav>
        <Link href="/" className="landing-brand" aria-label="MEND home">
          <MendMark />
        </Link>
        <Link href="/demo">Try the sample event</Link>
      </nav>
      <section className="page-heading">
        <div>
          <div className="eyebrow">FOLLOW THE REPAIR</div>
          <h1>One cancellation. A plan you can defend.</h1>
          <p>
            MEND helps music-led market organizers replace a lost performer or
            vendor while keeping audience fit, budget, space and existing
            commitments in view.
          </p>
        </div>
      </section>
      <div className="evidence-grid">
        <section className="panel config-panel">
          <h2>Try a complete repair</h2>
          <ol>
            <li>Open the sample event. It needs no organizer account.</li>
            <li>Open Repair studio and withdraw the opening performer.</li>
            <li>
              Compare replacements, costs, cultural indices and unknown terms.
            </li>
            <li>Approve one repair, then open Recovery reports.</li>
            <li>
              Inspect the before/after assignments and download the decision
              record.
            </li>
          </ol>
          <Link className="btn" href="/demo">
            Open sample event
          </Link>
          <p className="fineprint">
            Fictional participants and synthetic preferences. The sample runs in
            your browser and doesn’t book performers or contact vendors.
          </p>
        </section>
        <section className="panel config-panel">
          <h2>Where Qloo changes the decision</h2>
          <p>
            For live events, organizers resolve audience interests and
            participant references through Qloo. Fixed-pool Insights results
            determine cultural ranks. The planner combines those ranks with
            operational constraints to compare repairs.
          </p>
          <p>
            Without Qloo evidence, live cultural ranking is unavailable.
            Synthetic values are never substituted into a live event. A
            successful connection check alone doesn’t prove a repair used Qloo.
          </p>
          <Link className="btn quiet" href="/settings">
            Account & connections
          </Link>
        </section>
        <section className="panel config-panel">
          <h2>Challenge the result</h2>
          <p>
            Lock the opening performer, then simulate that performer cancelling.
            MEND must explain the conflict rather than silently break the lock.
            Unknown live booking terms must block approval until confirmed.
          </p>
          <p>
            Reports preserve the approval-time evidence, assumptions and
            assignments. Receipt hashes check consistency with the stored
            response. They don’t authenticate Qloo as the issuer or prove future
            audience behavior.
          </p>
          <p>
            <Link href="/verify">
              Inspect a downloaded report in your browser
            </Link>
          </p>
          <Link href="https://github.com/Tajudeeen/mend/blob/main/docs/VERIFICATION.md">
            Verification and limitations
          </Link>
        </section>
        <section className="panel config-panel">
          <h2>Evidence before impact claims</h2>
          <p>
            Qloo ranks describe relative cultural fit within a query, not
            attendance, revenue or booking availability. Vendor reference
            profiles are disclosed proxies. Layout checks use organizer-supplied
            inputs and don’t certify safety.
          </p>
          <p>
            Live Qloo/model runs, market coverage and real organizer benefit
            still require verification. The timed trial records raw attempts and
            elapsed time without inventing a benefit percentage.
          </p>
          <Link href="/study">Try the organizer trial</Link>
          <p>
            <Link href="https://github.com/Tajudeeen/mend">
              Source, setup and MIT license
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
