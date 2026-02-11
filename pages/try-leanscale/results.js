import { useState, useEffect } from 'react';
import Link from 'next/link';
import DiagnosticResults from '../../components/diagnostic/DiagnosticResults';
import { useCustomer } from '../../context/CustomerContext';
import { diagnosticRegistry, countStatuses } from '../../data/diagnostic-registry';

/**
 * Customer-facing diagnostic results page — read-only view.
 *
 * Shows a polished summary header, key findings, and the full diagnostic
 * in read-only mode. No admin navigation or edit controls.
 */
export default function CustomerResultsPage() {
  const { customer, isDemo, customerPath } = useCustomer();
  const diagnosticType = customer?.diagnosticType || 'gtm';
  const config = diagnosticRegistry[diagnosticType];

  const [summaryData, setSummaryData] = useState(null);

  // Load diagnostic data for the summary section
  useEffect(() => {
    if (isDemo || !customer?.id) return;
    async function loadSummary() {
      try {
        const res = await fetch(`/api/diagnostics/${diagnosticType}?customerId=${customer.id}`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data) {
          const processes = json.data.processes || [];
          const stats = countStatuses(processes);
          const scorable = processes.filter(p => p.status !== 'na');
          const healthPct = scorable.length > 0
            ? Math.round((stats.healthy / scorable.length) * 100)
            : 0;
          const priorityItems = processes.filter(p => p.addToEngagement);
          const warningItems = processes.filter(p => p.status === 'warning' || p.status === 'unable');

          setSummaryData({
            stats,
            healthPct,
            total: processes.length,
            priorityCount: priorityItems.length,
            warningCount: warningItems.length,
            topFindings: warningItems.slice(0, 5).map(p => p.name),
          });
        }
      } catch (err) {
        console.error('Error loading summary:', err);
      }
    }
    loadSummary();
  }, [customer?.id, diagnosticType, isDemo]);

  const overallHealth = summaryData
    ? summaryData.healthPct >= 70 ? 'Strong' : summaryData.healthPct >= 40 ? 'Moderate' : 'Needs Attention'
    : 'Loading...';
  const overallColor = summaryData
    ? summaryData.healthPct >= 70 ? '#22c55e' : summaryData.healthPct >= 40 ? '#eab308' : '#ef4444'
    : '#9ca3af';

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', background: '#f8fafc' }}>
      {/* Clean header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        padding: '3rem 1.5rem 2rem',
        color: 'white',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.85rem', color: '#c4b5fd', marginBottom: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {customer?.customerName || 'Your Company'}
        </p>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Your GTM Assessment Results
        </h1>
        <p style={{ fontSize: '1rem', color: '#c4b5fd', maxWidth: '600px', margin: '0 auto' }}>
          A comprehensive review of your go-to-market operations, processes, and tools.
        </p>
      </div>

      {/* Summary Section */}
      {summaryData && (
        <div style={{
          maxWidth: '960px',
          margin: '-1.5rem auto 2rem',
          padding: '0 1.5rem',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            padding: '1.5rem 2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Overall Health
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: overallColor }}>
                {overallHealth}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>{summaryData.healthPct}% healthy</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Processes Assessed
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e1b4b' }}>{summaryData.total}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Areas of Concern
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{summaryData.warningCount}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Priority Items
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6c5ce7' }}>{summaryData.priorityCount}</div>
            </div>
          </div>

          {/* Key Findings */}
          {summaryData.topFindings.length > 0 && (
            <div style={{
              background: 'white',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              padding: '1.25rem 2rem',
              marginTop: '1rem',
            }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a2e', marginBottom: '0.75rem' }}>
                Key Findings
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {summaryData.topFindings.map((name) => (
                  <span key={name} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.35rem 0.75rem',
                    background: '#FFF5F5',
                    border: '1px solid #FED7D7',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    color: '#9B2C2C',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Next Steps */}
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            padding: '1.25rem 2rem',
            marginTop: '1rem',
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a2e', marginBottom: '0.75rem' }}>
              Recommended Next Steps
            </h3>
            <ol style={{ margin: 0, paddingLeft: '1.25rem', color: '#4a5568', fontSize: '0.875rem', lineHeight: 1.7 }}>
              <li>Review the detailed findings below to understand each area of your GTM operations.</li>
              <li>Schedule a follow-up with your LeanScale advisor to discuss prioritization.</li>
              <li>View our engagement recommendations for a tailored improvement plan.</li>
            </ol>
          </div>

          {/* CTA buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <a
              href="https://calendly.com/leanscale"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.75rem 2rem',
                background: '#6c5ce7',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Schedule a Follow-up
            </a>
            <Link
              href={customerPath('/try-leanscale/engagement')}
              style={{
                padding: '0.75rem 2rem',
                background: 'white',
                color: '#6c5ce7',
                border: '2px solid #6c5ce7',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              View Engagement Recommendations
            </Link>
          </div>
        </div>
      )}

      {/* Diagnostic Results — Read-Only */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <DiagnosticResults diagnosticType={diagnosticType} readOnly={true} />
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '2rem 1rem',
        borderTop: '1px solid #e2e8f0',
        color: '#a0aec0',
        fontSize: '0.8rem',
      }}>
        Powered by LeanScale &bull; {new Date().getFullYear()}
      </div>
    </div>
  );
}
