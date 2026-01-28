import DonutChart from '../charts/DonutChart';

export default function SummaryCard({ title, icon, data, onClick, isActive = false }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        border: isActive ? '2px solid var(--ls-purple, #7c3aed)' : '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.25rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={(e) => {
        if (onClick && !isActive) {
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && !isActive) {
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
        }
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
      }}>
        {icon && <span style={{ fontSize: '1.25rem' }}>{icon}</span>}
        <h3 style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          color: '#1f2937',
          margin: 0,
        }}>
          {title}
        </h3>
      </div>

      <DonutChart data={data} size={120} showLegend={true} />

      <div style={{
        marginTop: '0.75rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#6b7280',
      }}>
        {total} inspection {total === 1 ? 'point' : 'points'}
      </div>
    </div>
  );
}
