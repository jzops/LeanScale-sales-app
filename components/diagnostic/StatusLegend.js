// Status configuration using CSS variable references
// Colors are applied via getComputedStyle or inline var() references
const STATUS_CONFIG = {
  healthy: { cssVar: '--status-healthy', label: 'Healthy' },
  careful: { cssVar: '--status-careful', label: 'Careful' },
  warning: { cssVar: '--status-warning', label: 'Warning' },
  unable: { cssVar: '--status-unable', label: 'Unable' },
};

// For JavaScript contexts that need the actual color values
export function getStatusColor(status) {
  const varName = STATUS_CONFIG[status]?.cssVar || '--gray-400';
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }
  // Fallback colors for SSR
  const fallbacks = {
    healthy: '#22c55e',
    careful: '#eab308',
    warning: '#ef4444',
    unable: '#1f2937',
  };
  return fallbacks[status] || '#9ca3af';
}

export function StatusDot({ status, size = 12 }) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: config ? `var(${config.cssVar})` : 'var(--gray-400)',
        flexShrink: 0,
      }}
      title={config?.label || 'Unknown'}
    />
  );
}

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status];
  const isLight = status === 'careful';

  return (
    <span
      style={{
        display: 'inline-block',
        padding: 'var(--space-1) var(--space-3)',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-medium)',
        backgroundColor: config ? `var(${config.cssVar})` : 'var(--gray-400)',
        color: isLight ? 'var(--gray-800)' : 'white',
      }}
    >
      {config?.label || 'Unknown'}
    </span>
  );
}

export default function StatusLegend({ compact = false }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: compact ? 'var(--space-4)' : 'var(--space-6)',
      fontSize: compact ? 'var(--text-xs)' : 'var(--text-sm)',
      flexWrap: 'wrap',
    }}>
      {Object.entries(STATUS_CONFIG).map(([status, { label }]) => (
        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <StatusDot status={status} size={compact ? 10 : 12} />
          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export { STATUS_CONFIG };

// Helper to get status label
export function getStatusLabel(status) {
  return STATUS_CONFIG[status]?.label || 'Unknown';
}
