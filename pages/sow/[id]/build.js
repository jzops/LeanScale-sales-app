/**
 * SOW Builder Page
 *
 * /sow/[id]/build — Diagnostic item selection + section creation
 *
 * Loads the SOW and its linked diagnostic result, then renders
 * the SowBuilder component for the two-panel editing experience.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../../components/Layout';
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
          // We need to find the diagnostic type from the diagnostic result
          // Try all types and use whichever returns data
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
    // Refresh SOW data after save
    router.replace(router.asPath);
  }

  return (
    <Layout title={sow ? `Build: ${sow.title}` : 'SOW Builder'}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
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
            background: '#FFF5F5',
            border: '1px solid #FED7D7',
            borderRadius: '0.75rem',
            color: '#9B2C2C',
          }}>
            <p>Error: {error}</p>
          </div>
        )}

        {/* No diagnostic data */}
        {sow && !loading && !error && !diagnosticResult && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            background: '#FFFFF0',
            border: '1px solid #FEFCBF',
            borderRadius: '0.75rem',
          }}>
            <h2 style={{ fontSize: '1.25rem', color: '#975A16', marginBottom: '0.75rem' }}>
              No Diagnostic Data Linked
            </h2>
            <p style={{ color: '#744210', fontSize: '0.875rem', marginBottom: '1rem' }}>
              This SOW doesn&apos;t have linked diagnostic results. You can still create sections manually,
              or go back and create this SOW from a diagnostic page.
            </p>
            <SowBuilder
              sow={sow}
              sections={sections}
              diagnosticResult={{ processes: [] }}
              onSave={handleSave}
            />
          </div>
        )}

        {/* Builder */}
        {sow && !loading && !error && diagnosticResult && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.25rem' }}>
                {sow.title}
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#718096' }}>
                Select diagnostic items and organize them into SOW sections.
                {diagnosticResult.processes?.length > 0 && (
                  <span> {diagnosticResult.processes.length} diagnostic items available.</span>
                )}
              </p>
            </div>

            <SowBuilder
              sow={sow}
              sections={sections}
              diagnosticResult={diagnosticResult}
              onSave={handleSave}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
