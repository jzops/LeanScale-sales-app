import { useMemo } from 'react';
import { StatusDot, StatusBadge } from './StatusLegend';
import { STATUS_VALUES } from '../../data/benchmark-data';

/**
 * DiagnosticComparison — side-by-side comparison of two diagnostic snapshots
 *
 * Can compare:
 * - Current vs historical snapshot (re-assessment)
 * - Current vs benchmark preset
 */
export default function DiagnosticComparison({ currentProcesses, compareProcesses, currentLabel = 'Current', compareLabel = 'Previous' }) {
  const delta = useMemo(() => {
    const compareMap = {};
    for (const p of compareProcesses) {
      compareMap[p.name] = p;
    }

    const improved = [];
    const declined = [];
    const unchanged = [];

    for (const current of currentProcesses) {
      const prev = compareMap[current.name];
      if (!prev) {
        // New item, treat as unchanged
        unchanged.push({ name: current.name, function: current.function, current: current.status, previous: 'na', delta: 0 });
        continue;
      }

      const currentVal = STATUS_VALUES[current.status] || 0;
      const prevVal = STATUS_VALUES[prev.status] || 0;
      const diff = currentVal - prevVal;

      const entry = {
        name: current.name,
        function: current.function,
        current: current.status,
        previous: prev.status,
        delta: diff,
      };

      if (diff > 0) improved.push(entry);
      else if (diff < 0) declined.push(entry);
      else unchanged.push(entry);
    }

    return { improved, declined, unchanged };
  }, [currentProcesses, compareProcesses]);

  const { improved, declined, unchanged } = delta;

  return (
    <div>
      {/* Delta Summary Banner */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        flexWrap: 'wrap',
      }}>
        <div style={{
          flex: 1,
          minWidth: 150,
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: '#16a34a' }}>+{improved.length}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: '#15803d', fontWeight: 'var(--font-medium)' }}>Improved</div>
        </div>
        <div style={{
          flex: 1,
          minWidth: 150,
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: '#dc2626' }}>-{declined.length}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: '#b91c1c', fontWeight: 'var(--font-medium)' }}>Declined</div>
        </div>
        <div style={{
          flex: 1,
          minWidth: 150,
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: '#6b7280' }}>{unchanged.length}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: '#4b5563', fontWeight: 'var(--font-medium)' }}>Unchanged</div>
        </div>
      </div>

      {/* Improved Section */}
      {improved.length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h4 style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
            color: '#16a34a',
            marginBottom: 'var(--space-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}>
            ✅ Improved ({improved.length})
          </h4>
          <ComparisonTable items={improved} currentLabel={currentLabel} compareLabel={compareLabel} />
        </div>
      )}

      {/* Declined Section */}
      {declined.length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h4 style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
            color: '#dc2626',
            marginBottom: 'var(--space-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}>
            ⚠️ Declined ({declined.length})
          </h4>
          <ComparisonTable items={declined} currentLabel={currentLabel} compareLabel={compareLabel} />
        </div>
      )}

      {/* Unchanged Section (collapsed by default) */}
      {unchanged.length > 0 && (
        <details style={{ marginBottom: 'var(--space-6)' }}>
          <summary style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
            color: '#6b7280',
            cursor: 'pointer',
            marginBottom: 'var(--space-3)',
          }}>
            Unchanged ({unchanged.length}) — click to expand
          </summary>
          <ComparisonTable items={unchanged} currentLabel={currentLabel} compareLabel={compareLabel} />
        </details>
      )}
    </div>
  );
}

function ComparisonTable({ items, currentLabel, compareLabel }) {
  return (
    <div className="diagnostic-table">
      <table className="data-table">
        <thead>
          <tr>
            <th>Process</th>
            <th style={{ textAlign: 'center' }}>{compareLabel}</th>
            <th style={{ textAlign: 'center' }}>→</th>
            <th style={{ textAlign: 'center' }}>{currentLabel}</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.name}>
              <td>
                <div style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)' }}>{item.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{item.function}</div>
              </td>
              <td style={{ textAlign: 'center' }}>
                <StatusBadge status={item.previous} />
              </td>
              <td style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>→</td>
              <td style={{ textAlign: 'center' }}>
                <StatusBadge status={item.current} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
