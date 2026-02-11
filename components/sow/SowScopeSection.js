import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import EditableField from './EditableField';
import EditableTextArea from './EditableTextArea';
import EditableNumber from './EditableNumber';
import { fadeUpItem } from '../../lib/animations';

/**
 * SowScopeSection — Fully editable scope section (replaces ScopeCard).
 *
 * Always expanded in proposal format. Editable fields: title, description,
 * hours, rate, deliverables list.
 *
 * @param {object} section - Section data from API
 * @param {function} onSectionChange - Called with (sectionId, fieldName, newValue)
 * @param {boolean} readOnly - If true, no editing
 * @param {Array} diagnosticProcesses - Linked diagnostic process data
 * @param {object} diagnosticResult - For building diagnostic links
 * @param {string} customerSlug - For diagnostic link URL
 * @param {function} onDeleteSection - Called with sectionId when delete confirmed
 */
export default function SowScopeSection({
  section,
  onSectionChange,
  readOnly = false,
  diagnosticProcesses = [],
  diagnosticResult,
  customerSlug,
  onDeleteSection,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newDeliverable, setNewDeliverable] = useState('');

  const h = parseFloat(section.hours) || 0;
  const r = parseFloat(section.rate) || 0;
  const subtotal = h * r;
  const linkedItems = section.diagnostic_items || [];
  const deliverables = section.deliverables || [];

  function handleFieldChange(field, value) {
    onSectionChange?.(section.id, field, value);
  }

  function handleAddDeliverable() {
    if (!newDeliverable.trim()) return;
    const updated = [...deliverables, newDeliverable.trim()];
    handleFieldChange('deliverables', updated);
    setNewDeliverable('');
  }

  function handleRemoveDeliverable(idx) {
    const updated = deliverables.filter((_, i) => i !== idx);
    handleFieldChange('deliverables', updated);
  }

  function handleDeliverableKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDeliverable();
    }
  }

  // Build diagnostic link URL
  const diagType = diagnosticResult?.diagnostic_type;
  const diagUrl = diagType && customerSlug
    ? `/c/${customerSlug}/try-leanscale/${diagType === 'gtm' ? 'diagnostic' : `${diagType}-diagnostic`}`
    : diagType
      ? `/try-leanscale/${diagType === 'gtm' ? 'diagnostic' : `${diagType}-diagnostic`}`
      : null;

  return (
    <motion.div
      variants={fadeUpItem}
      layout
      style={{
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '0.75rem',
        overflow: 'hidden',
      }}
    >
      {/* Section header row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '1.25rem 1.5rem',
        gap: '1rem',
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          {/* Purple accent bar */}
          <div style={{
            width: 4,
            minHeight: 40,
            background: '#6C5CE7',
            borderRadius: '2px',
            flexShrink: 0,
            marginTop: '0.25rem',
          }} />

          <div style={{ flex: 1 }}>
            {/* Title */}
            <EditableField
              value={section.title}
              onCommit={(val) => handleFieldChange('title', val)}
              readOnly={readOnly}
              placeholder="Section title..."
              as="h3"
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#1a1a2e',
              }}
            />

            {/* Description */}
            <div style={{ marginTop: '0.5rem' }}>
              <EditableTextArea
                value={section.description || ''}
                onCommit={(val) => handleFieldChange('description', val)}
                readOnly={readOnly}
                placeholder="Add a description..."
                style={{
                  fontSize: '0.85rem',
                  color: '#718096',
                  lineHeight: 1.6,
                }}
                minRows={2}
              />
            </div>
          </div>
        </div>

        {/* Right side: hours, rate, subtotal */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Hours
            </div>
            <EditableNumber
              value={h}
              onCommit={(val) => handleFieldChange('hours', val)}
              readOnly={readOnly}
              format="hours"
              placeholder="-"
              style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6C5CE7' }}
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Rate
            </div>
            <EditableNumber
              value={r}
              onCommit={(val) => handleFieldChange('rate', val)}
              readOnly={readOnly}
              format="currency"
              placeholder="-"
              style={{ fontSize: '0.875rem', color: '#718096' }}
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Subtotal
            </div>
            <span style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#276749',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {subtotal > 0 ? `$${subtotal.toLocaleString()}` : '-'}
            </span>
          </div>

          {/* Delete button */}
          {!readOnly && onDeleteSection && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#E53E3E',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.25rem',
                opacity: 0.5,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; }}
              title="Delete section"
            >
              x
            </button>
          )}
        </div>
      </div>

      {/* Dates row */}
      {(section.start_date || section.end_date || !readOnly) && (
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          padding: '0 1.5rem 0.75rem 3.5rem',
          fontSize: '0.8rem',
          color: '#718096',
        }}>
          <div>
            <span style={{ color: '#A0AEC0', marginRight: '0.25rem' }}>Start:</span>
            {readOnly ? (
              section.start_date ? new Date(section.start_date).toLocaleDateString() : '-'
            ) : (
              <input
                type="date"
                value={section.start_date ? section.start_date.split('T')[0] : ''}
                onChange={(e) => handleFieldChange('start_date', e.target.value || null)}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.25rem',
                  padding: '0.15rem 0.4rem',
                  fontSize: '0.8rem',
                  color: '#4A5568',
                  background: 'white',
                }}
              />
            )}
          </div>
          <div>
            <span style={{ color: '#A0AEC0', marginRight: '0.25rem' }}>End:</span>
            {readOnly ? (
              section.end_date ? new Date(section.end_date).toLocaleDateString() : '-'
            ) : (
              <input
                type="date"
                value={section.end_date ? section.end_date.split('T')[0] : ''}
                onChange={(e) => handleFieldChange('end_date', e.target.value || null)}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.25rem',
                  padding: '0.15rem 0.4rem',
                  fontSize: '0.8rem',
                  color: '#4A5568',
                  background: 'white',
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Deliverables */}
      <div style={{ padding: '0 1.5rem 1rem 3.5rem' }}>
        <h4 style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#4A5568',
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Deliverables
        </h4>

        {deliverables.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {deliverables.map((d, idx) => (
              <li key={idx} style={{
                fontSize: '0.85rem',
                color: '#4A5568',
                marginBottom: '0.25rem',
                lineHeight: 1.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}>
                <span style={{ flex: 1 }}>{d}</span>
                {!readOnly && (
                  <button
                    onClick={() => handleRemoveDeliverable(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#E53E3E',
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      padding: '0 0.25rem',
                      opacity: 0.4,
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.4'; }}
                    title="Remove deliverable"
                  >
                    x
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : readOnly ? (
          <p style={{ fontSize: '0.8rem', color: '#A0AEC0', fontStyle: 'italic', margin: 0 }}>
            No deliverables defined
          </p>
        ) : null}

        {/* Add deliverable input */}
        {!readOnly && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="text"
              value={newDeliverable}
              onChange={(e) => setNewDeliverable(e.target.value)}
              onKeyDown={handleDeliverableKeyDown}
              placeholder="Add deliverable..."
              style={{
                flex: 1,
                padding: '0.35rem 0.5rem',
                fontSize: '0.8rem',
                border: '1px solid #E2E8F0',
                borderRadius: '0.25rem',
                color: '#4A5568',
              }}
            />
            <button
              onClick={handleAddDeliverable}
              disabled={!newDeliverable.trim()}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: newDeliverable.trim() ? '#6C5CE7' : '#EDF2F7',
                color: newDeliverable.trim() ? 'white' : '#A0AEC0',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: newDeliverable.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Linked diagnostic items */}
      {linkedItems.length > 0 && (
        <div style={{
          padding: '0.75rem 1.5rem 1rem 3.5rem',
          borderTop: '1px solid #EDF2F7',
        }}>
          <h4 style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#4A5568',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Addresses Diagnostic Findings
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {linkedItems.map((name, idx) => {
              const proc = diagnosticProcesses.find(p => p.name === name);
              const statusColor = proc ? {
                healthy: '#22c55e',
                careful: '#eab308',
                warning: '#ef4444',
                unable: '#1f2937',
              }[proc.status] || '#9ca3af' : '#9ca3af';

              const chipContent = (
                <>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: statusColor, display: 'inline-block',
                  }} />
                  {name}
                </>
              );

              const chipStyle = {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.625rem',
                background: '#F7FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                color: '#4A5568',
                textDecoration: 'none',
                transition: 'border-color 0.15s',
              };

              if (diagUrl) {
                return (
                  <Link key={idx} href={`${diagUrl}?highlight=${encodeURIComponent(name)}`} style={chipStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6C5CE7'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
                  >
                    {chipContent}
                  </Link>
                );
              }

              return (
                <span key={idx} style={chipStyle}>
                  {chipContent}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete confirmation overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              borderRadius: '0.75rem',
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: '0.875rem', color: '#E53E3E', fontWeight: 600 }}>
              Delete this section?
            </span>
            <button
              onClick={() => {
                onDeleteSection?.(section.id);
                setShowDeleteConfirm(false);
              }}
              style={{
                padding: '0.4rem 1rem',
                background: '#E53E3E',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                padding: '0.4rem 1rem',
                background: '#EDF2F7',
                color: '#4A5568',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
