import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCustomer } from '../context/CustomerContext';

// Prospect/default navigation sections (Why / Try / Buy)
const prospectSections = [
  {
    name: 'why',
    label: 'Why LeanScale?',
    type: 'dropdown',
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
    type: 'dropdown',
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
    type: 'dropdown',
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

// Diagnostic type → nav link config
const diagnosticConfig = {
  gtm: { href: '/try-leanscale/diagnostic', label: 'Diagnostic' },
  clay: { href: '/try-leanscale/clay-diagnostic', label: 'Diagnostic' },
  cpq: { href: '/try-leanscale/cpq-diagnostic', label: 'Diagnostic' },
};

/**
 * Build customer-specific nav items.
 * Primary flat links: Dashboard → Diagnostic → SOW
 * Secondary items go in a single "More" dropdown.
 */
function buildCustomerNav(diagnosticType) {
  const diagLink = diagnosticConfig[diagnosticType] || diagnosticConfig.gtm;

  return [
    { name: 'dashboard', label: 'Dashboard', type: 'link', href: '/dashboard' },
    { name: 'diagnostic', label: diagLink.label, type: 'link', href: diagLink.href },
    { name: 'sow', label: 'SOW', type: 'link', href: '/sow' },
    {
      name: 'more',
      label: 'More',
      type: 'dropdown',
      links: [
        { href: '/try-leanscale/engagement', label: 'Engagement' },
        { href: '/why-leanscale/services', label: 'Services Catalog' },
        { href: '/buy-leanscale/team', label: 'Your Team' },
        { href: '/why-leanscale/resources', label: 'Key Resources' },
        { href: '/why-leanscale/references', label: 'Customer References' },
        { href: '/buy-leanscale/security', label: 'Security' },
        { href: '/why-leanscale/glossary', label: 'GTM Ops Glossary' },
      ],
    },
  ];
}

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const { customer, isDemo, displayName, customerType, customerPath } = useCustomer();

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const showCustomerBranding = !isDemo && displayName;
  const isActive = customerType === 'active';
  const diagnosticType = customer.diagnosticType || 'gtm';
  const navItems = useMemo(
    () => isActive ? buildCustomerNav(diagnosticType) : prospectSections,
    [isActive, diagnosticType]
  );

  return (
    <nav className="nav">
      <Link href={customerPath('/')} className="nav-logo" onClick={closeMenu}>
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
        {navItems.map((item) =>
          item.type === 'link' ? (
            <Link
              key={item.name}
              href={customerPath(item.href)}
              className="nav-button"
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ) : (
            <div className="nav-item" key={item.name}>
              <button
                className="nav-button"
                onClick={() => toggleDropdown(item.name)}
              >
                {item.label} <span>&#9662;</span>
              </button>
              <div className={`nav-dropdown ${openDropdown === item.name ? 'nav-dropdown-open' : ''}`}>
                {item.links.map((link) => (
                  <Link href={customerPath(link.href)} onClick={closeMenu} key={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )
        )}

        {!isActive && (
          <Link href={customerPath('/buy-leanscale')} className="nav-cta" onClick={closeMenu}>
            Get Started
          </Link>
        )}
      </div>
    </nav>
  );
}
