import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { getStatusColor, getStatusLabel } from '../diagnostic/StatusLegend';

export default function DonutChart({
  data,
  title,
  size = 160,
  showLegend = true,
  centerLabel = null
}) {
  // Convert { healthy: 5, careful: 3, ... } to array format for Recharts
  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([status, value]) => ({
      name: getStatusLabel(status),
      value,
      status,
      color: getStatusColor(status),
    }));

  const total = Object.values(data).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>No data</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {title && (
        <h4 style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          marginBottom: 'var(--space-2)',
          color: 'var(--text-primary)'
        }}>
          {title}
        </h4>
      )}
      <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
        <PieChart width={size} height={size}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.35}
            outerRadius={size * 0.45}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} items`, name]}
            contentStyle={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
            }}
          />
        </PieChart>
        {centerLabel !== false && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
              {centerLabel || total}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {centerLabel ? '' : 'items'}
            </div>
          </div>
        )}
      </div>
      {showLegend && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-2)',
          flexWrap: 'wrap',
          fontSize: 'var(--text-xs)'
        }}>
          {chartData.map((entry) => (
            <div key={entry.status} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: entry.color,
              }} />
              <span style={{ color: 'var(--text-secondary)' }}>{entry.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
