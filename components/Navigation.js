import Link from 'next/link';
import customerConfig from '../data/customer-config';

export default function Navigation() {
  return (
    <nav className="nav">
      <div className="nav-logo">
        {customerConfig.customerLogo && (
          <>
            <span>←</span>
            <img src={customerConfig.customerLogo} alt={customerConfig.customerName} />
          </>
        )}
        <Link href="/">
          {customerConfig.customerName} | LeanScale
        </Link>
      </div>

      <div className="nav-links">
        {/* Why LeanScale? */}
        <div className="nav-item">
          <button className="nav-button">
            Why LeanScale? <span>▾</span>
          </button>
          <div className="nav-dropdown">
            <Link href="/why-leanscale">Overview</Link>
            <Link href="/why-leanscale/about">About Us</Link>
            <Link href="/why-leanscale/resources">Key Resources</Link>
            <Link href="/why-leanscale/references">Customer References</Link>
            <Link href="/why-leanscale/services">Services Catalog</Link>
            <Link href="/why-leanscale/glossary">GTM Ops Glossary</Link>
          </div>
        </div>

        {/* Try LeanScale */}
        <div className="nav-item">
          <button className="nav-button">
            Try LeanScale <span>▾</span>
          </button>
          <div className="nav-dropdown">
            <Link href="/try-leanscale">Overview</Link>
            <Link href="/try-leanscale/start">Start Diagnostic</Link>
            <Link href="/try-leanscale/diagnostic">GTM Diagnostic</Link>
            <Link href="/try-leanscale/engagement">Engagement Overview</Link>
          </div>
        </div>

        {/* Buy LeanScale */}
        <div className="nav-item">
          <button className="nav-button">
            Buy LeanScale <span>▾</span>
          </button>
          <div className="nav-dropdown">
            <Link href="/buy-leanscale">Get Started</Link>
            <Link href="/buy-leanscale/one-time-projects">One-Time Projects</Link>
            <Link href="/buy-leanscale/investor-perks">Investor Perks</Link>
            <Link href="/buy-leanscale/security">Security</Link>
            <Link href="/buy-leanscale/team">Your Team</Link>
            <Link href="/buy-leanscale/clay">Clay x LeanScale</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
