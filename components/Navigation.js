import { useState } from 'react';
import Link from 'next/link';
import customerConfig from '../data/customer-config';

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

  const showCustomerBranding = customerConfig.customerName && customerConfig.customerName !== "Demo";

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src="/leanscale-logo.png" alt="LeanScale" style={{ height: 28 }} />
        {showCustomerBranding && (
          <>
            <span style={{ color: '#d1d5db', fontSize: '1.25rem', fontWeight: 300 }}>×</span>
            {customerConfig.customerLogo ? (
              <img 
                src={customerConfig.customerLogo} 
                alt={customerConfig.customerName} 
                style={{ height: 28, maxWidth: 120, objectFit: 'contain' }} 
              />
            ) : (
              <span style={{ fontWeight: 600, fontSize: '1rem', color: '#374151' }}>
                {customerConfig.customerName}
              </span>
            )}
          </>
        )}
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
