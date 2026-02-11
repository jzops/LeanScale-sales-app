import { motion } from 'framer-motion';

const VIEWS = [
  { id: 'priority', label: 'Priority', icon: '\uD83C\uDFAF' },
  { id: 'by-category', label: 'By Category', icon: '\uD83D\uDCC2' },
  { id: 'by-outcome', label: 'By Outcome', icon: '\uD83C\uDFAF' },
  { id: 'table', label: 'Table', icon: '\uD83D\uDCCB' },
  { id: 'metrics', label: 'Metrics', icon: '\uD83D\uDCC8' },
];

/**
 * Sticky sub-navigation for the diagnostic page.
 * Shows view toggle segments + action buttons (edit, import, build SOW).
 */
export default function DiagnosticNav({
  activeView,
  onViewChange,
  editMode,
  onEditToggle,
  onImport,
  onBuildSow,
  saving,
  hasCustomerData,
  hasDiagnosticResult,
  isDemo,
  availableViews,
}) {
  // Filter views based on what data is available
  const visibleViews = availableViews
    ? VIEWS.filter(v => availableViews.includes(v.id))
    : VIEWS;

  return (
    <div className="diagnostic-nav">
      {/* View segments */}
      <div className="diagnostic-nav-views">
        {visibleViews.map((view) => (
          <button
            key={view.id}
            className={`diagnostic-nav-view-btn ${activeView === view.id ? 'active' : ''}`}
            onClick={() => onViewChange(view.id)}
          >
            <span>{view.icon}</span> {view.label}
            {/* Animated active indicator */}
            {activeView === view.id && (
              <motion.div
                layoutId="diagnostic-nav-active"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'var(--ls-purple-light)',
                  borderRadius: 1,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      {!isDemo && (
        <div className="diagnostic-nav-actions">
          <button
            className={`diagnostic-nav-action-btn ${editMode ? 'active' : ''}`}
            onClick={onEditToggle}
          >
            {editMode ? 'Exit Edit' : 'Edit'}
          </button>
          <button
            className="diagnostic-nav-action-btn"
            onClick={onImport}
          >
            Import
          </button>
          {hasDiagnosticResult && (
            <button
              className="diagnostic-nav-action-btn primary"
              onClick={onBuildSow}
            >
              Build SOW
            </button>
          )}
          <span aria-live="polite" style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
            {saving ? 'Saving...' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
