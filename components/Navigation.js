import { useState } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo" onClick={closeMenu}>
        <img src="/leanscale-logo.svg" alt="LeanScale" style={{ height: 32 }} />
      </Link>

      <button 
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      <div className={`nav-links ${mobileMenuOpen ? 'nav-links-open' : ''}`}>
        <div className="nav-item">
          <button 
            className="nav-button"
            onClick={() => toggleDropdown('why')}
          >
            Why LeanScale? <span>▾</span>
          </button>
          <div className={`nav-dropdown ${openDropdown === 'why' ? 'nav-dropdown-open' : ''}`}>
            <Link href="/why-leanscale" onClick={closeMenu}>Overview</Link>
            <Link href="/why-leanscale/about" onClick={closeMenu}>About Us</Link>
            <Link href="/why-leanscale/resources" onClick={closeMenu}>Key Resources</Link>
            <Link href="/why-leanscale/references" onClick={closeMenu}>Customer References</Link>
            <Link href="/why-leanscale/services" onClick={closeMenu}>Services Catalog</Link>
            <Link href="/why-leanscale/glossary" onClick={closeMenu}>GTM Ops Glossary</Link>
          </div>
        </div>

        <div className="nav-item">
          <button 
            className="nav-button"
            onClick={() => toggleDropdown('try')}
          >
            Try LeanScale <span>▾</span>
          </button>
          <div className={`nav-dropdown ${openDropdown === 'try' ? 'nav-dropdown-open' : ''}`}>
            <Link href="/try-leanscale" onClick={closeMenu}>Overview</Link>
            <Link href="/try-leanscale/start" onClick={closeMenu}>Start Diagnostic</Link>
            <Link href="/try-leanscale/diagnostic" onClick={closeMenu}>GTM Diagnostic</Link>
            <Link href="/try-leanscale/power10" onClick={closeMenu}>Power10 GTM Metrics</Link>
            <Link href="/try-leanscale/gtm-tool-health" onClick={closeMenu}>GTM Tool Health</Link>
            <Link href="/try-leanscale/process-health" onClick={closeMenu}>Process Health</Link>
            <Link href="/try-leanscale/engagement" onClick={closeMenu}>Engagement Overview</Link>
          </div>
        </div>

        <div className="nav-item">
          <button 
            className="nav-button"
            onClick={() => toggleDropdown('buy')}
          >
            Buy LeanScale <span>▾</span>
          </button>
          <div className={`nav-dropdown ${openDropdown === 'buy' ? 'nav-dropdown-open' : ''}`}>
            <Link href="/buy-leanscale/availability" onClick={closeMenu}>Cohort Availability</Link>
            <Link href="/buy-leanscale/one-time-projects" onClick={closeMenu}>One-Time Projects</Link>
            <Link href="/buy-leanscale/investor-perks" onClick={closeMenu}>Investor Perks</Link>
            <Link href="/buy-leanscale/security" onClick={closeMenu}>Security</Link>
            <Link href="/buy-leanscale/team" onClick={closeMenu}>Your Team</Link>
            <Link href="/buy-leanscale/clay" onClick={closeMenu}>Clay x LeanScale</Link>
          </div>
        </div>

        <Link href="/buy-leanscale" className="nav-cta" onClick={closeMenu}>
          Get Started
        </Link>
      </div>
    </nav>
  );
}
