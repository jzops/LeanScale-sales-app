import { useState } from 'react';

const STATUS_CONFIG = {
  healthy: { color: '#22c55e', label: 'Healthy', emoji: '🟢' },
  careful: { color: '#eab308', label: 'Careful', emoji: '🟡' },
  warning: { color: '#ef4444', label: 'Warning', emoji: '🔴' },
  unable: { color: '#1f2937', label: 'Unable to Report', emoji: '⚫' },
};

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
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No data to display</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h4 style={{
          fontSize: '1rem',
          fontWeight: 600,
          marginBottom: '1rem',
          color: '#374151'
        }}>
          {title}
        </h4>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {STATUS_ORDER.map(status => {
          const items = grouped[status];
          const config = STATUS_CONFIG[status];
          if (items.length === 0) return null;

          const isExpanded = expandedGroups[status];

          return (
            <div
              key={status}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
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
                  padding: '0.75rem 1rem',
                  background: '#f9fafb',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: config.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>
                    {config.label}
                  </span>
                  <span style={{
                    background: config.color,
                    color: status === 'careful' ? '#1f2937' : 'white',
                    padding: '0.1rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}>
                    {items.length}
                  </span>
                </div>
                <span style={{ color: '#9ca3af', fontSize: '1rem' }}>
                  {isExpanded ? '▼' : '▶'}
                </span>
              </button>

              {/* Expanded Items */}
              {isExpanded && (
                <div style={{ padding: '0.5rem' }}>
                  {items.map((item, index) => (
                    <div
                      key={item.name || index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '4px',
                        background: index % 2 === 0 ? 'white' : '#fafafa',
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: config.color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#374151',
                        flex: 1,
                      }}>
                        {item.name}
                      </span>
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
