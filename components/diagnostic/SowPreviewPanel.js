/**
 * SowPreviewPanel — collapsible side panel showing real-time SOW preview
 *
 * Updates live as the user changes diagnostic statuses. Shows investment
 * estimates, section list, hours range, tier recommendation, and item counts.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { computeSowPreview } from '../../lib/sow-preview-engine';

export default function SowPreviewPanel({ processes, serviceCatalog, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const [preview, setPreview] = useState(null);
  const debounceRef = useRef(null);

  // Debounced recalculation (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const result = computeSowPreview(processes, serviceCatalog);
      setPreview(result);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [processes, serviceCatalog]);

  if (!preview) {
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>
          <span>📋 SOW Preview</span>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>
        <div style={{ padding: 'var(--space-4)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          Calculating...
        </div>
      </div>
    );
  }

  const { sections, totalHoursLow, totalHoursHigh, estimatedInvestmentLow, estimatedInvestmentHigh, recommendedTier, itemCount, sectionCount } = preview;

  const tierColors = {
    starter: '#10b981',
    growth: '#6366f1',
    scale: '#f59e0b',
  };

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span>📋</span>
          <strong style={{ fontSize: 'var(--text-sm)' }}>SOW Preview</strong>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={closeBtnStyle}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '▸' : '▾'}
          </button>
          <button onClick={onClose} style={closeBtnStyle} title="Close">✕</button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflowY: 'auto', flex: 1 }}>
          {/* Item → Section count */}
          <div style={cardStyle}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>Scope</div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)' }}>
              {itemCount} items → {sectionCount} SOW section{sectionCount !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Recommended Tier */}
          <div style={cardStyle}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>Recommended Tier</div>
            <span style={{
              display: 'inline-block',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-bold)',
              background: tierColors[recommendedTier.id] || '#6366f1',
              color: 'white',
            }}>
              {recommendedTier.label} — {recommendedTier.hours}h/mo
            </span>
          </div>

          {/* Hours Range */}
          <div style={cardStyle}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>Total Hours Range</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--ls-purple-light)' }}>
              {totalHoursLow} – {totalHoursHigh}h
            </div>
          </div>

          {/* Investment Range */}
          <div style={cardStyle}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>Estimated Investment</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: '#276749' }}>
              ${estimatedInvestmentLow.toLocaleString()} – ${estimatedInvestmentHigh.toLocaleString()}
            </div>
          </div>

          {/* Section List */}
          {sections.length > 0 && (
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-semibold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sections
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                {sections.map((section, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    <span style={{ fontWeight: 'var(--font-medium)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {section.title}
                    </span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: 'var(--space-2)', whiteSpace: 'nowrap' }}>
                      {section.itemCount} item{section.itemCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {itemCount === 0 && (
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-4)' }}>
              No priority items selected. Mark items as <strong>Warning</strong>, <strong>Unable</strong>, or toggle <strong>Priority</strong> to see SOW impact.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Styles
const panelStyle = {
  width: '320px',
  minWidth: '280px',
  background: 'var(--bg-white)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-lg)',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 'calc(100vh - 200px)',
  position: 'sticky',
  top: 'var(--space-4)',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 'var(--space-3) var(--space-4)',
  borderBottom: '1px solid var(--border-color)',
  background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
  color: 'white',
  borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  fontSize: 'var(--text-base)',
  padding: '0.2rem',
  lineHeight: 1,
};

const cardStyle = {
  padding: 'var(--space-3)',
  background: 'var(--bg-subtle)',
  borderRadius: 'var(--radius-md)',
};
