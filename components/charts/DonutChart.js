import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const STATUS_COLORS = {
  healthy: '#22c55e',
  careful: '#eab308',
  warning: '#ef4444',
  unable: '#1f2937',
};

const STATUS_LABELS = {
  healthy: 'Healthy',
  careful: 'Careful',
  warning: 'Warning',
  unable: 'Unable',
};

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
      name: STATUS_LABELS[status],
      value,
      status,
      color: STATUS_COLORS[status],
    }));

  const total = Object.values(data).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No data</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {title && (
        <h4 style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '0.5rem',
          color: '#374151'
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
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '0.8rem',
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
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
              {centerLabel || total}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
              {centerLabel ? '' : 'items'}
            </div>
          </div>
        )}
      </div>
      {showLegend && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
          marginTop: '0.5rem',
          flexWrap: 'wrap',
          fontSize: '0.75rem'
        }}>
          {chartData.map((entry) => (
            <div key={entry.status} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: entry.color,
              }} />
              <span style={{ color: '#4b5563' }}>{entry.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
