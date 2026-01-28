import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import DonutChart from '../../components/charts/DonutChart';
import BarChart from '../../components/charts/BarChart';
import { StatusDot, StatusBadge, getStatusColor } from '../../components/diagnostic/StatusLegend';
import {
  processes,
  tools,
  countStatuses,
  groupBy,
  gtmFunctions,
  gtmOutcomes,
} from '../../data/diagnostic-data';
import { power10Metrics } from '../../data/power10-metrics';

const TABS = [
  { id: 'power10', label: 'Power10 Metrics', icon: '📈' },
  { id: 'tools', label: 'GTM Tools', icon: '🔧' },
  { id: 'processes', label: 'Processes', icon: '⚙️' },
  { id: 'by-function', label: 'By Function', icon: '👥' },
  { id: 'by-outcome', label: 'By Outcome', icon: '🎯' },
];


function ItemTable({ items, showFunction = false, showPriority = true }) {
  return (
    <div className="diagnostic-table">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            {showFunction && <th>Function</th>}
            <th style={{ textAlign: 'center' }}>Status</th>
            {showPriority && <th style={{ textAlign: 'center' }}>Priority</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.name}>
              <td style={{ fontWeight: 'var(--font-medium)' }}>{item.name}</td>
              {showFunction && (
                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  {item.function || item.category || '-'}
                </td>
              )}
              <td style={{ textAlign: 'center' }}>
                <StatusBadge status={item.status} />
              </td>
              {showPriority && (
                <td style={{ textAlign: 'center' }}>
                  {item.addToEngagement && (
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      background: 'var(--ls-lime-green)',
                      color: 'var(--ls-purple)',
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 'var(--font-semibold)',
                    }}>
                      Priority
                    </span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupedView({ items, groupByField, groupNames }) {
  const grouped = groupBy(items, groupByField);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {groupNames.map((groupName) => {
        const groupItems = grouped[groupName] || [];
        if (groupItems.length === 0) return null;

        const stats = countStatuses(groupItems);

        return (
          <div
            key={groupName}
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          >
            <div style={{
              background: 'var(--bg-subtle)',
              padding: 'var(--space-3) var(--space-4)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
            }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', margin: 0 }}>{groupName}</h3>
              <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                {stats.healthy > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <StatusDot status="healthy" size={8} /> {stats.healthy}
                  </span>
                )}
                {stats.careful > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <StatusDot status="careful" size={8} /> {stats.careful}
                  </span>
                )}
                {stats.warning > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <StatusDot status="warning" size={8} /> {stats.warning}
                  </span>
                )}
                {stats.unable > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <StatusDot status="unable" size={8} /> {stats.unable}
                  </span>
                )}
              </div>
            </div>
            <div style={{ padding: 'var(--space-2)' }}>
              {groupItems.map((item, index) => (
                <div
                  key={item.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    background: index % 2 === 0 ? 'var(--bg-subtle)' : 'white',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1 }}>
                    <span style={{ fontSize: 'var(--text-sm)' }}>{item.name}</span>
                    {item.addToEngagement && (
                      <span style={{
                        fontSize: 'var(--text-2xs)',
                        background: 'var(--ls-lime-green)',
                        color: 'var(--ls-purple)',
                        padding: '0.1rem var(--space-1)',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 'var(--font-semibold)',
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
      })}
    </div>
  );
}

export default function GTMDiagnostic() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('processes');

  useEffect(() => {
    const { tab } = router.query;
    if (tab && TABS.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [router.query]);

  const processStats = countStatuses(processes);
  const toolStats = countStatuses(tools);
  const power10Stats = countStatuses(power10Metrics.map(m => ({
    status: m.ableToReport || 'unable'
  })));

  const priorityCount = processes.filter(p => p.addToEngagement).length;

  return (
    <Layout title="GTM Diagnostic Results">
      <div className="container">
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title" style={{ justifyContent: 'center' }}>
            <span>📊</span> GTM Diagnostic Results
          </h1>
          <p className="page-subtitle">Comprehensive health assessment of your GTM operations</p>
        </div>

        {/* Summary Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Processes</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ls-purple-light)' }}>{processes.length}</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Tools</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ls-purple-light)' }}>{tools.length}</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Power10 Metrics</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ls-purple-light)' }}>{power10Metrics.length}</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Priority Items</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>{priorityCount}</div>
          </div>
        </div>

        {/* Quick Insights Section - Dark Purple */}
        <section className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🎯</span> Health Overview
          </h2>
          <p style={{ color: '#c4b5fd', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
            Status distribution across all inspection points
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Power10 Metrics', stats: power10Stats, count: power10Metrics.length },
              { label: 'GTM Tools', stats: toolStats, count: tools.length },
              { label: 'Processes', stats: processStats, count: processes.length },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#a5b4fc', marginBottom: '0.5rem' }}>{item.label}</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {item.stats.healthy > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#4ade80' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor('healthy') }}></span>
                      {item.stats.healthy}
                    </span>
                  )}
                  {item.stats.careful > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#facc15' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor('careful') }}></span>
                      {item.stats.careful}
                    </span>
                  )}
                  {item.stats.warning > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#f87171' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor('warning') }}></span>
                      {item.stats.warning}
                    </span>
                  )}
                  {item.stats.unable > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor('unable') }}></span>
                      {item.stats.unable}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-2xs)', color: '#a5b4fc', marginBottom: '0.25rem' }}>Healthy</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4ade80' }}>{processStats.healthy + toolStats.healthy + power10Stats.healthy}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-2xs)', color: '#a5b4fc', marginBottom: '0.25rem' }}>Careful</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#facc15' }}>{processStats.careful + toolStats.careful + power10Stats.careful}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-2xs)', color: '#a5b4fc', marginBottom: '0.25rem' }}>Warning</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f87171' }}>{processStats.warning + toolStats.warning + power10Stats.warning}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-2xs)', color: '#a5b4fc', marginBottom: '0.25rem' }}>Unable to Report</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#9ca3af' }}>{processStats.unable + toolStats.unable + power10Stats.unable}</div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="diagnostic-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`diagnostic-tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ marginTop: '2rem' }}>
          {activeTab === 'power10' && (
            <div>
              <div className="diagnostic-charts-row" style={{ marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <DonutChart data={power10Stats} title="Health Distribution" size={160} />
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <BarChart
                    data={power10Metrics.map(m => ({
                      name: m.name,
                      status: m.ableToReport || 'unable'
                    }))}
                    title="Power10 Metrics Status"
                  />
                </div>
              </div>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>All Power10 Metrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }} className="power10-grid">
                  {power10Metrics.map((metric) => (
                    <div
                      key={metric.name}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-lg)',
                      }}
                    >
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>{metric.name}</span>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Report</div>
                          <StatusDot status={metric.ableToReport || 'unable'} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Plan</div>
                          <StatusDot status={metric.statusAgainstPlan || 'unable'} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div>
              <div className="diagnostic-charts-row" style={{ marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <DonutChart data={toolStats} title="Health Distribution" size={160} />
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <BarChart data={tools} title="GTM Tools Status" />
                </div>
              </div>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>All GTM Tools</h3>
                <ItemTable items={tools} showFunction={true} />
              </div>
            </div>
          )}

          {activeTab === 'processes' && (
            <div>
              <div className="diagnostic-charts-row" style={{ marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <DonutChart data={processStats} title="Health Distribution" size={160} />
                </div>
                <div className="card" style={{ padding: '1.5rem', overflow: 'auto' }}>
                  <BarChart data={processes} title="Process Health Overview" maxItems={25} />
                </div>
              </div>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>All Processes ({processes.length})</h3>
                <ItemTable items={processes} showFunction={true} />
              </div>
            </div>
          )}

          {activeTab === 'by-function' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Processes by GTM Function</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
                {processes.length} processes grouped by their GTM function
              </p>
              <GroupedView items={processes} groupByField="function" groupNames={gtmFunctions} />
            </div>
          )}

          {activeTab === 'by-outcome' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Processes by GTM Outcome</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
                {processes.length} processes grouped by their desired business outcome
              </p>
              <GroupedView items={processes} groupByField="outcome" groupNames={gtmOutcomes} />
            </div>
          )}
        </div>

        {/* CTA Banner */}
        <div className="cta-banner" style={{ marginTop: '2rem' }}>
          <h3 className="cta-title">Ready to see your recommended engagement?</h3>
          <p className="cta-subtitle">
            View prioritized projects and timeline based on your diagnostic results.
          </p>
          <div className="cta-buttons">
            <Link href="/try-leanscale/engagement" className="btn cta-btn-primary">
              View Engagement Overview
            </Link>
            <Link href="/buy-leanscale" className="btn cta-btn-secondary">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
