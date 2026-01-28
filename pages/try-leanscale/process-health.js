import Link from 'next/link';
import Layout from '../../components/Layout';
import { processes, countStatuses, statusToLabel } from '../../data/diagnostic-data';

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

function ProcessCard({ process }) {
  return (
    <div style={{
      background: 'white',
      border: process.addToEngagement ? '2px solid var(--ls-purple)' : '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
    }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{process.name}</span>
        {process.addToEngagement && (
          <span style={{
            display: 'inline-block',
            background: 'var(--ls-lime-green)',
            color: 'var(--ls-purple)',
            fontSize: '0.65rem',
            fontWeight: 600,
            padding: '0.15rem 0.4rem',
            borderRadius: '4px',
            marginLeft: '0.5rem',
          }}>
            Priority
          </span>
        )}
      </div>
      <StatusDot status={process.status} />
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {data.slice(0, 20).map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 20, textAlign: 'center' }}>
              <StatusDot status={item.status} />
            </div>
            <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '4px', height: 20, overflow: 'hidden' }}>
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
          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>processes</div>
        </div>
      ))}
    </div>
  );
}

export default function ProcessHealth() {
  const counts = countStatuses(processes);
  const total = processes.length;
  const priorityProcesses = processes.filter(p => p.addToEngagement);
  const otherProcesses = processes.filter(p => !p.addToEngagement);

  return (
    <Layout title="Process Overall Health">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <span>⚙️</span> Process Overall Health
          </h1>
          <p className="page-subtitle">
            Total # Process Inspection Points: <strong>{total}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Link href="/try-leanscale/gtm-tool-health" className="btn btn-secondary">
            Previous: <strong style={{ marginLeft: '0.25rem' }}>GTM Tool Health</strong>
          </Link>
          <Link href="/try-leanscale/engagement" className="btn btn-secondary">
            Next up: <strong style={{ marginLeft: '0.25rem' }}>Engagement Overview</strong>
          </Link>
        </div>

        <SummaryStats counts={counts} total={total} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Priority Processes</h2>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
            These processes have been identified as priorities for your engagement.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem',
          }} className="process-grid">
            {priorityProcesses.map((process, index) => (
              <ProcessCard key={index} process={process} />
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>All Processes</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem',
          }} className="process-grid">
            {otherProcesses.map((process, index) => (
              <ProcessCard key={index} process={process} />
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
            title="Process Health Distribution (Top 20)"
            data={processes}
          />
        </section>

        <div style={{
          background: '#f9fafb',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center',
        }}>
          <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
            Ready to improve your GTM processes? Our team can help design and implement the right processes for your business.
          </p>
          <Link href="/buy-leanscale" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </div>
    </Layout>
  );
}
