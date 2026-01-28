import Link from 'next/link';
import Layout from '../../components/Layout';
import { power10Metrics, statusColors, statusLabels, statusEmoji } from '../../data/power10-metrics';

function StatusDot({ status }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 16,
        height: 16,
        borderRadius: '50%',
        backgroundColor: statusColors[status] || '#ccc',
      }}
      title={statusLabels[status]}
    />
  );
}

function MetricCard({ metric }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '1rem',
    }}>
      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', minHeight: '2.5rem' }}>
        {metric.name}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6b7280' }}>Able to Report (P10)</span>
          <StatusDot status={metric.ableToReport} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6b7280' }}>Status Against Plan (P10)</span>
          <StatusDot status={metric.statusAgainstPlan} />
        </div>
      </div>
    </div>
  );
}

function HorizontalBarChart({ title, data, field }) {
  const maxValue = 6;
  
  const getBarValue = (status) => {
    const values = { healthy: 5, careful: 3.5, warning: 2, unable: 1 };
    return values[status] || 0;
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {data.map((metric, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 20, textAlign: 'center' }}>
              <StatusDot status={metric[field]} />
            </div>
            <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '4px', height: 24, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(getBarValue(metric[field]) / maxValue) * 100}%`,
                  height: '100%',
                  backgroundColor: statusColors[metric[field]],
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <StatusDot status="healthy" /> <span>Healthy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <StatusDot status="careful" /> <span>Careful</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <StatusDot status="warning" /> <span>Warning</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <StatusDot status="unable" /> <span>Unable to Report</span>
        </div>
      </div>
    </div>
  );
}

function SummaryStats({ metrics }) {
  const countByStatus = (field) => {
    const counts = { healthy: 0, careful: 0, warning: 0, unable: 0 };
    metrics.forEach((m) => {
      const status = m[field];
      if (counts[status] !== undefined) counts[status]++;
    });
    return counts;
  };

  const ableToReportCounts = countByStatus('ableToReport');
  const statusAgainstPlanCounts = countByStatus('statusAgainstPlan');

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      marginBottom: '2rem',
    }}>
      {['healthy', 'careful', 'warning', 'unable'].map((status) => (
        <div
          key={status}
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <StatusDot status={status} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            {statusLabels[status]}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {ableToReportCounts[status]}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>metrics</div>
        </div>
      ))}
    </div>
  );
}

export default function Power10MetricHealth() {
  return (
    <Layout title="Power10 GTM Metric Health">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <span>📊</span> Power10 GTM Metric Health
          </h1>
          <p className="page-subtitle">
            Total # <Link href="#reporting" style={{ color: 'var(--ls-purple)' }}>Reporting</Link> Inspection Points: <strong>10</strong>
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <Link href="/try-leanscale/gtm-tool-health" className="btn btn-secondary">
            Next up: <strong style={{ marginLeft: '0.25rem' }}>GTM Tool Health</strong>
          </Link>
        </div>

        <SummaryStats metrics={power10Metrics} />

        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '1rem',
          }} className="metrics-grid">
            {power10Metrics.map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <StatusDot status="healthy" /> <span>Healthy</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <StatusDot status="careful" /> <span>Careful</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <StatusDot status="warning" /> <span>Warning</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <StatusDot status="unable" /> <span>Unable to Report</span>
            </div>
          </div>
        </section>

        <section id="reporting" style={{ marginBottom: '2.5rem' }}>
          <HorizontalBarChart
            title="Ability to Report Power10 (Sample)"
            data={power10Metrics}
            field="ableToReport"
          />
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <HorizontalBarChart
            title="Status Against Plan Power10 (Sample)"
            data={power10Metrics}
            field="statusAgainstPlan"
          />
        </section>

        <div style={{
          background: '#f9fafb',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center',
        }}>
          <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
            Want to improve your Power10 metrics? Our team can help you build the systems and processes needed.
          </p>
          <Link href="/buy-leanscale" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </div>
    </Layout>
  );
}
