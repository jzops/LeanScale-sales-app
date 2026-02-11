/**
 * SOW Builder Page
 *
 * /sow/[id]/build — WYSIWYG SOW builder with live preview
 *
 * Loads the SOW and its linked diagnostic result, then renders
 * the SplitBuilder component for side-by-side editing + preview.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import SplitBuilder from '../../../components/sow/SplitBuilder';
import SowBuilder from '../../../components/sow/SowBuilder';
import { useCustomer } from '../../../context/CustomerContext';

export default function SowBuildPage() {
  const router = useRouter();
  const { id } = router.query;
  const { customer, customerPath } = useCustomer();

  const [sow, setSow] = useState(null);
  const [sections, setSections] = useState([]);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
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
        setSections(sowData.sections || []);

        // Fetch linked diagnostic result if we have diagnostic_result_ids
        if (sowData.diagnostic_result_ids && sowData.diagnostic_result_ids.length > 0 && customer?.id) {
          for (const type of ['gtm', 'clay', 'cpq']) {
            const diagRes = await fetch(`/api/diagnostics/${type}?customerId=${customer.id}`);
            if (diagRes.ok) {
              const diagJson = await diagRes.json();
              if (diagJson.data && sowData.diagnostic_result_ids.includes(diagJson.data.id)) {
                setDiagnosticResult(diagJson.data);
                break;
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading SOW builder data:', err);
        setError('An error occurred while loading the SOW builder.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, customer?.id]);

  function handleSave() {
    router.replace(router.asPath);
  }

  const customerName = customer?.name || sow?.content?.client_info?.company || '';

  return (
    <Layout title={sow ? `Build: ${sow.title}` : 'SOW Builder'} fullWidth>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem 1rem', fontSize: '0.875rem', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
          <Link href={customerPath('/sow')} style={{ color: '#6C5CE7', textDecoration: 'none' }}>
            Statements of Work
          </Link>
          <span style={{ color: '#A0AEC0' }}>/</span>
          {sow && (
            <>
              <Link href={customerPath(`/sow/${id}`)} style={{ color: '#6C5CE7', textDecoration: 'none' }}>
                {sow.title}
              </Link>
              <span style={{ color: '#A0AEC0' }}>/</span>
            </>
          )}
          <span style={{ color: '#4A5568' }}>Build</span>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#718096' }}>
            <p>Loading SOW builder...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            margin: '1rem',
            background: '#FFF5F5',
            border: '1px solid #FED7D7',
            borderRadius: '0.75rem',
            color: '#9B2C2C',
          }}>
            <p>Error: {error}</p>
          </div>
        )}

        {/* No diagnostic data - still show SplitBuilder with empty diagnostics */}
        {sow && !loading && !error && !diagnosticResult && (
          <SplitBuilder
            sow={sow}
            sections={sections}
            diagnosticResult={{ processes: [] }}
            onSave={handleSave}
            customerName={customerName}
          />
        )}

        {/* Builder with diagnostic data */}
        {sow && !loading && !error && diagnosticResult && (
          <SplitBuilder
            sow={sow}
            sections={sections}
            diagnosticResult={diagnosticResult}
            onSave={handleSave}
            customerName={customerName}
          />
        )}
      </div>
    </Layout>
  );
}
