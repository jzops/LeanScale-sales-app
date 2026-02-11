import { useInlineEdit } from '../../lib/hooks/useInlineEdit';

/**
 * EditableField — Generic inline-edit component for single-line text.
 *
 * View mode: Normal text with cursor:pointer, faint pencil icon on hover.
 * Edit mode: Same text size/weight but with subtle border + focus ring.
 *
 * @param {string} value - Current server value
 * @param {function} onCommit - Called with new value when edit completes
 * @param {boolean} readOnly - If true, never enters edit mode
 * @param {string} placeholder - Placeholder when empty
 * @param {object} style - Additional style overrides for the display text
 * @param {string} className - Optional class name
 * @param {string} as - HTML element for display ('span', 'h1', 'h2', 'h3', 'p') default 'span'
 */
export default function EditableField({
  value: serverValue,
  onCommit,
  readOnly = false,
  placeholder = 'Click to edit...',
  style = {},
  className = '',
  as: Tag = 'span',
}) {
  const {
    value,
    isEditing,
    startEdit,
    handleChange,
    handleBlur,
    handleKeyDown,
    inputRef,
  } = useInlineEdit(serverValue, onCommit);

  if (readOnly) {
    return (
      <Tag className={className} style={{ ...style, margin: 0 }}>
        {serverValue || placeholder}
      </Tag>
    );
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value ?? ''}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="editable-field-input"
        style={{
          ...style,
          display: 'block',
          width: '100%',
          margin: 0,
          padding: '0.25rem 0.5rem',
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
        }}
      />
    );
  }

  return (
    <Tag
      className={`editable-field ${className}`}
      onClick={startEdit}
      style={{
        ...style,
        margin: 0,
        cursor: 'pointer',
        position: 'relative',
        borderRadius: 'var(--radius-sm, 0.375rem)',
        padding: '0.25rem 0.5rem',
        transition: 'background 0.15s',
      }}
      title="Click to edit"
    >
      {serverValue || (
        <span style={{ color: 'var(--text-muted, #A0AEC0)', fontStyle: 'italic' }}>
          {placeholder}
        </span>
      )}
    </Tag>
  );
}
