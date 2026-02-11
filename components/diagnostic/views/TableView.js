import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { StatusDot, StatusBadge } from '../StatusLegend';
import NoteDrawer from '../NoteDrawer';

const STATUS_CYCLE = ['healthy', 'careful', 'warning', 'unable'];

/**
 * Flat sortable table view — preserves the dense data table for power users.
 * Adds sortable column headers.
 */
export default function TableView({
  processes,
  editMode,
  onStatusChange,
  onPriorityToggle,
  notes,
  expandedRow,
  onRowExpand,
  onAddNote,
  onDeleteNote,
  categoryLabel = 'Function',
}) {
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const sorted = useMemo(() => {
    if (!sortField) return processes;
    return [...processes].sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'status') {
        aVal = STATUS_CYCLE.indexOf(aVal);
        bVal = STATUS_CYCLE.indexOf(bVal);
      }
      if (sortField === 'addToEngagement') {
        aVal = aVal ? 1 : 0;
        bVal = bVal ? 1 : 0;
      }
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [processes, sortField, sortDir]);

  function handleSort(field) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function renderSortIcon(field) {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? ' \u25B2' : ' \u25BC';
  }

  return (
    <motion.div
      className="card"
      style={{ padding: 'var(--space-4)' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="diagnostic-table">
        <table className="data-table">
          <thead>
            <tr>
              <th
                onClick={() => handleSort('name')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Name{renderSortIcon('name')}
              </th>
              <th
                onClick={() => handleSort('function')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                {categoryLabel}{renderSortIcon('function')}
              </th>
              <th
                onClick={() => handleSort('status')}
                style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'center' }}
              >
                Status{renderSortIcon('status')}
              </th>
              <th
                onClick={() => handleSort('addToEngagement')}
                style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'center' }}
              >
                Priority{renderSortIcon('addToEngagement')}
              </th>
              {editMode && <th style={{ textAlign: 'center', width: '60px' }}>Notes</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => {
              const noteCount = notes.filter(n => n.process_name === item.name).length;

              return (
                <tr key={item.name}>
                  <td style={{ fontWeight: 'var(--font-medium)' }}>{item.name}</td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    {item.function || item.category || '-'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {editMode && onStatusChange ? (
                      <button
                        onClick={() => {
                          const idx = STATUS_CYCLE.indexOf(item.status);
                          const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
                          onStatusChange(item.name, next);
                        }}
                        style={{
                          background: 'none',
                          border: '1px dashed var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '2px 6px',
                          cursor: 'pointer',
                        }}
                        title="Click to cycle status"
                      >
                        <StatusBadge status={item.status} />
                      </button>
                    ) : (
                      <StatusBadge status={item.status} />
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {editMode && onPriorityToggle ? (
                      <button
                        onClick={() => onPriorityToggle(item.name)}
                        style={{
                          background: item.addToEngagement ? 'var(--ls-lime-green)' : 'var(--bg-subtle)',
                          color: item.addToEngagement ? 'var(--ls-purple)' : 'var(--text-secondary)',
                          border: '1px dashed var(--border-color)',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 'var(--font-semibold)',
                          fontSize: 'var(--text-xs)',
                          cursor: 'pointer',
                        }}
                      >
                        {item.addToEngagement ? 'Priority' : '-'}
                      </button>
                    ) : (
                      item.addToEngagement && (
                        <span style={{
                          fontSize: 'var(--text-xs)',
                          background: 'var(--ls-lime-green)',
                          color: 'var(--ls-purple)',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 'var(--font-semibold)',
                        }}>
                          Priority
                        </span>
                      )
                    )}
                  </td>
                  {editMode && (
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => onRowExpand?.(expandedRow === item.name ? null : item.name)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          color: noteCount > 0 ? 'var(--ls-purple)' : 'var(--text-muted)',
                          padding: '2px',
                        }}
                      >
                        {noteCount > 0 ? `\uD83D\uDCAC ${noteCount}` : '\uD83D\uDCAC'}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editMode && expandedRow && (
        <NoteDrawer
          processName={expandedRow}
          notes={notes}
          onAddNote={onAddNote}
          onDeleteNote={onDeleteNote}
        />
      )}
    </motion.div>
  );
}
