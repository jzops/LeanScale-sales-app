import { useState, useRef } from 'react';

/**
 * EditableList — Inline list editor for arrays of strings.
 *
 * Renders items as a bullet list with remove (×) buttons.
 * Add input + "Add" button at bottom.
 *
 * @param {string[]} items - Current list items
 * @param {function} onCommit - Called with updated array when items change
 * @param {boolean} readOnly - If true, renders static list only
 * @param {string} placeholder - Placeholder for add input
 * @param {function} formatItem - Optional formatter for display (e.g., for team objects)
 */
export default function EditableList({
  items = [],
  onCommit,
  readOnly = false,
  placeholder = 'Add item...',
  formatItem,
}) {
  const [newValue, setNewValue] = useState('');
  const inputRef = useRef(null);

  const displayItems = Array.isArray(items) ? items : [];

  function handleRemove(index) {
    const updated = displayItems.filter((_, i) => i !== index);
    onCommit?.(updated);
  }

  function handleAdd() {
    const trimmed = newValue.trim();
    if (!trimmed) return;
    const updated = [...displayItems, trimmed];
    onCommit?.(updated);
    setNewValue('');
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }

  const itemStyle = {
    fontSize: '0.875rem',
    color: '#4A5568',
    marginBottom: '0.35rem',
    lineHeight: 1.5,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '0.5rem',
  };

  const removeButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#A0AEC0',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0 0.25rem',
    lineHeight: 1,
    flexShrink: 0,
    transition: 'color 0.15s',
  };

  if (readOnly) {
    return (
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        {displayItems.map((item, idx) => (
          <li key={idx} style={{ fontSize: '0.875rem', color: '#4A5568', marginBottom: '0.35rem', lineHeight: 1.5 }}>
            {formatItem ? formatItem(item) : (typeof item === 'string' ? item : `${item.name}${item.role ? ` — ${item.role}` : ''}`)}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      <ul style={{ margin: 0, paddingLeft: '1.25rem', listStyle: 'disc' }}>
        {displayItems.map((item, idx) => (
          <li key={idx} style={itemStyle}>
            <span style={{ flex: 1 }}>
              {formatItem ? formatItem(item) : (typeof item === 'string' ? item : `${item.name}${item.role ? ` — ${item.role}` : ''}`)}
            </span>
            <button
              onClick={() => handleRemove(idx)}
              style={removeButtonStyle}
              title="Remove item"
              onMouseEnter={(e) => e.target.style.color = '#E53E3E'}
              onMouseLeave={(e) => e.target.style.color = '#A0AEC0'}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <input
          ref={inputRef}
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '0.375rem 0.625rem',
            fontSize: '0.875rem',
            border: '1px solid #E2E8F0',
            borderRadius: '0.375rem',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => e.target.style.borderColor = '#6C5CE7'}
          onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
        />
        <button
          onClick={handleAdd}
          disabled={!newValue.trim()}
          style={{
            padding: '0.375rem 0.75rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            background: newValue.trim() ? '#6C5CE7' : '#E2E8F0',
            color: newValue.trim() ? 'white' : '#A0AEC0',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: newValue.trim() ? 'pointer' : 'default',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
