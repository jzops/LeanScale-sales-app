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
                gap: '0.5rem',
                padding: '0.4rem 0',
                borderBottom: '1px solid #F7FAFC',
                cursor: 'grab',
              }}
            >
              <span style={{ color: '#A0AEC0', fontSize: '0.75rem', marginTop: '0.15rem', flexShrink: 0 }}>
                ⠿
              </span>
              <span style={{ color: '#6C5CE7', fontSize: '0.8rem', marginTop: '0.1rem', flexShrink: 0 }}>•</span>
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
                    borderRadius: '0.25rem',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              ) : (
                <span
                  onClick={() => handleEditStart(index)}
                  style={{
                    flex: 1,
                    fontSize: '0.85rem',
                    color: '#4A5568',
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
                  color: '#CBD5E0',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
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

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '0.4rem 0.75rem',
            border: '1px solid #E2E8F0',
            borderRadius: '0.375rem',
            fontSize: '0.85rem',
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!newText.trim()}
          style={{
            padding: '0.4rem 0.75rem',
            background: newText.trim() ? '#6C5CE7' : '#E2E8F0',
            color: newText.trim() ? 'white' : '#A0AEC0',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.8rem',
            fontWeight: 500,
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
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      marginTop: '1.5rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a2e' }}>
          Assumptions & Acceptance Criteria
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {saving && (
            <span style={{ fontSize: '0.75rem', color: '#A0AEC0' }}>Saving...</span>
          )}
          {saved && (
            <span style={{ fontSize: '0.75rem', color: '#38A169' }}>✓ Saved</span>
          )}
          <button
            onClick={handleResetDefaults}
            style={{
              padding: '0.3rem 0.75rem',
              background: '#EDF2F7',
              color: '#4A5568',
              border: '1px solid #E2E8F0',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Assumptions */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h4 style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#4A5568',
          marginBottom: '0.5rem',
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
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#4A5568',
          marginBottom: '0.5rem',
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
