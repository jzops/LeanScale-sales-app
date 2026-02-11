/**
 * SectionEditor - Individual SOW section editor
 *
 * Editable card for a single SOW section with title, description,
 * hours, rate, dates, deliverables, and linked diagnostic items.
 *
 * Props:
 *   section          - The section object from the API
 *   onUpdate(updates) - Callback to save section changes
 *   onDelete()       - Callback to remove this section
 *   onDragStart/End  - Drag handles for reordering
 *   diagnosticItems  - Object mapping process name → process data (for display)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { StatusBadge } from '../diagnostic/StatusLegend';

export default function SectionEditor({
  section,
  onUpdate,
  onDelete,
  diagnosticItems = {},
}) {
  const [expanded, setExpanded] = useState(true);
  const [title, setTitle] = useState(section.title || '');
  const [description, setDescription] = useState(section.description || '');
  const [hours, setHours] = useState(section.hours || '');
  const [rate, setRate] = useState(section.rate || '');
  const [startDate, setStartDate] = useState(section.start_date || '');
  const [endDate, setEndDate] = useState(section.end_date || '');
  const [deliverables, setDeliverables] = useState(section.deliverables || []);
  const [newDeliverable, setNewDeliverable] = useState('');

  // Debounced auto-save
  const saveTimeoutRef = useRef(null);

  const debouncedSave = useCallback((updates) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      onUpdate?.(updates);
    }, 800);
  }, [onUpdate]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  function handleFieldChange(field, value) {
    const updates = {};

    switch (field) {
      case 'title':
        setTitle(value);
        updates.title = value;
        break;
      case 'description':
        setDescription(value);
        updates.description = value;
        break;
      case 'hours':
        setHours(value);
        updates.hours = value ? parseFloat(value) : null;
        break;
      case 'rate':
        setRate(value);
        updates.rate = value ? parseFloat(value) : null;
        break;
      case 'startDate':
        setStartDate(value);
        updates.startDate = value || null;
        break;
      case 'endDate':
        setEndDate(value);
        updates.endDate = value || null;
        break;
      default:
        break;
    }

    debouncedSave(updates);
  }

  function addDeliverable() {
    if (!newDeliverable.trim()) return;
    const updated = [...deliverables, newDeliverable.trim()];
    setDeliverables(updated);
    setNewDeliverable('');
    onUpdate?.({ deliverables: updated });
  }

  function removeDeliverable(idx) {
    const updated = deliverables.filter((_, i) => i !== idx);
    setDeliverables(updated);
    onUpdate?.({ deliverables: updated });
  }

  // Calculate subtotal
  const subtotal = (parseFloat(hours) || 0) * (parseFloat(rate) || 0);

  // Linked diagnostic items
  const linkedItems = section.diagnostic_items || [];

  return (
    <div style={{
      border: '1px solid #E2E8F0',
      borderRadius: '0.75rem',
      background: 'white',
      overflow: 'hidden',
    }}>
      {/* Section header - always visible */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: '#F7FAFC',
          cursor: 'pointer',
          borderBottom: expanded ? '1px solid #E2E8F0' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          {/* Drag handle */}
          <span style={{ color: '#CBD5E0', cursor: 'grab', fontSize: '1.2rem' }}>
            &#x2630;
          </span>

          {/* Title (inline edit or display) */}
          <span style={{
            fontWeight: 600,
            fontSize: '1rem',
            color: '#1a1a2e',
          }}>
            {title || 'Untitled Section'}
          </span>

          {/* Summary badges */}
          {hours && (
            <span style={{ fontSize: '0.75rem', color: '#718096', background: '#EDF2F7', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
              {hours}h
            </span>
          )}
          {subtotal > 0 && (
            <span style={{ fontSize: '0.75rem', color: '#276749', background: '#C6F6D5', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
              ${subtotal.toLocaleString()}
            </span>
          )}
          {linkedItems.length > 0 && (
            <span style={{ fontSize: '0.75rem', color: '#6C5CE7', background: '#EDE9FE', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
              {linkedItems.length} diagnostic items
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#E53E3E',
              cursor: 'pointer',
              fontSize: '0.8rem',
              padding: '0.25rem 0.5rem',
            }}
          >
            Remove
          </button>
          <span style={{ color: '#A0AEC0', fontSize: '1.2rem' }}>
            {expanded ? '▾' : '▸'}
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '1.25rem' }}>
          {/* Title field */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Section Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="e.g., GTM Optimization Package"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Describe the scope and goals of this section..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Hours + Rate row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Hours</label>
              <input
                type="number"
                value={hours}
                onChange={(e) => handleFieldChange('hours', e.target.value)}
                placeholder="0"
                min="0"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Rate ($/hr)</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => handleFieldChange('rate', e.target.value)}
                placeholder="0"
                min="0"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Subtotal</label>
              <div style={{
                padding: '0.5rem 0.75rem',
                background: '#F7FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#276749',
              }}>
                ${subtotal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Date range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleFieldChange('startDate', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleFieldChange('endDate', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Deliverables */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Deliverables</label>
            {deliverables.map((d, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0',
              }}>
                <span style={{ fontSize: '0.875rem', color: '#4A5568', flex: 1 }}>
                  • {d}
                </span>
                <button
                  onClick={() => removeDeliverable(idx)}
                  style={{ background: 'none', border: 'none', color: '#E53E3E', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  ✕
                </button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="text"
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addDeliverable(); }}
                placeholder="Add a deliverable..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={addDeliverable}
                disabled={!newDeliverable.trim()}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: '#6C5CE7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  opacity: newDeliverable.trim() ? 1 : 0.5,
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Linked diagnostic items */}
          {linkedItems.length > 0 && (
            <div>
              <label style={labelStyle}>Linked Diagnostic Items</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {linkedItems.map((itemName, idx) => {
                  const itemData = diagnosticItems[itemName];
                  return (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.25rem 0.625rem',
                      background: '#F7FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                    }}>
                      {itemData && <StatusBadge status={itemData.status} />}
                      <span style={{ color: '#4A5568' }}>{itemName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Shared styles
const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#718096',
  marginBottom: '0.25rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1px solid #E2E8F0',
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  color: '#1a1a2e',
  boxSizing: 'border-box',
};
