/**
 * DiagnosticItemCard — Draggable diagnostic item for the scope builder
 *
 * Compact card with status dot, name, function, hours estimate.
 * HTML5 drag-and-drop enabled. Visual states: unscoped, in-scope, excluded.
 */

import { useState } from 'react';
import { StatusDot } from './StatusLegend';

const HOURS_ESTIMATE = {
  warning: { low: 20, high: 40 },
  unable: { low: 30, high: 60 },
  careful: { low: 10, high: 20 },
  healthy: { low: 5, high: 10 },
  na: { low: 0, high: 0 },
};

export function estimateHours(item) {
  const range = HOURS_ESTIMATE[item.status] || HOURS_ESTIMATE.careful;
  return Math.round((range.low + range.high) / 2);
}

export default function DiagnosticItemCard({
  item,
  isInScope = false,
  isExcluded = false,
  onToggleScope,
  catalogEntry = null,
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const hours = catalogEntry
    ? Math.round(((catalogEntry.hours_low || 0) + (catalogEntry.hours_high || 0)) / 2)
    : estimateHours(item);

  function handleDragStart(e) {
    e.dataTransfer.setData('application/json', JSON.stringify({
      name: item.name,
      function: item.function || item.category || 'Other',
      status: item.status,
      hours,
      serviceId: item.serviceId || null,
    }));
    e.dataTransfer.effectAllowed = 'copy';
    e.currentTarget.style.opacity = '0.5';
  }

  function handleDragEnd(e) {
    e.currentTarget.style.opacity = '1';
  }

  const borderColor = isInScope
    ? 'var(--status-healthy)'
    : isExcluded
      ? 'var(--gray-300)'
      : 'var(--border-color)';

  const bgColor = isInScope
    ? 'var(--status-healthy-bg)'
    : isExcluded
      ? 'var(--gray-50)'
      : 'var(--bg-white)';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onToggleScope?.(item.name)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="scope-item-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        border: `2px solid ${borderColor}`,
        borderRadius: 'var(--radius-lg)',
        background: bgColor,
        cursor: 'grab',
        opacity: isExcluded ? 0.5 : 1,
        transition: 'all 0.2s ease',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <StatusDot status={item.status} size={10} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: isExcluded ? 'var(--text-muted)' : 'var(--text-primary)',
        }}>
          {item.name}
        </div>
        <div style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--text-muted)',
        }}>
          {item.function || item.category || 'General'}
        </div>
      </div>

      <div style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--ls-purple-light)',
        whiteSpace: 'nowrap',
      }}>
        {hours}h
      </div>

      {isInScope && (
        <span style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--status-healthy)',
        }}>
          ✓
        </span>
      )}

      {/* Tooltip for catalog entry */}
      {showTooltip && catalogEntry && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--gray-800)',
          color: 'white',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-xs)',
          maxWidth: '250px',
          zIndex: 100,
          boxShadow: 'var(--shadow-lg)',
          pointerEvents: 'none',
        }}>
          <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: '2px' }}>
            {catalogEntry.name}
          </div>
          {catalogEntry.description && (
            <div style={{ opacity: 0.8, lineHeight: 1.3 }}>
              {catalogEntry.description.slice(0, 120)}
              {catalogEntry.description.length > 120 ? '…' : ''}
            </div>
          )}
          <div style={{ marginTop: '4px', color: '#a5b4fc' }}>
            {catalogEntry.hours_low}–{catalogEntry.hours_high}h · ${catalogEntry.default_rate}/hr
          </div>
        </div>
      )}
    </div>
  );
}
