import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DiagnosticItemCard from '../DiagnosticItemCard';
import { StatusDot } from '../StatusLegend';
import { countStatuses, groupBy } from '../../../data/diagnostic-registry';
import { staggerContainer, collapseExpand } from '../../../lib/animations';

/**
 * Grouped view by category/function.
 * Animated collapsible groups with mini health bars.
 */
export default function CategoryView({
  processes,
  groupNames,
  groupField = 'function',
  groupLabel = 'Category',
  editMode,
  onStatusChange,
  onPriorityToggle,
  notes,
  onOpenNotes,
  linkedSows = [],
  highlightedItem,
  customerPath,
}) {
  const grouped = groupBy(processes, groupField);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {groupNames.map((groupName) => {
        const items = grouped[groupName] || [];
        if (items.length === 0) return null;

        return (
          <CategoryGroup
            key={groupName}
            name={groupName}
            items={items}
            editMode={editMode}
            onStatusChange={onStatusChange}
            onPriorityToggle={onPriorityToggle}
            notes={notes}
            onOpenNotes={onOpenNotes}
            linkedSows={linkedSows}
            highlightedItem={highlightedItem}
            customerPath={customerPath}
          />
        );
      })}
    </div>
  );
}

function CategoryGroup({ name, items, editMode, onStatusChange, onPriorityToggle, notes, onOpenNotes, linkedSows, highlightedItem, customerPath }) {
  const [expanded, setExpanded] = useState(false);
  const stats = countStatuses(items);
  const total = items.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}
    >
      {/* Group header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-4) var(--space-5)',
          cursor: 'pointer',
          background: expanded ? 'var(--bg-subtle)' : 'white',
          transition: 'background 0.15s ease',
        }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', margin: 0 }}>
            {name}
          </h3>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {total} item{total !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Mini status distribution */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
            {stats.healthy > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <StatusDot status="healthy" size={6} /> {stats.healthy}
              </span>
            )}
            {stats.careful > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <StatusDot status="careful" size={6} /> {stats.careful}
              </span>
            )}
            {stats.warning > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <StatusDot status="warning" size={6} /> {stats.warning}
              </span>
            )}
            {stats.unable > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <StatusDot status="unable" size={6} /> {stats.unable}
              </span>
            )}
          </div>
          <span style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            transition: 'transform 0.15s ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>
            &#9662;
          </span>
        </div>
      </div>

      {/* Items */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial="hidden"
            animate="show"
            exit="exit"
            variants={collapseExpand}
          >
            <motion.div
              style={{ padding: 'var(--space-3) var(--space-5) var(--space-5)' }}
              className="priority-section-grid"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {items.map((item) => {
                const tier = item.status === 'unable' || (item.status === 'warning' && item.addToEngagement)
                  ? 'critical'
                  : item.status === 'warning' ? 'warning'
                  : item.status === 'careful' ? 'moderate'
                  : 'healthy';

                return (
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
                  />
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
