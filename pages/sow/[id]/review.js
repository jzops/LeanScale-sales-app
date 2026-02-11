import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SowPage from '../../../components/sow/SowPage';
import { useCustomer } from '../../../context/CustomerContext';

/**
 * Customer-facing SOW review page — read-only view with accept/decline workflow.
 *
 * Route: /sow/[id]/review
 * Uses SowPage with readOnly=true, wrapped in a clean customer-branded layout.
 */
export default function SowReviewPage() {
  const router = useRouter();
  const { id } = router.query;
  const { customer, isDemo, customerPath } = useCustomer();

  const [sow, setSow] = useState(null);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function loadSow() {
      setLoading(true);
      try {
        const res = await fetch(`/api/sow/${id}`);
        if (!res.ok) {
          setError('Unable to load this proposal.');
          return;
        }
        const json = await res.json();
        if (json.success && json.data) {
          setSow(json.data);
          setVersions(json.versions || []);

          // Load linked diagnostic if available
          const linkedDiagId = json.data.diagnostic_result_ids?.[0] || json.data.diagnostic_result_id;
          if (linkedDiagId) {
            try {
              const diagRes = await fetch(`/api/diagnostics/by-id?id=${linkedDiagId}`);
              if (diagRes.ok) {
                const diagJson = await diagRes.json();
                if (diagJson.success) setDiagnosticResult(diagJson.data);
              }
            } catch (_) { /* optional */ }
          }
        } else {
          setError('Proposal not found.');
        }
      } catch (err) {
        setError('Unable to load this proposal.');
        console.error('Error loading SOW:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSow();
  }, [id]);

  async function handleExport() {
    if (!sow) return;
    try {
      const res = await fetch(`/api/sow/${sow.id}/export`, { method: 'POST' });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sow.title || 'SOW'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting PDF:', err);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)' }}>Loading proposal...</p>
      </div>
    );
  }

  if (error || !sow) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--status-warning-text)', fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)' }}>{error || 'Proposal not found.'}</p>
          <a href="/" style={{ color: 'var(--ls-purple-light)', textDecoration: 'underline' }}>Return home</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', background: 'var(--bg-subtle)' }}>
      {/* Customer branded header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        padding: 'var(--space-10) var(--space-6) var(--space-6)',
        color: 'white',
        textAlign: 'center',
      }}>
        {customer?.customerLogo ? (
          <img
            src={customer.customerLogo}
            alt={customer.customerName}
            style={{ height: '40px', marginBottom: 'var(--space-4)', objectFit: 'contain' }}
          />
        ) : (
          <p style={{ fontSize: 'var(--text-sm)', color: '#c4b5fd', marginBottom: 'var(--space-2)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {customer?.customerName || 'Proposal Review'}
          </p>
        )}
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', marginBottom: '0.25rem' }}>
          {sow.title}
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: '#c4b5fd' }}>
          Statement of Work &bull; {sow.sow_type} &bull; {new Date(sow.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* SOW Content — read-only */}
      <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem 3rem' }}>
        <SowPage
          sow={sow}
          diagnosticResult={diagnosticResult}
          versions={versions}
          readOnly={true}
          onExport={handleExport}
          customerSlug={customer?.slug}
          customerName={customer?.customerName}
        />
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-8) var(--space-4)',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-muted)',
        fontSize: 'var(--text-sm)',
      }}>
        Powered by LeanScale &bull; {new Date().getFullYear()}
      </div>
    </div>
  );
}
