import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useCustomer } from '../../context/CustomerContext';

const STATUS_COLORS = {
  draft: { bg: '#EDF2F7', color: '#4A5568' },
  generated: { bg: '#EBF8FF', color: '#2B6CB0' },
  review: { bg: '#FEFCBF', color: '#975A16' },
  approved: { bg: '#C6F6D5', color: '#276749' },
  sent: { bg: '#E9D8FD', color: '#553C9A' },
  accepted: { bg: '#C6F6D5', color: '#276749' },
  declined: { bg: '#FED7D7', color: '#9B2C2C' },
};

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.draft;
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.2rem 0.6rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: colors.bg,
      color: colors.color,
    }}>
      {status}
    </span>
  );
}

const DIAG_TYPE_TO_SOW_TYPE = { gtm: 'embedded', clay: 'clay', cpq: 'q2c' };

export default function SowIndex() {
  const { customer, customerPath, isDemo } = useCustomer();
  const router = useRouter();
  const [sows, setSows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoCreating, setAutoCreating] = useState(false);

  useEffect(() => {
    async function fetchAndAutoCreate() {
      try {
        const customerId = customer?.id;
        const url = customerId
          ? `/api/sow?customerId=${customerId}`
          : '/api/sow';
        const res = await fetch(url);

        if (!res.ok) {
          setError('Failed to load statements of work.');
          setLoading(false);
          return;
        }

        const json = await res.json();
        const existingSows = json.data || [];

        // Auto-create SOW if: real customer, no SOWs, and diagnostic exists
        if (existingSows.length === 0 && customerId && !isDemo) {
          setAutoCreating(true);
          const diagType = customer.diagnosticType || 'gtm';

          // Check if diagnostic result exists
          const diagRes = await fetch(`/api/diagnostics/${diagType}?customerId=${customerId}`);
          const diagJson = await diagRes.json();

          if (diagJson.success && diagJson.data) {
            // Auto-create SOW from diagnostic
            const sowRes = await fetch('/api/sow/from-diagnostic', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerId,
                diagnosticResultId: diagJson.data.id,
                diagnosticType: diagType,
                customerName: customer.customerName,
                sowType: DIAG_TYPE_TO_SOW_TYPE[diagType] || 'custom',
                createdBy: 'auto',
              }),
            });
            const sowJson = await sowRes.json();
            if (sowJson.success && sowJson.data?.id) {
              router.replace(customerPath(`/sow/${sowJson.data.id}`));
              return;
            }
          }
          setAutoCreating(false);
        }

        setSows(existingSows);
      } catch (err) {
        console.error('Error fetching SOWs:', err);
        setError('An error occurred while loading statements of work.');
      } finally {
        setLoading(false);
      }
    }

    fetchAndAutoCreate();
  }, [customer?.id]);

  const diagnosticHref = {
    gtm: '/try-leanscale/diagnostic',
    clay: '/try-leanscale/clay-diagnostic',
    cpq: '/try-leanscale/cpq-diagnostic',
  }[customer?.diagnosticType || 'gtm'] || '/try-leanscale/diagnostic';

  return (
    <Layout title="Statements of Work">
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
        padding: '3rem 0 2rem',
        textAlign: 'center',
      }}>
        <div className="container">
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Statements of Work
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: 500, margin: '0 auto' }}>
            View, manage, and generate statements of work for your engagements.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#1a1a2e',
            margin: 0,
          }}>
            All SOWs
          </h2>
          <Link href={customerPath(diagnosticHref)} style={{
            display: 'inline-block',
            padding: '0.6rem 1.25rem',
            background: '#6C5CE7',
            color: 'white',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            New SOW from Diagnostic
          </Link>
        </div>

        {/* Loading / Auto-creating State */}
        {(loading || autoCreating) && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#718096' }}>
            <p>{autoCreating ? 'Generating SOW from your diagnostic...' : 'Loading statements of work...'}</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: '#FFF5F5',
            border: '1px solid #FED7D7',
            borderRadius: '0.75rem',
            color: '#9B2C2C',
          }}>
            <p>Error: {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !autoCreating && !error && sows.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: '#F7FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '0.75rem',
          }}>
            <p style={{ fontSize: '1rem', color: '#4A5568', marginBottom: '1rem' }}>
              No statements of work yet. Complete a diagnostic to auto-generate your SOW.
            </p>
            <Link href={customerPath(diagnosticHref)} style={{
              display: 'inline-block',
              padding: '0.6rem 1.25rem',
              background: '#6C5CE7',
              color: 'white',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              Go to Diagnostic
            </Link>
          </div>
        )}

        {/* SOW List */}
        {!loading && !error && sows.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sows.map((sow) => (
              <div key={sow.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.25rem',
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '0.75rem',
                transition: 'border-color 0.2s',
              }}>
                {/* Title */}
                <div style={{ flex: 1 }}>
                  <Link href={customerPath(`/sow/${sow.id}`)} style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: '#6C5CE7',
                    textDecoration: 'none',
                  }}>
                    {sow.title}
                  </Link>
                </div>

                {/* Type */}
                <div style={{
                  fontSize: '0.8rem',
                  color: '#718096',
                  minWidth: '70px',
                  textAlign: 'center',
                }}>
                  {sow.sow_type}
                </div>

                {/* Status */}
                <div style={{ minWidth: '90px', textAlign: 'center' }}>
                  <StatusBadge status={sow.status} />
                </div>

                {/* Created */}
                <div style={{
                  fontSize: '0.8rem',
                  color: '#A0AEC0',
                  minWidth: '100px',
                  textAlign: 'right',
                }}>
                  {sow.created_at
                    ? new Date(sow.created_at).toLocaleDateString()
                    : '-'}
                </div>

                {/* View Link */}
                <Link href={customerPath(`/sow/${sow.id}`)} style={{
                  fontSize: '0.8rem',
                  color: '#6C5CE7',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}>
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
