import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import SowPage from '../../components/sow/SowPage';
import { useCustomer } from '../../context/CustomerContext';

const DIAG_TYPE_TO_SOW_TYPE = { gtm: 'embedded', clay: 'clay', cpq: 'q2c' };

export default function SowIndex() {
  const { customer, customerPath, isDemo } = useCustomer();

  const [sow, setSow] = useState(null);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noDiagnostic, setNoDiagnostic] = useState(false);

  useEffect(() => {
    async function loadOrCreateSow() {
      const customerId = customer?.id;
      if (!customerId || isDemo) {
        setLoading(false);
        setNoDiagnostic(true);
        return;
      }

      try {
        const diagType = customer.diagnosticType || 'gtm';

        // Fetch existing SOWs and diagnostic in parallel
        const [sowRes, diagRes] = await Promise.all([
          fetch(`/api/sow?customerId=${customerId}`),
          fetch(`/api/diagnostics/${diagType}?customerId=${customerId}`),
        ]);

        const sowJson = await sowRes.json();
        const diagJson = await diagRes.json();

        // No diagnostic → can't show SOW
        if (!diagJson.success || !diagJson.data) {
          setNoDiagnostic(true);
          setLoading(false);
          return;
        }

        setDiagnosticResult(diagJson.data);

        const existingSows = sowJson.data || [];
        let sowData;

        if (existingSows.length > 0) {
          // Load the most recent SOW with sections
          const detailRes = await fetch(`/api/sow/${existingSows[0].id}`);
          const detailJson = await detailRes.json();
          sowData = detailJson.data;
        } else {
          // Auto-create SOW from diagnostic
          const createRes = await fetch('/api/sow/from-diagnostic', {
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
          const createJson = await createRes.json();
          if (createJson.success && createJson.data) {
            sowData = createJson.data;
          } else {
            setError('Failed to generate statement of work.');
            setLoading(false);
            return;
          }
        }

        setSow(sowData);
      } catch (err) {
        console.error('Error loading SOW:', err);
        setError('An error occurred while loading the statement of work.');
      } finally {
        setLoading(false);
      }
    }

    loadOrCreateSow();
  }, [customer?.id]);

  const diagnosticHref = {
    gtm: '/try-leanscale/diagnostic',
    clay: '/try-leanscale/clay-diagnostic',
    cpq: '/try-leanscale/cpq-diagnostic',
  }[customer?.diagnosticType || 'gtm'] || '/try-leanscale/diagnostic';

  async function handleExport() {
    if (!sow?.id) return;
    try {
      const res = await fetch(`/api/sow/${sow.id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exportedBy: customer?.customerName || 'Unknown',
          customerName: customer?.customerName || '',
        }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'SOW.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting PDF:', err);
    }
  }

  return (
    <Layout title="Statement of Work">
      <div className="container" style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#718096' }}>
            <p>Loading statement of work...</p>
          </div>
        )}

        {/* Error */}
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

        {/* No diagnostic available */}
        {noDiagnostic && !loading && !error && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: '#F7FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '0.75rem',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a1a2e', marginBottom: '0.75rem' }}>
              No Statement of Work Yet
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#4A5568', marginBottom: '1.25rem', maxWidth: 500, margin: '0 auto 1.25rem' }}>
              Complete your diagnostic assessment first. Your statement of work will be automatically generated from the results.
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

        {/* SOW Content */}
        {sow && !loading && !error && (
          <SowPage
            sow={sow}
            diagnosticResult={diagnosticResult}
            onExport={handleExport}
            customerSlug={customer?.slug}
          />
        )}
      </div>
    </Layout>
  );
}
