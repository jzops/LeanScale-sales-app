import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import DonutChart from '../../components/charts/DonutChart';
import BarChart from '../../components/charts/BarChart';
import SummaryCard from '../../components/diagnostic/SummaryCard';
import { StatusDot, StatusBadge } from '../../components/diagnostic/StatusLegend';
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
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280' }}>Name</th>
            {showFunction && <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280' }}>Function</th>}
            <th style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280' }}>Status</th>
            {showPriority && <th style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280' }}>Priority</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.name}
              style={{
                borderBottom: '1px solid #f3f4f6',
                background: index % 2 === 0 ? 'white' : '#fafafa',
              }}
            >
              <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{item.name}</td>
              {showFunction && (
                <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: '#6b7280' }}>
                  {item.function || item.category || '-'}
                </td>
              )}
              <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                <StatusBadge status={item.status} />
              </td>
              {showPriority && (
                <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                  {item.addToEngagement && (
                    <span style={{
                      fontSize: '0.7rem',
                      background: 'var(--ls-lime-green, #84cc16)',
                      color: 'var(--ls-purple, #7c3aed)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 600,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {groupNames.map((groupName) => {
        const groupItems = grouped[groupName] || [];
        if (groupItems.length === 0) return null;

        const stats = countStatuses(groupItems);

        return (
          <div
            key={groupName}
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
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
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{groupName}</h3>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
                {stats.healthy > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <StatusDot status="healthy" size={10} /> {stats.healthy}
                  </span>
                )}
                {stats.careful > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <StatusDot status="careful" size={10} /> {stats.careful}
                  </span>
                )}
                {stats.warning > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <StatusDot status="warning" size={10} /> {stats.warning}
                  </span>
                )}
                {stats.unable > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <StatusDot status="unable" size={10} /> {stats.unable}
                  </span>
                )}
              </div>
            </div>
            <div style={{ padding: '0.5rem' }}>
              {groupItems.map((item, index) => (
                <div
                  key={item.name}
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
                    {item.addToEngagement && (
                      <span style={{
                        fontSize: '0.65rem',
                        background: 'var(--ls-lime-green, #84cc16)',
                        color: 'var(--ls-purple, #7c3aed)',
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
      })}
    </div>
  );
}

export default function GTMDiagnostic() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('processes');

  // Handle tab from URL query parameter
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

  return (
    <Layout title="GTM Diagnostic Results">
      <div className="container">
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <h1 className="page-title">
            <span>📊</span> GTM Diagnostic Results
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Comprehensive health assessment of your GTM operations
          </p>
        </div>

        {/* Summary Cards Row */}
        <div className="diagnostic-summary-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          <SummaryCard
            title="Power10 Metrics"
            icon="📈"
            data={power10Stats}
            onClick={() => setActiveTab('power10')}
            isActive={activeTab === 'power10'}
          />
          <SummaryCard
            title="GTM Tools"
            icon="🔧"
            data={toolStats}
            onClick={() => setActiveTab('tools')}
            isActive={activeTab === 'tools'}
          />
          <SummaryCard
            title="Processes"
            icon="⚙️"
            data={processStats}
            onClick={() => setActiveTab('processes')}
            isActive={activeTab === 'processes'}
          />
        </div>

        {/* Tab Navigation */}
        <div className="diagnostic-tabs" style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0',
          overflowX: 'auto',
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.25rem',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--ls-purple, #7c3aed)' : '2px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                background: 'transparent',
                color: activeTab === tab.id ? 'var(--ls-purple, #7c3aed)' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="diagnostic-content">
          {activeTab === 'power10' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '300px 1fr',
                gap: '2rem',
                marginBottom: '2rem',
              }} className="diagnostic-charts-row">
                <div style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}>
                  <DonutChart
                    data={power10Stats}
                    title="Health Distribution"
                    size={180}
                  />
                </div>
                <div style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}>
                  <BarChart
                    data={power10Metrics.map(m => ({
                      name: m.name,
                      status: m.ableToReport || 'unable'
                    }))}
                    title="Power10 Metrics Status"
                  />
                </div>
              </div>
              <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>All Power10 Metrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }} className="power10-grid">
                  {power10Metrics.map((metric) => (
                    <div
                      key={metric.name}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: '#f9fafb',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{metric.name}</span>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Report</div>
                          <StatusDot status={metric.ableToReport || 'unable'} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Plan</div>
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
              <div style={{
                display: 'grid',
                gridTemplateColumns: '300px 1fr',
                gap: '2rem',
                marginBottom: '2rem',
              }} className="diagnostic-charts-row">
                <div style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}>
                  <DonutChart
                    data={toolStats}
                    title="Health Distribution"
                    size={180}
                  />
                </div>
                <div style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}>
                  <BarChart
                    data={tools}
                    title="GTM Tools Status"
                  />
                </div>
              </div>
              <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>All GTM Tools</h3>
                <ItemTable items={tools} showFunction={true} />
              </div>
            </div>
          )}

          {activeTab === 'processes' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '300px 1fr',
                gap: '2rem',
                marginBottom: '2rem',
              }} className="diagnostic-charts-row">
                <div style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}>
                  <DonutChart
                    data={processStats}
                    title="Health Distribution"
                    size={180}
                  />
                </div>
                <div style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  overflow: 'auto',
                }}>
                  <BarChart
                    data={processes}
                    title="Process Health Overview"
                    maxItems={25}
                  />
                </div>
              </div>
              <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>All Processes ({processes.length})</h3>
                <ItemTable items={processes} showFunction={true} />
              </div>
            </div>
          )}

          {activeTab === 'by-function' && (
            <div>
              <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Processes by GTM Function</h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  {processes.length} processes grouped by their GTM function
                </p>
                <GroupedView
                  items={processes}
                  groupByField="function"
                  groupNames={gtmFunctions}
                />
              </div>
            </div>
          )}

          {activeTab === 'by-outcome' && (
            <div>
              <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Processes by GTM Outcome</h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  {processes.length} processes grouped by their desired business outcome
                </p>
                <GroupedView
                  items={processes}
                  groupByField="outcome"
                  groupNames={gtmOutcomes}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e5e7eb',
        }}>
          <Link href="/try-leanscale" className="btn" style={{ background: '#f3f4f6', color: '#374151' }}>
            ← Back to Start
          </Link>
          <Link href="/try-leanscale/engagement" className="btn btn-primary">
            View Engagement Overview →
          </Link>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .diagnostic-summary-grid {
            grid-template-columns: 1fr !important;
          }
          .diagnostic-charts-row {
            grid-template-columns: 1fr !important;
          }
          .power10-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Layout>
  );
}
