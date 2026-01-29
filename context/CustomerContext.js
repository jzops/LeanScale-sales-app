import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Customer Context
 *
 * Provides customer configuration data throughout the app.
 * Loads from API on mount, with fallback to static defaults.
 */

const CustomerContext = createContext(null);

// Default customer config (used as fallback)
const defaultCustomer = {
  slug: 'demo',
  name: 'Demo',
  logoUrl: null,
  password: null,
  ndaLink: null,
  intakeFormLink: null,
  youtubeVideoId: 'M7oECb8xsy0',
  googleSlidesEmbedUrl: null,
  assignedTeam: [],
  startDates: [],
};

export function CustomerProvider({ children, initialCustomer = null }) {
  const [customer, setCustomer] = useState(initialCustomer || defaultCustomer);
  const [availability, setAvailability] = useState([]);
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
        // Fetch customer config from API
        const customerRes = await fetch('/api/customer');
        if (!customerRes.ok) {
          throw new Error('Failed to fetch customer');
        }
        const customerData = await customerRes.json();
        setCustomer(customerData);

        // Fetch availability dates
        const availRes = await fetch('/api/availability');
        if (availRes.ok) {
          const availData = await availRes.json();
          setAvailability(availData.dates || []);
        }
      } catch (err) {
        console.error('Error loading customer:', err);
        setError(err.message);
        // Keep using default customer on error
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, [initialCustomer]);

  const value = {
    customer,
    availability,
    loading,
    error,
    // Helper to check if we have real customer data vs demo
    isDemo: customer.slug === 'demo' || customer.name === 'Demo',
    // Helper to get customer name for display
    displayName: customer.name && customer.name !== 'Demo' ? customer.name : null,
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
