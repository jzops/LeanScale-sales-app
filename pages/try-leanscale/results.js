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
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', background: 'var(--bg-subtle)' }}>
      {/* Clean header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        padding: 'var(--space-12) var(--space-6) var(--space-8)',
        color: 'white',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 'var(--text-sm)', color: '#c4b5fd', marginBottom: 'var(--space-2)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {customer?.customerName || 'Your Company'}
        </p>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
          Your GTM Assessment Results
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: '#c4b5fd', maxWidth: '600px', margin: '0 auto' }}>
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
            background: 'var(--bg-white)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            padding: 'var(--space-6) var(--space-8)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--space-6)',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Overall Health
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: overallColor }}>
                {overallHealth}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{summaryData.healthPct}% healthy</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Processes Assessed
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#1e1b4b' }}>{summaryData.total}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Areas of Concern
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#ef4444' }}>{summaryData.warningCount}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Priority Items
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--ls-purple-light)' }}>{summaryData.priorityCount}</div>
            </div>
          </div>

          {/* Key Findings */}
          {summaryData.topFindings.length > 0 && (
            <div style={{
              background: 'var(--bg-white)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-color)',
              padding: '1.25rem 2rem',
              marginTop: 'var(--space-4)',
            }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--gray-900)', marginBottom: 'var(--space-3)' }}>
                Key Findings
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {summaryData.topFindings.map((name) => (
                  <span key={name} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: 'var(--space-1) var(--space-3)',
                    background: 'var(--status-warning-bg)',
                    border: '1px solid var(--status-warning-bg)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--status-warning-text)',
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
            background: 'var(--bg-white)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            padding: '1.25rem 2rem',
            marginTop: 'var(--space-4)',
          }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--gray-900)', marginBottom: 'var(--space-3)' }}>
              Recommended Next Steps
            </h3>
            <ol style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
              <li>Review the detailed findings below to understand each area of your GTM operations.</li>
              <li>Schedule a follow-up with your LeanScale advisor to discuss prioritization.</li>
              <li>View our engagement recommendations for a tailored improvement plan.</li>
            </ol>
          </div>

          {/* CTA buttons */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-6)',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <a
              href="https://calendly.com/leanscale"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: 'var(--space-3) var(--space-8)',
                background: '#6c5ce7',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-semibold)',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Schedule a Follow-up
            </a>
            <Link
              href={customerPath('/try-leanscale/engagement')}
              style={{
                padding: 'var(--space-3) var(--space-8)',
                background: 'var(--bg-white)',
                color: 'var(--ls-purple-light)',
                border: '2px solid var(--ls-purple-light)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-semibold)',
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
