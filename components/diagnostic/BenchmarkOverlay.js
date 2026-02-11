import { useState, useMemo } from 'react';
import { StatusDot, StatusBadge, getStatusColor } from './StatusLegend';
import { benchmarkPresets, compareToBenchmark, STATUS_VALUES } from '../../data/benchmark-data';
import { groupBy } from '../../data/diagnostic-registry';

/**
 * GapIndicator — color-coded gap between current and benchmark
 */
function GapIndicator({ gap }) {
  if (gap > 0) {
    return (
      <span style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-semibold)',
        color: '#16a34a',
        background: '#dcfce7',
        padding: '0.1rem var(--space-2)',
        borderRadius: 'var(--radius-sm)',
      }}>
        ▲ Above
      </span>
    );
  }
  if (gap < 0) {
    return (
      <span style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-semibold)',
        color: '#dc2626',
        background: '#fef2f2',
        padding: '0.1rem var(--space-2)',
        borderRadius: 'var(--radius-sm)',
      }}>
        ▼ Below
      </span>
    );
  }
  return (
    <span style={{
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--font-semibold)',
      color: '#6b7280',
      background: '#f3f4f6',
      padding: '0.1rem var(--space-2)',
      borderRadius: 'var(--radius-sm)',
    }}>
      = At benchmark
    </span>
  );
}

/**
 * BenchmarkOverlay — shows how a prospect compares to industry benchmarks
 */
export default function BenchmarkOverlay({ processes, selectedPreset, onPresetChange }) {
  const [filterGap, setFilterGap] = useState('all'); // 'all' | 'below' | 'above' | 'at'
  const [groupByFunction, setGroupByFunction] = useState(false);

  const preset = benchmarkPresets[selectedPreset];
  const comparison = useMemo(
    () => compareToBenchmark(processes, selectedPreset),
    [processes, selectedPreset]
  );

  const filtered = useMemo(() => {
    if (filterGap === 'all') return comparison;
    if (filterGap === 'below') return comparison.filter(c => c.belowBenchmark);
    if (filterGap === 'above') return comparison.filter(c => c.aboveBenchmark);
    if (filterGap === 'at') return comparison.filter(c => c.atBenchmark);
    return comparison;
  }, [comparison, filterGap]);

  const belowCount = comparison.filter(c => c.belowBenchmark).length;
  const aboveCount = comparison.filter(c => c.aboveBenchmark).length;
  const atCount = comparison.filter(c => c.atBenchmark).length;

  // Group by function for summary
  const byFunction = useMemo(() => {
    const groups = {};
    for (const item of comparison) {
      const fn = item.function || 'Other';
      if (!groups[fn]) groups[fn] = { below: 0, above: 0, at: 0, total: 0 };
      groups[fn].total++;
      if (item.belowBenchmark) groups[fn].below++;
      else if (item.aboveBenchmark) groups[fn].above++;
      else groups[fn].at++;
    }
    return groups;
  }, [comparison]);

  return (
    <div>
      {/* Summary Banner */}
      <div style={{
        background: belowCount > comparison.length / 2
          ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)'
          : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        marginBottom: 'var(--space-6)',
        color: 'white',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', margin: 0, marginBottom: 'var(--space-2)' }}>
              Benchmark Comparison: {preset?.label || selectedPreset}
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', opacity: 0.8, margin: 0, marginBottom: 'var(--space-3)' }}>
              {preset?.description}
            </p>
            <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', margin: 0 }}>
              {belowCount > 0
                ? `You're performing below benchmark in ${belowCount} of ${comparison.length} processes`
                : `You're at or above benchmark across all ${comparison.length} processes`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{ padding: 'var(--space-3)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', minWidth: 70 }}>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#f87171' }}>{belowCount}</div>
              <div style={{ fontSize: 'var(--text-2xs)', opacity: 0.8 }}>Below</div>
            </div>
            <div style={{ padding: 'var(--space-3)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', minWidth: 70 }}>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#d1d5db' }}>{atCount}</div>
              <div style={{ fontSize: 'var(--text-2xs)', opacity: 0.8 }}>At</div>
            </div>
            <div style={{ padding: 'var(--space-3)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', minWidth: 70 }}>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#4ade80' }}>{aboveCount}</div>
              <div style={{ fontSize: 'var(--text-2xs)', opacity: 0.8 }}>Above</div>
            </div>
          </div>
        </div>
      </div>

      {/* Function Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)',
      }}>
        {Object.entries(byFunction).map(([fn, stats]) => (
          <div key={fn} style={{
            background: 'var(--bg-white)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
          }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>{fn}</div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
              {stats.below > 0 && <span style={{ color: '#dc2626' }}>▼ {stats.below}</span>}
              {stats.at > 0 && <span style={{ color: '#6b7280' }}>= {stats.at}</span>}
              {stats.above > 0 && <span style={{ color: '#16a34a' }}>▲ {stats.above}</span>}
            </div>
            {/* Mini bar */}
            <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 'var(--space-2)' }}>
              {stats.above > 0 && <div style={{ flex: stats.above, background: '#4ade80' }} />}
              {stats.at > 0 && <div style={{ flex: stats.at, background: '#d1d5db' }} />}
              {stats.below > 0 && <div style={{ flex: stats.below, background: '#f87171' }} />}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Controls */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: `All (${comparison.length})` },
          { id: 'below', label: `Below (${belowCount})` },
          { id: 'at', label: `At Benchmark (${atCount})` },
          { id: 'above', label: `Above (${aboveCount})` },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilterGap(f.id)}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              background: filterGap === f.id ? 'var(--ls-purple)' : 'var(--bg-subtle)',
              color: filterGap === f.id ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="diagnostic-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Process</th>
              <th style={{ textAlign: 'center' }}>Your Status</th>
              <th style={{ textAlign: 'center' }}>Benchmark</th>
              <th style={{ textAlign: 'center' }}>Gap</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.name} style={{
                background: item.belowBenchmark ? '#fef2f2' : item.aboveBenchmark ? '#f0fdf4' : undefined,
              }}>
                <td>
                  <div style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)' }}>{item.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{item.function}</div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <StatusBadge status={item.currentStatus} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <StatusBadge status={item.benchmarkStatus} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <GapIndicator gap={item.gap} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
