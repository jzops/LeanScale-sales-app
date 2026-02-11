import { useState, useEffect, useRef, useCallback } from 'react';
import StatusPicker from './StatusPicker';
import { StatusBadge } from './StatusLegend';

const RECOMMENDED_ACTIONS = ['Implement', 'Optimize', 'Replace', 'Train', 'Defer'];
const DEFAULT_HOURS = 40;
// Note: Pricing is retainer-based (tier model), not rate × hours. Rate field kept for reference only.

function StarRating({ value, onChange, readOnly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange(star === value ? null : star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: readOnly ? 'default' : 'pointer',
            fontSize: 'var(--text-lg)',
            color: (hover || value || 0) >= star ? '#f59e0b' : 'var(--gray-300)',
            padding: '0',
            lineHeight: 1,
            transition: 'color 0.1s',
          }}
          title={`Impact: ${star}/5`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function CompactStars({ value }) {
  if (!value) return <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>—</span>;
  return (
    <span style={{ fontSize: 'var(--text-xs)', color: '#f59e0b', letterSpacing: '-1px' }}>
      {'★'.repeat(value)}
      <span style={{ color: 'var(--gray-300)' }}>{'★'.repeat(5 - value)}</span>
    </span>
  );
}

export default function ItemDetailEditor({
  item,
  editMode = false,
  readOnly = false,
  onFieldChange,
  onStatusChange,
  onPriorityToggle,
  notes = [],
  onAddNote,
  onDeleteNote,
  showFunction = false,
  functionLabel = 'Function',
  serviceCatalogEntry = null,
  expanded = false,
  onToggleExpand,
}) {
  const [localNotes, setLocalNotes] = useState('');
  const [newNote, setNewNote] = useState('');
  const debounceRef = useRef({});

  const debouncedChange = useCallback((field, value) => {
    if (debounceRef.current[field]) clearTimeout(debounceRef.current[field]);
    debounceRef.current[field] = setTimeout(() => {
      onFieldChange?.(item.name, field, value);
    }, 600);
  }, [item.name, onFieldChange]);

  const handleNumberChange = (field, value, fallback) => {
    const num = value === '' ? null : Number(value);
    debouncedChange(field, num);
  };

  const handleImmediateChange = (field, value) => {
    onFieldChange?.(item.name, field, value);
  };

  const itemNotes = notes.filter(n => n.process_name === item.name);
  const hours = item.hoursOverride ?? DEFAULT_HOURS;
  // Pricing is retainer-based; no per-item rate calculation

  // Compact row
  return (
    <div style={{ borderBottom: '1px solid var(--border-color)' }}>
      {/* Compact row */}
      <div
        onClick={() => (editMode || readOnly) && onToggleExpand?.()}
        style={{
          display: 'grid',
          gridTemplateColumns: showFunction
            ? 'minmax(180px, 2fr) minmax(80px, 1fr) 90px 70px 60px 90px'
            : 'minmax(200px, 2fr) 90px 70px 60px 90px',
          alignItems: 'center',
          padding: 'var(--space-3) var(--space-4)',
          cursor: (editMode || readOnly) ? 'pointer' : 'default',
          background: expanded ? 'var(--bg-subtle)' : 'transparent',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { if (editMode || readOnly) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
        onMouseLeave={(e) => { if (!expanded) e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {(editMode || readOnly) && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
          )}
          {item.name}
          {itemNotes.length > 0 && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ls-purple)', fontWeight: 'var(--font-semibold)' }}>💬{itemNotes.length}</span>
          )}
        </div>
        {showFunction && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            {item.function || item.category || '-'}
          </div>
        )}
        <div style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
          {editMode && onStatusChange ? (
            <StatusPicker
              currentStatus={item.status}
              onChange={(newStatus) => onStatusChange(item.name, newStatus)}
            />
          ) : (
            <StatusBadge status={item.status} />
          )}
        </div>
        <div style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
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
              {item.addToEngagement ? '✓' : '-'}
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
              }}>✓</span>
            )
          )}
        </div>
        <div style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          {hours}h
        </div>
        <div style={{ textAlign: 'center' }}>
          <CompactStars value={item.impactRating} />
        </div>
      </div>

      {/* Expanded detail editor */}
      {expanded && (editMode || readOnly) && (
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          background: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border-color)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          {/* Hours Override */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>
              Estimated Hours
            </label>
            {editMode ? (
              <input
                type="number"
                min="0"
                step="1"
                defaultValue={item.hoursOverride ?? DEFAULT_HOURS}
                onChange={(e) => handleNumberChange('hoursOverride', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-2)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-sm)',
                }}
              />
            ) : (
              <div style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) 0' }}>{hours}h</div>
            )}
          </div>

          {/* Pricing Note — retainer model, no per-item rate */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>
              Pricing
            </label>
            <div style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) 0', color: 'var(--text-muted)' }}>
              Retainer-based
            </div>
          </div>

          {/* Impact Rating */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>
              Impact Rating
            </label>
            <div style={{ padding: 'var(--space-1) 0' }}>
              <StarRating
                value={item.impactRating || 0}
                onChange={(val) => handleImmediateChange('impactRating', val)}
                readOnly={!editMode}
              />
            </div>
          </div>

          {/* Recommended Action */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>
              Recommended Action
            </label>
            {editMode ? (
              <select
                value={item.recommendedAction || ''}
                onChange={(e) => handleImmediateChange('recommendedAction', e.target.value || null)}
                style={{
                  width: '100%',
                  padding: 'var(--space-2)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-sm)',
                  background: 'white',
                }}
              >
                <option value="">— Select —</option>
                {RECOMMENDED_ACTIONS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            ) : (
              <div style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) 0' }}>
                {item.recommendedAction || '—'}
              </div>
            )}
          </div>

          {/* Linked Service */}
          {(item.serviceId || serviceCatalogEntry) && (
            <div>
              <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>
                Linked Service
              </label>
              <div style={{
                fontSize: 'var(--text-sm)',
                padding: 'var(--space-2) 0',
                color: 'var(--ls-purple)',
              }}>
                {serviceCatalogEntry ? (
                  <span title={serviceCatalogEntry.description}>
                    {serviceCatalogEntry.icon} {serviceCatalogEntry.name}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>{item.serviceId}</span>
                )}
              </div>
            </div>
          )}

          {/* Hours Summary */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>
              Est. Hours
            </label>
            <div style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--ls-purple)',
              padding: 'var(--space-2) 0',
            }}>
              {hours}h
            </div>
          </div>

          {/* Notes — full width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>
              Notes ({itemNotes.length})
            </label>
            {itemNotes.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                {itemNotes.map((note) => (
                  <div key={note.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'white',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: 'var(--text-sm)',
                  }}>
                    <div>
                      <div style={{ color: 'var(--text-primary)' }}>{note.note}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {note.author} · {new Date(note.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {editMode && onDeleteNote && (
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', padding: '2px' }}
                        title="Delete note"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {editMode && onAddNote && (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newNote.trim()) {
                      onAddNote({ processName: item.name, note: newNote.trim() });
                      setNewNote('');
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: 'var(--space-2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-sm)',
                  }}
                />
                <button
                  onClick={() => {
                    if (newNote.trim()) {
                      onAddNote({ processName: item.name, note: newNote.trim() });
                      setNewNote('');
                    }
                  }}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--ls-purple)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    cursor: 'pointer',
                    fontWeight: 'var(--font-semibold)',
                  }}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
