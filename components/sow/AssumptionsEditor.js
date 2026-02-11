/**
 * AssumptionsEditor - Bullet-list editor for SOW assumptions and acceptance criteria
 *
 * Features:
 *   - Add/remove/reorder items
 *   - Pre-populated with standard template
 *   - Separate sections for "Assumptions" and "Acceptance Criteria"
 *   - Debounced auto-save
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_ASSUMPTIONS = [
  'Client will provide a dedicated point of contact for the duration of the engagement.',
  'Client will provide timely access to required systems, tools, and data.',
  'All work will be performed remotely unless otherwise specified.',
  'Project timeline assumes prompt feedback and approvals (within 2 business days).',
  'Any change in scope will be documented and may impact timeline and investment.',
  'LeanScale will use industry best practices and standard methodologies.',
];

const DEFAULT_ACCEPTANCE_CRITERIA = [
  'All deliverables reviewed and approved by client stakeholders.',
  'Documented processes and configurations provided upon completion.',
  'Knowledge transfer session conducted with client team.',
  'Final sign-off within 5 business days of deliverable submission.',
];

function BulletListEditor({ items, onChange, placeholder = 'Add item...' }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState('');
  const [newText, setNewText] = useState('');
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  function handleAdd() {
    const trimmed = newText.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setNewText('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }

  function handleRemove(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  function handleEditStart(index) {
    setEditingIndex(index);
    setEditText(items[index]);
  }

  function handleEditSave(index) {
    const trimmed = editText.trim();
    if (!trimmed) {
      handleRemove(index);
    } else {
      const updated = [...items];
      updated[index] = trimmed;
      onChange(updated);
    }
    setEditingIndex(null);
    setEditText('');
  }

  function handleEditKeyDown(e, index) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSave(index);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditText('');
    }
  }

  function handleDragStart(index) {
    dragItem.current = index;
  }

  function handleDragEnter(index) {
    dragOverItem.current = index;
  }

  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }
    const reordered = [...items];
    const [dragged] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, dragged);
    onChange(reordered);
    dragItem.current = null;
    dragOverItem.current = null;
  }

  return (
    <div>
      {items.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {items.map((item, index) => (
            <li
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-2)',
                padding: '0.4rem 0',
                borderBottom: '1px solid #F7FAFC',
                cursor: 'grab',
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: '0.15rem', flexShrink: 0 }}>
                ⠿
              </span>
              <span style={{ color: 'var(--ls-purple-light)', fontSize: 'var(--text-sm)', marginTop: '0.1rem', flexShrink: 0 }}>•</span>
              {editingIndex === index ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => handleEditSave(index)}
                  onKeyDown={(e) => handleEditKeyDown(e, index)}
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '0.25rem 0.5rem',
                    border: '1px solid #6C5CE7',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-sm)',
                    outline: 'none',
                  }}
                />
              ) : (
                <span
                  onClick={() => handleEditStart(index)}
                  style={{
                    flex: 1,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-primary)',
                    lineHeight: 1.5,
                    cursor: 'text',
                  }}
                >
                  {item}
                </span>
              )}
              <button
                onClick={() => handleRemove(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gray-300)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  padding: '0 0.25rem',
                  flexShrink: 0,
                }}
                title="Remove"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: 'var(--space-2) var(--space-3)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!newText.trim()}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            background: newText.trim() ? '#6C5CE7' : '#E2E8F0',
            color: newText.trim() ? 'white' : '#A0AEC0',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            cursor: newText.trim() ? 'pointer' : 'default',
          }}
        >
          + Add
        </button>
      </div>
    </div>
  );
}

export default function AssumptionsEditor({
  assumptions: initialAssumptions,
  acceptanceCriteria: initialCriteria,
  onSave,
  sowId,
}) {
  const [assumptions, setAssumptions] = useState(
    initialAssumptions?.length > 0 ? initialAssumptions : DEFAULT_ASSUMPTIONS
  );
  const [criteria, setCriteria] = useState(
    initialCriteria?.length > 0 ? initialCriteria : DEFAULT_ACCEPTANCE_CRITERIA
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef(null);

  // Sync from parent
  useEffect(() => {
    if (initialAssumptions?.length > 0) setAssumptions(initialAssumptions);
  }, [initialAssumptions]);

  useEffect(() => {
    if (initialCriteria?.length > 0) setCriteria(initialCriteria);
  }, [initialCriteria]);

  const persistSave = useCallback(async (newAssumptions, newCriteria) => {
    setSaving(true);
    setSaved(false);
    try {
      if (onSave) {
        await onSave(newAssumptions, newCriteria);
      } else if (sowId) {
        await fetch(`/api/sow/${sowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentPartial: {
              assumptions: newAssumptions,
              acceptance_criteria: newCriteria,
            },
          }),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save assumptions:', err);
    } finally {
      setSaving(false);
    }
  }, [onSave, sowId]);

  function debouncedSave(newAssumptions, newCriteria) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      persistSave(newAssumptions, newCriteria);
    }, 1500);
  }

  function handleAssumptionsChange(updated) {
    setAssumptions(updated);
    debouncedSave(updated, criteria);
  }

  function handleCriteriaChange(updated) {
    setCriteria(updated);
    debouncedSave(assumptions, updated);
  }

  function handleResetDefaults() {
    if (!confirm('Reset to default assumptions and acceptance criteria?')) return;
    setAssumptions(DEFAULT_ASSUMPTIONS);
    setCriteria(DEFAULT_ACCEPTANCE_CRITERIA);
    debouncedSave(DEFAULT_ASSUMPTIONS, DEFAULT_ACCEPTANCE_CRITERIA);
  }

  return (
    <div style={{
      background: 'var(--bg-white)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-5)',
      marginTop: 'var(--space-6)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-4)',
      }}>
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--gray-900)' }}>
          Assumptions & Acceptance Criteria
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          {saving && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Saving...</span>
          )}
          {saved && (
            <span style={{ fontSize: 'var(--text-xs)', color: '#38A169' }}>✓ Saved</span>
          )}
          <button
            onClick={handleResetDefaults}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              background: 'var(--gray-100)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              cursor: 'pointer',
            }}
          >
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Assumptions */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <h4 style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-2)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Assumptions
        </h4>
        <BulletListEditor
          items={assumptions}
          onChange={handleAssumptionsChange}
          placeholder="Add assumption..."
        />
      </div>

      {/* Acceptance Criteria */}
      <div>
        <h4 style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-2)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Acceptance Criteria
        </h4>
        <BulletListEditor
          items={criteria}
          onChange={handleCriteriaChange}
          placeholder="Add acceptance criterion..."
        />
      </div>
    </div>
  );
}
