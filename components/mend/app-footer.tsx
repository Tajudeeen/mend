import Link from "./page-link";
import MendMark from "./mark";
import { ArrowUpRight } from "lucide-react";
export default function AppFooter() {
  return (
    <footer className="mend-footer" aria-label="MEND footer">
      <div className="mend-footer-main">
        <div className="mend-footer-brand">
          <Link href="/" aria-label="MEND home" className="footer-mark">
            <MendMark />
          </Link>
          <p>
            Keep the feeling.
            <br />
            <span>Repair the plan.</span>
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <div>
            <span>THE WORK</span>
            <Link href="/events">
              Workspace <ArrowUpRight size={13} />
            </Link>
            <Link href="/demo">
              Sample event <ArrowUpRight size={13} />
            </Link>
            <Link href="/study">
              Timed organizer test <ArrowUpRight size={13} />
            </Link>
          </div>
          <div>
            <span>THE DETAILS</span>
            <Link href="/verify">
              Inspect a report <ArrowUpRight size={13} />
            </Link>
            <Link href="/review">
              Review the workflow <ArrowUpRight size={13} />
            </Link>
            <Link href="/settings">
              Account & connections <ArrowUpRight size={13} />
            </Link>
            <a
              href="https://github.com/Tajudeeen/mend"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source on GitHub <ArrowUpRight size={13} />
              <span className="sr-only">, opens in a new tab</span>
            </a>
          </div>
        </nav>
      </div>
      <div className="mend-footer-bottom">
        <small>© {new Date().getUTCFullYear()} MEND</small>
        <p>Your approval before a repair is applied.</p>
        <Link href="/">Back to the beginning ↑</Link>
      </div>
    </footer>
  );
}
