import { useState } from 'react';
import { getStatusColor, getStatusLabel } from '../diagnostic/StatusLegend';

const STATUS_ORDER = ['warning', 'careful', 'healthy', 'unable'];

export default function BarChart({ data, title }) {
  const [expandedGroups, setExpandedGroups] = useState({
    warning: true,
    careful: true,
    healthy: false,
    unable: false,
  });

  // Group data by status
  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = data.filter(item => item.status === status);
    return acc;
  }, {});

  const toggleGroup = (status) => {
    setExpandedGroups(prev => ({ ...prev, [status]: !prev[status] }));
  };

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>No data to display</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h4 style={{
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-semibold)',
          marginBottom: 'var(--space-4)',
          color: 'var(--text-primary)'
        }}>
          {title}
        </h4>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {STATUS_ORDER.map(status => {
          const items = grouped[status];
          const color = getStatusColor(status);
          const label = getStatusLabel(status);
          if (items.length === 0) return null;

          const isExpanded = expandedGroups[status];

          return (
            <div
              key={status}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}
            >
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(status)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--bg-subtle)',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    {label}
                  </span>
                  <span style={{
                    background: color,
                    color: status === 'careful' ? 'var(--gray-800)' : 'white',
                    padding: '0.1rem var(--space-2)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-semibold)',
                  }}>
                    {items.length}
                  </span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }}>
                  {isExpanded ? '▼' : '▶'}
                </span>
              </button>

              {/* Expanded Items */}
              {isExpanded && (
                <div style={{ padding: 'var(--space-2)' }}>
                  {items.map((item, index) => (
                    <div
                      key={item.name || index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        background: index % 2 === 0 ? 'white' : 'var(--bg-subtle)',
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-primary)',
                        flex: 1,
                      }}>
                        {item.name}
                      </span>
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
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
