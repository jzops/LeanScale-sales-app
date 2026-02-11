import DonutChart from '../charts/DonutChart';

export default function SummaryCard({ title, icon, data, onClick, isActive = false }) {
  // Exclude N/A from the total count for percentage calculations
  const naCount = data.na || 0;
  const total = Object.values(data).reduce((a, b) => a + b, 0) - naCount;

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-white)',
        border: isActive ? '2px solid var(--ls-purple-light)' : '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-5)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--transition-base)',
        boxShadow: isActive ? 'var(--shadow-purple)' : 'var(--shadow-sm)',
      }}
      onMouseEnter={(e) => {
        if (onClick && !isActive) {
          e.currentTarget.style.borderColor = 'var(--gray-300)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && !isActive) {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-3)',
      }}>
        {icon && <span style={{ fontSize: 'var(--text-xl)' }}>{icon}</span>}
        <h3 style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          {title}
        </h3>
      </div>

      <DonutChart data={data} size={120} showLegend={true} />

      <div style={{
        marginTop: 'var(--space-3)',
        textAlign: 'center',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-secondary)',
      }}>
        {total} inspection {total === 1 ? 'point' : 'points'}
      </div>
    </div>
  );
}
