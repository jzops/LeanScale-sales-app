import { useState } from 'react';
import Link from 'next/link';
import { useCustomer } from '../context/CustomerContext';

// Prospect/default navigation sections (Why / Try / Buy)
const prospectSections = [
  {
    name: 'why',
    label: 'Why LeanScale?',
    links: [
      { href: '/why-leanscale', label: 'Overview' },
      { href: '/why-leanscale/about', label: 'About Us' },
      { href: '/why-leanscale/resources', label: 'Key Resources' },
      { href: '/why-leanscale/references', label: 'Customer References' },
      { href: '/why-leanscale/services', label: 'Services Catalog' },
      { href: '/why-leanscale/glossary', label: 'GTM Ops Glossary' },
    ],
  },
  {
    name: 'try',
    label: 'Try LeanScale',
    links: [
      { href: '/try-leanscale', label: 'Overview' },
      { href: '/try-leanscale/start', label: 'Start Diagnostic' },
      { href: '/try-leanscale/diagnostic', label: 'GTM Diagnostic' },
      { href: '/try-leanscale/power10', label: 'Power10 GTM Metrics' },
      { href: '/try-leanscale/gtm-tool-health', label: 'GTM Tool Health' },
      { href: '/try-leanscale/process-health', label: 'Process Health' },
      { href: '/try-leanscale/clay-diagnostic', label: 'Clay Diagnostic' },
      { href: '/try-leanscale/cpq-diagnostic', label: 'Q2C Diagnostic' },
      { href: '/try-leanscale/engagement', label: 'Engagement Overview' },
    ],
  },
  {
    name: 'buy',
    label: 'Buy LeanScale',
    links: [
      { href: '/buy-leanscale/availability', label: 'Cohort Availability' },
      { href: '/buy-leanscale/one-time-projects', label: 'One-Time Projects' },
      { href: '/buy-leanscale/investor-perks', label: 'Investor Perks' },
      { href: '/buy-leanscale/security', label: 'Security' },
      { href: '/buy-leanscale/team', label: 'Your Team' },
      { href: '/buy-leanscale/clay', label: 'Clay x LeanScale' },
      { href: '/buy-leanscale/q2c-intake', label: 'Q2C Assessment' },
    ],
  },
];

// Active customer navigation sections (Diagnostics / Projects / Documents)
const customerSections = [
  {
    name: 'diagnostics',
    label: 'Diagnostics',
    links: [
      { href: '/try-leanscale/diagnostic', label: 'GTM Diagnostic' },
      { href: '/try-leanscale/clay-diagnostic', label: 'Clay Diagnostic' },
      { href: '/try-leanscale/cpq-diagnostic', label: 'Q2C Diagnostic' },
    ],
  },
  {
    name: 'projects',
    label: 'Projects',
    links: [
      { href: '/buy-leanscale/clay-intake', label: 'Clay Project Intake' },
      { href: '/buy-leanscale/q2c-intake', label: 'Q2C Assessment' },
    ],
  },
  {
    name: 'documents',
    label: 'Documents',
    links: [
      { href: '/sow', label: 'Statements of Work' },
    ],
  },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const { customer, isDemo, displayName, customerType } = useCustomer();

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const showCustomerBranding = !isDemo && displayName;
  const isActive = customerType === 'active';
  const sections = isActive ? customerSections : prospectSections;

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo" onClick={closeMenu}>
        {showCustomerBranding && customer.customerLogo ? (
          <>
            <img src="/leanscale-logo.png" alt="LeanScale" />
            <span className="nav-logo-divider">&times;</span>
            <img
              src={customer.customerLogo}
              alt={displayName}
              className="nav-customer-logo"
            />
          </>
        ) : showCustomerBranding ? (
          <>
            <span className="nav-brand-text nav-brand-leanscale">LeanScale</span>
            <span className="nav-logo-divider-small">&times;</span>
            <span className="nav-brand-text nav-brand-customer">{displayName}</span>
          </>
        ) : (
          <img src="/leanscale-logo.png" alt="LeanScale" />
        )}
      </Link>

      <button
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? '\u2715' : '\u2630'}
      </button>

      <div className={`nav-links ${mobileMenuOpen ? 'nav-links-open' : ''}`}>
        {sections.map((section) => (
          <div className="nav-item" key={section.name}>
            <button
              className="nav-button"
              onClick={() => toggleDropdown(section.name)}
            >
              {section.label} <span>&#9662;</span>
            </button>
            <div className={`nav-dropdown ${openDropdown === section.name ? 'nav-dropdown-open' : ''}`}>
              {section.links.map((link) => (
                <Link href={link.href} onClick={closeMenu} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {isActive ? (
          <Link href="/dashboard" className="nav-cta" onClick={closeMenu}>
            Dashboard
          </Link>
        ) : (
          <Link href="/buy-leanscale" className="nav-cta" onClick={closeMenu}>
            Get Started
          </Link>
        )}
      </div>
    </nav>
  );
}
