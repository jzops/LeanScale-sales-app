/**
 * SplitBuilder - Side-by-side SOW builder + live preview
 *
 * Props:
 *   sow              - The SOW object
 *   sections         - Array of sow_sections
 *   diagnosticResult - Linked diagnostic result
 *   onSave           - Callback after saving
 *   customerName     - Customer name for preview header
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import SowBuilder from './SowBuilder';
import SowLivePreview from './SowLivePreview';
import InvestmentSummaryBar from './InvestmentSummaryBar';

const VIEW_MODES = {
  BUILDER: 'builder',
  SPLIT: 'split',
  PREVIEW: 'preview',
};

const MIN_PANEL_WIDTH = 320;

export default function SplitBuilder({
  sow,
  sections: initialSections = [],
  diagnosticResult,
  onSave,
  customerName,
}) {
  const [viewMode, setViewMode] = useState(VIEW_MODES.SPLIT);
  const [splitRatio, setSplitRatio] = useState(0.5); // 0-1 ratio for left panel
  const [zoom, setZoom] = useState(0.75);
  const [liveSections, setLiveSections] = useState(initialSections);
  const [liveExecSummary, setLiveExecSummary] = useState(sow?.content?.executive_summary || '');
  const [activeSectionId, setActiveSectionId] = useState(null);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  // Sync sections from initialSections when they change (e.g., after reload)
  useEffect(() => {
    setLiveSections(initialSections);
  }, [initialSections]);

  // Keyboard shortcut: Cmd+P to toggle preview
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setViewMode(prev => {
          if (prev === VIEW_MODES.SPLIT) return VIEW_MODES.BUILDER;
          if (prev === VIEW_MODES.BUILDER) return VIEW_MODES.SPLIT;
          return VIEW_MODES.SPLIT;
        });
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Drag to resize
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    function handleMouseMove(e) {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.max(MIN_PANEL_WIDTH / rect.width, Math.min(1 - MIN_PANEL_WIDTH / rect.width, x / rect.width));
      setSplitRatio(ratio);
    }

    function handleMouseUp() {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  // Intercept SowBuilder's internal section state changes by wrapping
  // We'll use a MutationObserver-style approach: SowBuilder calls onSave,
  // but we also need real-time updates. We'll wrap the SowBuilder and
  // intercept fetch calls to track section changes.
  // 
  // Better approach: pass section change callbacks to track live state
  const handleSave = useCallback(() => {
    onSave?.();
  }, [onSave]);

  const showBuilder = viewMode !== VIEW_MODES.PREVIEW;
  const showPreview = viewMode !== VIEW_MODES.BUILDER;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', position: 'relative' }}>
      {/* View mode toggle bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        background: '#F7FAFC',
        borderBottom: '1px solid #E2E8F0',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { mode: VIEW_MODES.BUILDER, label: '📝 Builder Only', shortcut: null },
            { mode: VIEW_MODES.SPLIT, label: '◫ Split View', shortcut: '⌘P' },
            { mode: VIEW_MODES.PREVIEW, label: '👁 Preview Only', shortcut: null },
          ].map(({ mode, label, shortcut }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '4px 12px',
                border: '1px solid',
                borderColor: viewMode === mode ? '#6C5CE7' : '#E2E8F0',
                borderRadius: '6px',
                background: viewMode === mode ? '#EDE9FE' : '#fff',
                color: viewMode === mode ? '#6C5CE7' : '#718096',
                fontSize: '12px',
                fontWeight: viewMode === mode ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {label}
              {shortcut && (
                <span style={{ fontSize: 10, opacity: 0.6, background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: 3 }}>
                  {shortcut}
                </span>
              )}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#A0AEC0' }}>
          {liveSections.length} sections • {liveSections.reduce((s, sec) => s + (parseFloat(sec.hours) || 0), 0)}h
        </div>
      </div>

      {/* Main content area */}
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Left: Builder */}
        {showBuilder && (
          <div style={{
            width: showPreview ? `${splitRatio * 100}%` : '100%',
            overflow: 'auto',
            padding: '1.5rem 1rem',
            flexShrink: 0,
          }}>
            <SowBuilder
              sow={sow}
              sections={initialSections}
              diagnosticResult={diagnosticResult}
              onSave={handleSave}
            />
          </div>
        )}

        {/* Drag divider */}
        {showBuilder && showPreview && (
          <div
            onMouseDown={handleMouseDown}
            style={{
              width: 6,
              cursor: 'col-resize',
              background: '#E2E8F0',
              flexShrink: 0,
              position: 'relative',
              zIndex: 10,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#6C5CE7'; }}
            onMouseLeave={(e) => { if (!isDragging.current) e.currentTarget.style.background = '#E2E8F0'; }}
          >
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: '#A0AEC0' }} />
              ))}
            </div>
          </div>
        )}

        {/* Right: Preview */}
        {showPreview && (
          <div style={{
            width: showBuilder ? `${(1 - splitRatio) * 100}%` : '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: '#E2E8F0',
          }}>
            <SowLivePreview
              sow={sow}
              sections={liveSections}
              diagnosticResult={diagnosticResult}
              customerName={customerName}
              zoom={zoom}
              onZoomChange={setZoom}
              activeSectionId={activeSectionId}
              executiveSummary={liveExecSummary}
            />
          </div>
        )}
      </div>

      {/* Sticky investment bar */}
      <InvestmentSummaryBar sections={liveSections} />
    </div>
  );
}
