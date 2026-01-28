import Link from 'next/link';
import Layout from '../../components/Layout';
import { tools, countStatuses, statusToLabel } from '../../data/diagnostic-data';

const statusColors = {
  healthy: '#22c55e',
  careful: '#eab308',
  warning: '#ef4444',
  unable: '#1f2937',
};

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
      title={statusToLabel(status)}
    />
  );
}

function ToolCard({ tool }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{tool.name}</span>
      <StatusDot status={tool.status} />
    </div>
  );
}

function HorizontalBarChart({ title, data }) {
  const maxValue = 6;
  
  const getBarValue = (status) => {
    const values = { healthy: 5, careful: 3.5, warning: 2, unable: 1 };
    return values[status] || 0;
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {data.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 20, textAlign: 'center' }}>
              <StatusDot status={item.status} />
            </div>
            <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '4px', height: 24, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(getBarValue(item.status) / maxValue) * 100}%`,
                  height: '100%',
                  backgroundColor: statusColors[item.status],
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

function SummaryStats({ counts, total }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      marginBottom: '2rem',
    }} className="summary-stats-grid">
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
            {statusToLabel(status)}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {counts[status]}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>tools</div>
        </div>
      ))}
    </div>
  );
}

export default function GTMToolHealth() {
  const counts = countStatuses(tools);
  const total = tools.length;

  return (
    <Layout title="GTM Tool Health">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <span>🔧</span> GTM Tool Health
          </h1>
          <p className="page-subtitle">
            Total # Tool Inspection Points: <strong>{total}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Link href="/try-leanscale/power10" className="btn btn-secondary">
            Previous: <strong style={{ marginLeft: '0.25rem' }}>Power10 Metrics</strong>
          </Link>
          <Link href="/try-leanscale/process-health" className="btn btn-secondary">
            Next up: <strong style={{ marginLeft: '0.25rem' }}>Process Health</strong>
          </Link>
        </div>

        <SummaryStats counts={counts} total={total} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Tool Status Overview</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
          }} className="tools-grid">
            {tools.map((tool, index) => (
              <ToolCard key={index} tool={tool} />
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

        <section style={{ marginBottom: '2.5rem' }}>
          <HorizontalBarChart
            title="Tool Health Distribution (Sample)"
            data={tools}
          />
        </section>

        <div style={{
          background: '#f9fafb',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center',
        }}>
          <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
            Need help implementing or optimizing your GTM tools? Our team specializes in tool implementations.
          </p>
          <Link href="/buy-leanscale" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </div>
    </Layout>
  );
}
