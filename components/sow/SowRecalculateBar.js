import { motion, AnimatePresence } from 'framer-motion';
import { slideUp } from '../../lib/animations';

/**
 * SowRecalculateBar — Sticky bottom bar when fields are dirty.
 *
 * Shows dirty count, projected new total, Recalculate button, Discard option.
 *
 * @param {boolean} visible - Whether to show the bar
 * @param {number} dirtyCount - Number of dirty fields
 * @param {number} projectedTotal - Locally calculated total
 * @param {boolean} saving - Whether save is in progress
 * @param {function} onRecalculate - Called when recalculate button clicked
 * @param {function} onDiscard - Called when discard button clicked
 */
export default function SowRecalculateBar({
  visible = false,
  dirtyCount = 0,
  projectedTotal = 0,
  saving = false,
  onRecalculate,
  onDiscard,
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-label={`${dirtyCount} unsaved changes`}
          variants={slideUp}
          initial="hidden"
          animate="show"
          exit="exit"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(108, 92, 231, 0.2)',
            boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div style={{
            maxWidth: 960,
            margin: '0 auto',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}>
            {/* Left: dirty count + projected total */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#6C5CE7',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}>
                  {dirtyCount}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#4A5568' }}>
                  {dirtyCount === 1 ? 'field changed' : 'fields changed'}
                </span>
              </div>

              {projectedTotal > 0 && (
                <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                  Projected total:{' '}
                  <span style={{ fontWeight: 700, color: '#276749', fontVariantNumeric: 'tabular-nums' }}>
                    ${projectedTotal.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Right: actions */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={onDiscard}
                disabled={saving}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  color: '#718096',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.375rem',
                  fontSize: '0.85rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1,
                }}
              >
                Discard
              </button>
              <button
                onClick={onRecalculate}
                disabled={saving}
                style={{
                  padding: '0.5rem 1.25rem',
                  background: saving ? '#9CA3AF' : '#6C5CE7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: saving ? 'wait' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {saving ? 'Saving...' : 'Recalculate & Save'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
