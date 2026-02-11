import { useInlineEdit } from '../../lib/hooks/useInlineEdit';
import { useRef, useEffect } from 'react';

/**
 * EditableTextArea — Auto-expanding multi-line inline edit.
 *
 * View mode: Normal paragraph text, click to edit.
 * Edit mode: Auto-growing textarea with focus ring.
 *
 * @param {string} value - Current server value
 * @param {function} onCommit - Called with new value when edit completes
 * @param {boolean} readOnly - If true, never enters edit mode
 * @param {string} placeholder - Placeholder when empty
 * @param {object} style - Style overrides for the display text
 * @param {number} minRows - Minimum textarea rows (default 3)
 */
export default function EditableTextArea({
  value: serverValue,
  onCommit,
  readOnly = false,
  placeholder = 'Click to add text...',
  style = {},
  minRows = 3,
}) {
  const {
    value,
    isEditing,
    startEdit,
    handleChange,
    handleBlur,
    handleKeyDown: baseKeyDown,
    inputRef,
  } = useInlineEdit(serverValue, onCommit);

  const textareaRef = useRef(null);

  // Auto-resize textarea to content
  useEffect(() => {
    const el = textareaRef.current;
    if (el && isEditing) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, [value, isEditing]);

  // Combine refs
  function setRef(el) {
    textareaRef.current = el;
    if (typeof inputRef === 'function') {
      inputRef(el);
    } else if (inputRef) {
      inputRef.current = el;
    }
  }

  // For textarea, Enter adds newlines — only Escape exits
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      baseKeyDown(e);
    }
    // Let Enter through for newlines
  }

  if (readOnly) {
    return (
      <p style={{ ...style, whiteSpace: 'pre-wrap', margin: 0 }}>
        {serverValue || placeholder}
      </p>
    );
  }

  if (isEditing) {
    return (
      <textarea
        ref={setRef}
        value={value ?? ''}
        onChange={(e) => {
          handleChange(e);
          // Auto-resize
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        rows={minRows}
        className="editable-field-input"
        style={{
          ...style,
          display: 'block',
          width: '100%',
          margin: 0,
          padding: '0.5rem',
          border: '1px solid var(--edit-focus-border, #6C5CE7)',
          borderRadius: 'var(--radius-sm, 0.375rem)',
          boxShadow: 'var(--edit-focus-ring, 0 0 0 3px rgba(108, 92, 231, 0.15))',
          outline: 'none',
          background: 'white',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          color: 'inherit',
          lineHeight: 'inherit',
          resize: 'none',
          overflow: 'hidden',
        }}
      />
    );
  }

  return (
    <div
      className="editable-field"
      onClick={startEdit}
      style={{
        ...style,
        whiteSpace: 'pre-wrap',
        margin: 0,
        cursor: 'pointer',
        borderRadius: 'var(--radius-sm, 0.375rem)',
        padding: '0.25rem 0.5rem',
        transition: 'background 0.15s',
        minHeight: `${minRows * 1.5}em`,
      }}
      title="Click to edit"
    >
      {serverValue || (
        <span style={{ color: 'var(--text-muted, #A0AEC0)', fontStyle: 'italic' }}>
          {placeholder}
        </span>
      )}
    </div>
  );
}
