import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * Customer Context
 *
 * Provides customer configuration data throughout the app.
 * Loads from API on mount, with fallback to static defaults.
 */

const CustomerContext = createContext(null);

// Default customer config (used as fallback)
// Field names match what /api/customer returns
const defaultCustomer = {
  slug: 'demo',
  customerName: 'Demo',
  customerLogo: null,
  ndaLink: 'https://powerforms.docusign.net/0758efed-0a42-4275-b5d9-f26875d64ae6?env=na4&acct=9287b4d2-50a6-4309-b7e8-7f0b785470c0&accountId=9287b4d2-50a6-4309-b7e8-7f0b785470c0',
  intakeFormLink: 'https://forms.fillout.com/t/nqEbrHoL5Eus',
  youtubeVideoId: 'M7oECb8xsy0',
  googleSlidesEmbedUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vSGSLvHvPn9Cus6N3BpGnK6AkZsUiEdh8cARVVBiZ4w54uUCjHHJ-lHfymW8wfPPraAXMfgXtePxIwf/pubembed?start=true&loop=true&delayms=3000',
  assignedTeam: ['izzy', 'brian', 'dave', 'kavean'],
  isDemo: true,
  customerType: 'prospect',
};

// Static availability dates (fallback when API fails)
const defaultAvailability = [
  { date: '2026-02-02', status: 'waitlist', spotsLeft: 0 },
  { date: '2026-02-16', status: 'waitlist', spotsLeft: 0 },
  { date: '2026-03-02', status: 'available', spotsLeft: 2 },
  { date: '2026-03-16', status: 'available', spotsLeft: 3 },
];

export function CustomerProvider({ children, initialCustomer = null }) {
  const [customer, setCustomer] = useState(initialCustomer || defaultCustomer);
  const [availability, setAvailability] = useState(defaultAvailability);
  const [loading, setLoading] = useState(!initialCustomer);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Skip if we already have initial customer data from SSR
    if (initialCustomer) {
      setLoading(false);
      return;
    }

    async function loadCustomer() {
      try {
        // Determine customer slug from the cookie set by middleware
        // Read from document.cookie as this reflects what middleware set
        let slugFromCookie = null;
        if (typeof document !== 'undefined') {
          const cookieMatch = document.cookie.match(/customer-slug=([^;]+)/);
          if (cookieMatch) {
            slugFromCookie = cookieMatch[1];
          }
        }

        // Fetch customer config from API with explicit slug
        // This ensures we get the right customer even if cookie timing is off
        const apiUrl = slugFromCookie
          ? `/api/customer?slug=${slugFromCookie}`
          : '/api/customer';
        const customerRes = await fetch(apiUrl);
        if (customerRes.ok) {
          const customerData = await customerRes.json();
          // Only update if we got valid data
          if (customerData && customerData.slug) {
            setCustomer(customerData);
          }
        }

        // Fetch availability dates
        const availRes = await fetch('/api/availability');
        if (availRes.ok) {
          const availData = await availRes.json();
          if (availData.dates && availData.dates.length > 0) {
            setAvailability(availData.dates);
          }
        }
      } catch (err) {
        console.error('Error loading customer:', err);
        setError(err.message);
        // Keep using default customer on error - already set in initial state
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, [initialCustomer]);

  const isDemo = customer.slug === 'demo' || customer.customerName === 'Demo' || customer.isDemo;

  /**
   * Prefix a path with /c/slug/ when viewing a real customer.
   * Demo customers and admin routes stay unprefixed.
   * @param {string} path - e.g. '/try-leanscale/diagnostic'
   * @returns {string} - e.g. '/c/cassidy/try-leanscale/diagnostic'
   */
  const customerPath = useCallback((path) => {
    if (isDemo || !customer.slug) return path;
    // Don't double-prefix
    if (path.startsWith('/c/')) return path;
    // Don't prefix admin routes
    if (path.startsWith('/admin')) return path;
    // Don't prefix API routes
    if (path.startsWith('/api')) return path;
    return `/c/${customer.slug}${path}`;
  }, [isDemo, customer.slug]);

  const value = {
    customer,
    availability,
    loading,
    error,
    isDemo,
    // Helper to get customer name for display (returns null for demo)
    displayName: customer.customerName && customer.customerName !== 'Demo' ? customer.customerName : null,
    // Customer type: 'prospect' (default), 'active', or 'churned'
    customerType: customer.customerType || 'prospect',
    // Prefix paths with /c/slug/ for real customers
    customerPath,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}

// Export default customer for static imports during migration
export { defaultCustomer };
