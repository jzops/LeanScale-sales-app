import { useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import HealthBar from '../../components/HealthBar';
import { 
  processes, 
  tools, 
  power10Metrics, 
  countStatuses, 
  statusToLabel, 
  groupBy,
  gtmFunctions,
  gtmOutcomes,
  power10MetricNames,
} from '../../data/diagnostic-data';

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
        width: 14,
        height: 14,
        borderRadius: '50%',
        backgroundColor: statusColors[status] || '#ccc',
        flexShrink: 0,
      }}
      title={statusToLabel(status)}
    />
  );
}

function GroupedSection({ title, items, showFunction = false }) {
  const counts = countStatuses(items);
  
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      marginBottom: '1rem',
      overflow: 'hidden',
    }}>
      <div style={{
        background: '#f9fafb',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{title}</h3>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <StatusDot status="healthy" /> {counts.healthy}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <StatusDot status="careful" /> {counts.careful}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <StatusDot status="warning" /> {counts.warning}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <StatusDot status="unable" /> {counts.unable}
          </span>
        </div>
      </div>
      <div style={{ padding: '0.5rem' }}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0.75rem',
              borderRadius: '4px',
              background: index % 2 === 0 ? '#fafafa' : 'white',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <span style={{ fontSize: '0.85rem' }}>{item.name}</span>
              {showFunction && item.function && (
                <span style={{
                  fontSize: '0.65rem',
                  background: '#e5e7eb',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  color: '#6b7280',
                }}>
                  {item.function}
                </span>
              )}
              {item.addToEngagement && (
                <span style={{
                  fontSize: '0.65rem',
                  background: 'var(--ls-lime-green)',
                  color: 'var(--ls-purple)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}>
                  Priority
                </span>
              )}
            </div>
            <StatusDot status={item.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

const views = [
  { id: 'power10', label: 'Power10 GTM Metric Health', icon: '📈' },
  { id: 'tools', label: 'GTM Tool Health', icon: '🔧' },
  { id: 'processes', label: 'Processes Overall Health', icon: '⚙️' },
  { id: 'by-outcome', label: 'by GTM Outcome', icon: '🎯' },
  { id: 'by-metric', label: 'by GTM Metric (Power10)', icon: '📊' },
  { id: 'by-function', label: 'by Function', icon: '👥' },
];

export default function GTMDiagnostic() {
  const [activeView, setActiveView] = useState('processes');

  const processStats = countStatuses(processes);
  const toolStats = countStatuses(tools);
  
  const processesByFunction = groupBy(processes, 'function');
  const processesByOutcome = groupBy(processes, 'outcome');
  const processesByMetric = groupBy(processes, 'metric');

  return (
    <Layout title="GTM Diagnostic">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <span>📊</span> GTM Diagnostic
          </h1>
        </div>

        <div className="card-grid" style={{ marginBottom: '2rem' }}>
          {views.map((view) => (
            <div
              key={view.id}
              className="card"
              style={{
                cursor: 'pointer',
                border: activeView === view.id ? '2px solid var(--ls-purple)' : undefined,
                background: activeView === view.id ? '#f5f3ff' : undefined,
              }}
              onClick={() => setActiveView(view.id)}
            >
              <span style={{ fontSize: '1.5rem' }}>{view.icon}</span>
              <h3 className="card-title" style={{ marginTop: '0.5rem' }}>{view.label}</h3>
            </div>
          ))}
        </div>

        {activeView === 'power10' && (
          <section>
            <h2 style={{ marginBottom: '1.5rem' }}>Power10 GTM Metric Health</h2>
            <div className="card-grid">
              {power10Metrics.map((metric) => (
                <div key={metric.name} className="card">
                  <h3 className="card-title">{metric.name}</h3>
                  <span className="status-badge status-unable">N/A</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '1rem', color: '#666', fontStyle: 'italic' }}>
              Note: Metric health statuses are populated during the diagnostic session.
            </p>
            <div style={{ marginTop: '1rem' }}>
              <Link href="/try-leanscale/power10" className="btn btn-primary">
                View Full Power10 Report →
              </Link>
            </div>
          </section>
        )}

        {activeView === 'tools' && (
          <section>
            <h2 style={{ marginBottom: '1rem' }}>GTM Tool Health</h2>
            <p style={{ marginBottom: '1rem' }}>{tools.length} Tool Inspection Points</p>
            <HealthBar data={toolStats} />

            <div style={{ marginTop: '2rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tools.map((tool) => (
                    <tr key={tool.name}>
                      <td>{tool.name}</td>
                      <td>
                        <span className={`status-badge status-${tool.status}`}>
                          {statusToLabel(tool.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Link href="/try-leanscale/gtm-tool-health" className="btn btn-primary">
                View Full Tool Health Report →
              </Link>
            </div>
          </section>
        )}

        {activeView === 'processes' && (
          <section>
            <h2 style={{ marginBottom: '1rem' }}>Processes Overall Health</h2>
            <p style={{ marginBottom: '1rem' }}>{processes.length} Process Inspection Points</p>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span>{processStats.healthy} ({((processStats.healthy / processes.length) * 100).toFixed(0)}%) Healthy</span>
              <span>{processStats.careful} ({((processStats.careful / processes.length) * 100).toFixed(0)}%) Careful</span>
              <span>{processStats.warning} ({((processStats.warning / processes.length) * 100).toFixed(0)}%) Warning</span>
              <span>{processStats.unable} ({((processStats.unable / processes.length) * 100).toFixed(0)}%) Unable</span>
            </div>

            <HealthBar data={processStats} />

            <div style={{ marginTop: '2rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Process</th>
                    <th>Status</th>
                    <th>Add to Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map((process) => (
                    <tr key={process.name}>
                      <td>{process.name}</td>
                      <td>
                        <span className={`status-badge status-${process.status}`}>
                          {statusToLabel(process.status)}
                        </span>
                      </td>
                      <td>{process.addToEngagement ? '✓' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Link href="/try-leanscale/process-health" className="btn btn-primary">
                View Full Process Health Report →
              </Link>
            </div>
          </section>
        )}

        {activeView === 'by-outcome' && (
          <section>
            <h2 style={{ marginBottom: '0.5rem' }}>by GTM Outcome</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              {processes.length} processes grouped by desired GTM outcome
            </p>
            
            {gtmOutcomes.map((outcome) => {
              const items = processesByOutcome[outcome] || [];
              if (items.length === 0) return null;
              return (
                <GroupedSection 
                  key={outcome} 
                  title={outcome} 
                  items={items}
                  showFunction={true}
                />
              );
            })}
          </section>
        )}

        {activeView === 'by-metric' && (
          <section>
            <h2 style={{ marginBottom: '0.5rem' }}>by GTM Metric (Power10)</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              {processes.length} processes grouped by which Power10 metric they impact
            </p>
            
            {power10MetricNames.map((metric) => {
              const items = processesByMetric[metric] || [];
              if (items.length === 0) return null;
              return (
                <GroupedSection 
                  key={metric} 
                  title={metric} 
                  items={items}
                  showFunction={true}
                />
              );
            })}
          </section>
        )}

        {activeView === 'by-function' && (
          <section>
            <h2 style={{ marginBottom: '0.5rem' }}>by Function</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              {processes.length} processes grouped by GTM function
            </p>
            
            {gtmFunctions.map((func) => {
              const items = processesByFunction[func] || [];
              if (items.length === 0) return null;
              return (
                <GroupedSection 
                  key={func} 
                  title={func} 
                  items={items}
                />
              );
            })}
          </section>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Link href="/try-leanscale" className="btn" style={{ background: 'var(--ls-light-gray)' }}>
            ← Go Back
          </Link>
          <Link href="/try-leanscale/engagement" className="btn btn-primary">
            Next up: Engagement Overview →
          </Link>
        </div>
      </div>
    </Layout>
  );
}
