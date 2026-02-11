import { useState, useRef, useEffect, useCallback } from 'react';
import { StatusBadge } from './StatusLegend';

const STATUSES = ['healthy', 'careful', 'warning', 'unable', 'na'];

export default function StatusPicker({ currentStatus, onChange }) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const ref = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function close(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => {
    if (open) {
      setFocusIndex(STATUSES.indexOf(currentStatus));
    }
  }, [open, currentStatus]);

  const handleKeyDown = useCallback((e) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusIndex(i => (i + 1) % STATUSES.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusIndex(i => (i - 1 + STATUSES.length) % STATUSES.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusIndex >= 0) {
          onChange(STATUSES[focusIndex]);
          setOpen(false);
          buttonRef.current?.focus();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        break;
    }
  }, [open, focusIndex, onChange]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        style={{
          background: 'none',
          border: '1px dashed var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.2rem 0.4rem',
          cursor: 'pointer',
        }}
        title="Click to change status"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <StatusBadge status={currentStatus} />
      </button>
      {open && (
        <div
          role="listbox"
          aria-activedescendant={focusIndex >= 0 ? `status-option-${STATUSES[focusIndex]}` : undefined}
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            background: 'var(--bg-white)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: '0.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.15rem',
            minWidth: '120px',
            marginTop: '4px',
          }}
        >
          {STATUSES.map((s, i) => (
            <button
              key={s}
              id={`status-option-${s}`}
              role="option"
              aria-selected={s === currentStatus}
              onClick={() => { onChange(s); setOpen(false); }}
              style={{
                background: i === focusIndex ? 'var(--bg-subtle)' : s === currentStatus ? 'rgba(124, 58, 237, 0.06)' : 'transparent',
                border: 'none',
                padding: 'var(--space-1) var(--space-2)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'left',
                outline: i === focusIndex ? '2px solid var(--ls-purple-light)' : 'none',
              }}
            >
              <StatusBadge status={s} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
