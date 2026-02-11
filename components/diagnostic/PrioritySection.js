import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DiagnosticItemCard from './DiagnosticItemCard';
import { staggerContainer, collapseExpand } from '../../lib/animations';

const TIER_CONFIG = {
  critical: {
    label: 'Critical Attention Required',
    icon: '\uD83D\uDEA8',
    defaultExpanded: true,
  },
  warning: {
    label: 'Needs Improvement',
    icon: '\u26A0\uFE0F',
    defaultExpanded: true,
  },
  moderate: {
    label: 'Monitor & Optimize',
    icon: '\uD83D\uDD0D',
    defaultExpanded: false,
  },
  healthy: {
    label: 'Healthy',
    icon: '\u2705',
    defaultExpanded: false,
  },
};

/**
 * Collapsible section for a priority tier.
 * Shows items as cards (or compact chips for healthy tier).
 */
export default function PrioritySection({
  tier,
  items,
  editMode = false,
  onStatusChange,
  onPriorityToggle,
  notes = [],
  onOpenNotes,
  linkedSows = [],
  highlightedItem,
  customerPath,
  onOpenModal,
}) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.moderate;
  const [expanded, setExpanded] = useState(config.defaultExpanded);

  if (!items || items.length === 0) return null;

  return (
    <motion.div
      className="priority-section"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Section Header */}
      <div
        className="priority-section-header"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        <div className="priority-section-header-left">
          <div className={`priority-section-indicator ${tier}`} />
          <div>
            <h3 className="priority-section-title">
              {config.icon} {config.label}
            </h3>
            <span className="priority-section-count">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="priority-section-header-right">
          <span className={`priority-section-chevron ${expanded ? 'open' : ''}`}>
            &#9662;
          </span>
        </div>
      </div>

      {/* Section Content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial="hidden"
            animate="show"
            exit="exit"
            variants={collapseExpand}
          >
            <div className="priority-section-content">
              {tier === 'healthy' && !editMode ? (
                /* Compact chip view for healthy items */
                <div className="diagnostic-chip-grid">
                  {items.map((item) => (
                    <motion.span
                      key={item.name}
                      className="diagnostic-chip"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--status-healthy)',
                        flexShrink: 0,
                      }} />
                      {item.name}
                    </motion.span>
                  ))}
                </div>
              ) : (
                /* Card grid for non-healthy or edit mode */
                <motion.div
                  className="priority-section-grid"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  {items.map((item) => (
                    <DiagnosticItemCard
                      key={item.name}
                      item={item}
                      tier={tier}
                      editMode={editMode}
                      onStatusChange={onStatusChange}
                      onPriorityToggle={onPriorityToggle}
                      notes={notes}
                      onOpenNotes={onOpenNotes}
                      linkedSows={linkedSows}
                      highlighted={highlightedItem === item.name}
                      customerPath={customerPath}
                      onOpenModal={onOpenModal}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
