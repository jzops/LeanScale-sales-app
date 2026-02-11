import { useInlineEdit } from '../../lib/hooks/useInlineEdit';

/**
 * EditableNumber — Number/currency field with formatting.
 *
 * View mode: Formatted display ($1,234 or 40h).
 * Edit mode: Plain number input.
 *
 * @param {number} value - Current server value (numeric)
 * @param {function} onCommit - Called with new numeric value
 * @param {boolean} readOnly - If true, never enters edit mode
 * @param {'currency'|'hours'|'number'} format - Display format
 * @param {string} placeholder - Placeholder when empty/zero
 * @param {object} style - Style overrides
 * @param {number} min - Minimum value (default 0)
 * @param {number} step - Step increment (default 1)
 */
export default function EditableNumber({
  value: serverValue,
  onCommit,
  readOnly = false,
  format = 'number',
  placeholder = '-',
  style = {},
  min = 0,
  step = 1,
}) {
  const {
    value,
    isEditing,
    startEdit,
    handleChange,
    handleBlur,
    handleKeyDown,
    inputRef,
  } = useInlineEdit(
    serverValue ?? '',
    (newVal) => {
      const num = parseFloat(newVal);
      onCommit?.(isNaN(num) ? 0 : num);
    }
  );

  function formatDisplay(val) {
    const num = parseFloat(val);
    if (isNaN(num) || num === 0) return placeholder;

    switch (format) {
      case 'currency':
        return `$${num.toLocaleString()}`;
      case 'hours':
        return `${num}h`;
      default:
        return num.toLocaleString();
    }
  }

  if (readOnly) {
    return (
      <span style={{ ...style, fontVariantNumeric: 'tabular-nums' }}>
        {formatDisplay(serverValue)}
      </span>
    );
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={value ?? ''}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        min={min}
        step={step}
        className="editable-field-input"
        style={{
          ...style,
          display: 'block',
          width: '100%',
          maxWidth: '120px',
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
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
        }}
      />
    );
  }

  return (
    <span
      className="editable-field"
      onClick={startEdit}
      style={{
        ...style,
        cursor: 'pointer',
        borderRadius: 'var(--radius-sm, 0.375rem)',
        padding: '0.25rem 0.5rem',
        transition: 'background 0.15s',
        fontVariantNumeric: 'tabular-nums',
      }}
      title="Click to edit"
    >
      {formatDisplay(serverValue)}
    </span>
  );
}
