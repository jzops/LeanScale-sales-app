const STATUS_CONFIG = {
  healthy: { color: '#22c55e', label: 'Healthy' },
  careful: { color: '#eab308', label: 'Careful' },
  warning: { color: '#ef4444', label: 'Warning' },
  unable: { color: '#1f2937', label: 'Unable' },
};

export function StatusDot({ status, size = 12 }) {
  const config = STATUS_CONFIG[status] || { color: '#ccc', label: 'Unknown' };
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: config.color,
        flexShrink: 0,
      }}
      title={config.label}
    />
  );
}

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { color: '#ccc', label: 'Unknown' };
  const isLight = status === 'careful';

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: config.color,
        color: isLight ? '#1f2937' : 'white',
      }}
    >
      {config.label}
    </span>
  );
}

export default function StatusLegend({ compact = false }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: compact ? '1rem' : '1.5rem',
      fontSize: compact ? '0.75rem' : '0.85rem',
      flexWrap: 'wrap',
    }}>
      {Object.entries(STATUS_CONFIG).map(([status, { color, label }]) => (
        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <StatusDot status={status} size={compact ? 10 : 12} />
          <span style={{ color: '#4b5563' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export { STATUS_CONFIG };
