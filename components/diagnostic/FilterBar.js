import { useState } from 'react';

const STATUS_OPTIONS = ['all', 'healthy', 'careful', 'warning', 'unable', 'na'];

export default function FilterBar({ categories, outcomes, filters, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)', alignItems: 'center' }}>
      <input
        type="text"
        placeholder="Search processes..."
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        style={{
          flex: '1 1 200px',
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--text-sm)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
        }}
      />
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        style={{ padding: '0.4rem', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
      >
        <option value="all">All Statuses</option>
        {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
          <option key={s} value={s}>
            {s === 'na' ? 'N/A' : s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
      <select
        value={filters.function}
        onChange={(e) => onChange({ ...filters, function: e.target.value })}
        style={{ padding: '0.4rem', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
      >
        <option value="all">All Functions</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select
        value={filters.outcome}
        onChange={(e) => onChange({ ...filters, outcome: e.target.value })}
        style={{ padding: '0.4rem', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
      >
        <option value="all">All Outcomes</option>
        {outcomes.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-sm)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
        <input
          type="checkbox"
          checked={filters.priorityOnly}
          onChange={(e) => onChange({ ...filters, priorityOnly: e.target.checked })}
        />
        Priority only
      </label>
    </div>
  );
}
