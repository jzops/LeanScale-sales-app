import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import SowPage from '../../../components/sow/SowPage';
import { useCustomer } from '../../../context/CustomerContext';

export default function SowDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { customer, customerPath } = useCustomer();

  const [sow, setSow] = useState(null);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        // Fetch SOW (includes sections)
        const sowRes = await fetch(`/api/sow/${id}`);
        if (!sowRes.ok) {
          setError('Failed to load SOW.');
          setLoading(false);
          return;
        }
        const sowJson = await sowRes.json();
        const sowData = sowJson.data;
        setSow(sowData);

        // Fetch versions
        fetch(`/api/sow/${id}/versions`)
          .then(r => r.ok ? r.json() : null)
          .then(json => { if (json?.data) setVersions(json.data); })
          .catch(() => {});

        // Fetch linked diagnostic result (if SOW has diagnostic_result_ids)
        const diagIds = sowData?.diagnostic_result_ids;
        if (diagIds && diagIds.length > 0) {
          // Try to fetch from diagnostics API by checking each type
          const types = ['gtm', 'clay', 'cpq'];
          for (const type of types) {
            try {
              const diagRes = await fetch(
                `/api/diagnostics/${type}?customerId=${sowData.customer_id}`
              );
              if (diagRes.ok) {
                const diagJson = await diagRes.json();
                if (diagJson.data && diagIds.includes(diagJson.data.id)) {
                  setDiagnosticResult(diagJson.data);
                  break;
                }
              }
            } catch {
              // Continue trying other types
            }
          }
        }
      } catch (err) {
        console.error('Error fetching SOW:', err);
        setError('An error occurred while loading the SOW.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  async function handleStatusUpdate(newStatus) {
    const res = await fetch(`/api/sow/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const json = await res.json();
      setSow(json.data);
    }
  }

  async function handleExport() {
    try {
      const res = await fetch(`/api/sow/${id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exportedBy: customer?.customerName || 'Unknown',
          customerName: customer?.customerName || '',
        }),
      });
      if (res.ok) {
        // Download the PDF
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'SOW.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Update version number from response header
        const versionNumber = res.headers.get('X-Version-Number');
        if (versionNumber) {
          setSow(prev => prev ? { ...prev, current_version: parseInt(versionNumber) } : prev);
        }

        // Refresh versions list
        const versionsRes = await fetch(`/api/sow/${id}/versions`);
        if (versionsRes.ok) {
          const versionsJson = await versionsRes.json();
          setVersions(versionsJson.data || []);
        }
      }
    } catch (err) {
      console.error('Error exporting PDF:', err);
    }
  }

  // Determine if this is a customer-facing (read-only) view
  const isReadOnly = customer?.isDemo === false;

  return (
    <Layout title={sow ? sow.title : 'SOW Detail'}>
      <div className="container" style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href={customerPath('/sow')} style={{
            fontSize: '0.875rem',
            color: '#6C5CE7',
            textDecoration: 'none',
          }}>
            ← Back to Statements of Work
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#718096' }}>
            <p>Loading SOW...</p>
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

        {/* SOW Content */}
        {sow && !loading && !error && (
          <SowPage
            sow={sow}
            diagnosticResult={diagnosticResult}
            versions={versions}
            readOnly={isReadOnly}
            onStatusUpdate={handleStatusUpdate}
            onExport={handleExport}
            customerSlug={customer?.slug}
            customerName={customer?.customerName}
          />
        )}
      </div>
    </Layout>
  );
}
