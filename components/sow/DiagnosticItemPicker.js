/**
 * DiagnosticItemPicker - Checklist of diagnostic process items
 *
 * Displays all process items from a diagnostic result with severity-based
 * pre-selection. Users can check/uncheck items to include in SOW sections.
 *
 * Props:
 *   processes      - Array of diagnostic process objects
 *   selectedItems  - Set or array of selected process names
 *   onSelectionChange(selectedNames) - Callback when selection changes
 *   assignedItems  - Object mapping process name → section title (shows where items are assigned)
 */

import { useState, useMemo } from 'react';
import { StatusBadge } from '../diagnostic/StatusLegend';

export default function DiagnosticItemPicker({
  processes = [],
  selectedItems = [],
  onSelectionChange,
  assignedItems = {},
}) {
  const [filter, setFilter] = useState('all'); // all | selected | unselected | warning | careful
  const [search, setSearch] = useState('');

  const selectedSet = useMemo(
    () => new Set(Array.isArray(selectedItems) ? selectedItems : []),
    [selectedItems]
  );

  const filteredProcesses = useMemo(() => {
    let items = processes;

    // Text filter
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.outcome?.toLowerCase().includes(q) ||
        p.function?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filter === 'selected') {
      items = items.filter(p => selectedSet.has(p.name));
    } else if (filter === 'unselected') {
      items = items.filter(p => !selectedSet.has(p.name));
    } else if (filter === 'warning') {
      items = items.filter(p => p.status === 'warning' || p.status === 'unable');
    } else if (filter === 'careful') {
      items = items.filter(p => p.status === 'careful');
    }

    return items;
  }, [processes, filter, search, selectedSet]);

  function toggleItem(name) {
    const next = new Set(selectedSet);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    onSelectionChange?.(Array.from(next));
  }

  function selectAll() {
    onSelectionChange?.(processes.map(p => p.name));
  }

  function selectRecommended() {
    const recommended = processes
      .filter(p => p.status === 'warning' || p.status === 'unable')
      .map(p => p.name);
    onSelectionChange?.(recommended);
  }

  function clearAll() {
    onSelectionChange?.([]);
  }

  // Summary stats
  const totalCount = processes.length;
  const selectedCount = selectedSet.size;
  const warningCount = processes.filter(p => p.status === 'warning' || p.status === 'unable').length;
  const carefulCount = processes.filter(p => p.status === 'careful').length;

  return (
    <div>
      {/* Header with counts */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ fontSize: '0.875rem', color: '#4A5568' }}>
          <strong>{selectedCount}</strong> of {totalCount} items selected
          {warningCount > 0 && (
            <span style={{ marginLeft: '0.75rem', color: '#E53E3E' }}>
              {warningCount} critical
            </span>
          )}
          {carefulCount > 0 && (
            <span style={{ marginLeft: '0.75rem', color: '#D69E2E' }}>
              {carefulCount} careful
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <QuickButton onClick={selectRecommended} label="Select Critical" />
          <QuickButton onClick={selectAll} label="Select All" />
          <QuickButton onClick={clearAll} label="Clear" />
        </div>
      </div>

      {/* Search + filter row */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
      }}>
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.5rem 0.75rem',
            border: '1px solid #E2E8F0',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
          }}
        />
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {['all', 'warning', 'careful', 'selected', 'unselected'].map(f => (
            <FilterChip
              key={f}
              label={f === 'all' ? 'All' : f === 'warning' ? 'Critical' : f.charAt(0).toUpperCase() + f.slice(1)}
              active={filter === f}
              onClick={() => setFilter(f)}
            />
          ))}
        </div>
      </div>

      {/* Items list */}
      <div style={{
        border: '1px solid #E2E8F0',
        borderRadius: '0.5rem',
        maxHeight: '400px',
        overflowY: 'auto',
      }}>
        {filteredProcesses.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#A0AEC0', fontSize: '0.875rem' }}>
            No items match your filter
          </div>
        ) : (
          filteredProcesses.map((process, idx) => {
            const isSelected = selectedSet.has(process.name);
            const assignedTo = assignedItems[process.name];

            return (
              <div
                key={process.name || idx}
                onClick={() => toggleItem(process.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 1rem',
                  borderBottom: idx < filteredProcesses.length - 1 ? '1px solid #EDF2F7' : 'none',
                  cursor: 'pointer',
                  background: isSelected
                    ? '#F0FFF4'
                    : (!isSelected && process.status === 'careful')
                      ? '#FFFDF5'
                      : 'white',
                  borderLeft: (!isSelected && process.status === 'careful')
                    ? '3px solid #ECC94B'
                    : '3px solid transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = process.status === 'careful' ? '#FFF9DB' : '#F7FAFC';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = process.status === 'careful' ? '#FFFDF5' : 'white';
                }}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}} // handled by parent div onClick
                  style={{ width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }}
                />

                {/* Status badge */}
                <StatusBadge status={process.status} />

                {/* Name + details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#1a1a2e',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {process.name}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#718096',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {[process.function, process.category, process.outcome].filter(Boolean).join(' · ')}
                  </div>
                </div>

                {/* Suggested indicator for careful items */}
                {!isSelected && !assignedTo && process.status === 'careful' && (
                  <span style={{
                    fontSize: '0.65rem',
                    color: '#B7791F',
                    background: '#FEFCBF',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    fontWeight: 500,
                  }}>
                    Suggested
                  </span>
                )}

                {/* Assigned indicator */}
                {assignedTo && (
                  <span style={{
                    fontSize: '0.7rem',
                    color: '#6C5CE7',
                    background: '#EDE9FE',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {assignedTo}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function QuickButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.35rem 0.75rem',
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        fontWeight: 500,
        color: '#4A5568',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.35rem 0.75rem',
        background: active ? '#6C5CE7' : 'white',
        color: active ? 'white' : '#4A5568',
        border: `1px solid ${active ? '#6C5CE7' : '#E2E8F0'}`,
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
