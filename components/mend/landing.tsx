import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Waypoints,
  ShieldCheck,
  Music2,
  MapPin,
} from "lucide-react";
export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Link className="landing-brand" href="/">
          mend<span>.</span>
        </Link>
        <div>
          <Link href="/demo">Try the sample</Link>
          <Link href="/events" className="btn">
            Open workspace <ArrowUpRight size={15} />
          </Link>
        </div>
      </nav>
      <main className="landing-main">
        <div className="landing-intro">
          <div className="eyebrow">
            CULTURAL INTELLIGENCE / PRACTICAL RECOVERY
          </div>
          <h1>
            A change of plan.
            <br />
            <em>The same good feeling.</em>
          </h1>
          <p>
            A performer drops out. A stall closes. The event still needs to feel
            like yours. MEND helps you compare thoughtful repairs, check the
            practical limits and choose what happens next.
          </p>
          <div className="landing-cta">
            <Link href="/demo" className="btn">
              Explore Midnight Culture Market <ArrowRight size={17} />
            </Link>
            <span>No account needed. Clearly labeled sample data.</span>
          </div>
        </div>
        <section className="landing-preview">
          <div className="preview-label">
            <span className="pill">A REPAIR IN PROGRESS</span>
            <span>SAMPLE SCENARIO</span>
          </div>
          <div className="preview-flow">
            <div className="preview-original">
              <span>THE ORIGINAL PLAN</span>
              <h2>
                Midnight
                <br />
                Culture Market
              </h2>
              <p>Music, independent food and shared interests.</p>
              <div className="preview-line">
                <Music2 size={19} />
                <span>
                  The Sunday Assembly<small>Opening set · 18:00</small>
                </span>
              </div>
              <div className="preview-line">
                <MapPin size={19} />
                <span>
                  Palm stage<small>350 guests · Open air</small>
                </span>
              </div>
            </div>
            <div className="preview-bridge">
              <Waypoints size={34} />
              <span>
                ONE CANCELLATION.
                <br />A THOUGHTFUL REPAIR.
              </span>
            </div>
            <div className="preview-repair">
              <span>BEFORE ANYTHING CHANGES</span>
              <h3>Keep the thread.</h3>
              <div>
                <ShieldCheck size={16} />
                <span>Practical constraints checked</span>
              </div>
              <div>
                <ShieldCheck size={16} />
                <span>Locked commitments preserved</span>
              </div>
              <div>
                <ShieldCheck size={16} />
                <span>Your approval required</span>
              </div>
              <Link href="/demo?view=repair">
                See the alternatives <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="preview-disclosure">
            Fictional participants. Synthetic cultural signals. No booking or
            outcome claim.
          </div>
        </section>
        <section className="landing-principles">
          {[
            {
              n: "01",
              title: "Start with the people.",
              text: "Build a program around stated interests, with cultural evidence kept separate from booking facts.",
            },
            {
              n: "02",
              title: "Respect the real limits.",
              text: "A cultural match still needs to fit the budget, the schedule and the available space.",
            },
            {
              n: "03",
              title: "Leave a clear thread.",
              text: "Compare the changes, approve a revision and keep its evidence and recovery report.",
            },
          ].map((p) => (
            <article key={p.n}>
              <span>{p.n}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </section>
        <section className="landing-note">
          <p>
            Qloo supplies cultural relationships when configured. MEND’s
            deterministic planner checks the supplied operational rules. The
            language agent uses bounded tools and cannot approve changes.
          </p>
          <Link href="/settings">
            See connection status <ArrowUpRight size={14} />
          </Link>
        </section>
      </main>
      <footer>
        <span className="landing-brand">mend.</span>
        <span>Keep the feeling. Repair the plan.</span>
      </footer>
    </div>
  );
}
