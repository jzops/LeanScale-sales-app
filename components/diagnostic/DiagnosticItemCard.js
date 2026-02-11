import { motion } from 'framer-motion';
import { StatusDot, StatusBadge } from './StatusLegend';
import { fadeUpItem, cardHover, statusPop } from '../../lib/animations';

const STATUS_CYCLE = ['healthy', 'careful', 'warning', 'unable'];

/**
 * Interactive card for a single diagnostic item.
 *
 * Replaces the table row from the old design with a card that shows
 * status, function/outcome tags, priority badge, note count, and
 * optional "View in SOW" link when the item is linked to a SOW section.
 */
export default function DiagnosticItemCard({
  item,
  tier,
  editMode = false,
  onStatusChange,
  onPriorityToggle,
  notes = [],
  onOpenNotes,
  linkedSows = [],
  highlighted = false,
  customerPath,
  onOpenModal,
}) {
  const noteCount = notes.filter(n => n.process_name === item.name).length;

  function handleStatusClick(e) {
    e.stopPropagation();
    if (!editMode || !onStatusChange) return;
    const currentIdx = STATUS_CYCLE.indexOf(item.status);
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
    onStatusChange(item.name, nextStatus);
  }

  function handlePriorityClick(e) {
    e.stopPropagation();
    if (!editMode || !onPriorityToggle) return;
    onPriorityToggle(item.name);
  }

  // Find which SOWs reference this item
  const sowsWithItem = linkedSows.filter(s => s.id); // all linked SOWs (sections checked on SOW side)

  return (
    <motion.div
      className={`diagnostic-item-card ${tier}`}
      data-process-name={item.name}
      variants={fadeUpItem}
      whileHover={cardHover}
      layout
      onClick={() => { if (editMode && onOpenModal) onOpenModal(item); }}
      style={{
        ...(editMode && onOpenModal ? { cursor: 'pointer' } : {}),
        ...(highlighted ? {
          boxShadow: '0 0 0 2px #6C5CE7, 0 0 12px rgba(108, 92, 231, 0.3)',
          transition: 'box-shadow 0.3s',
        } : {}),
      }}
    >
      {/* Header: name + status */}
      <div className="diagnostic-item-card-header">
        <span className="diagnostic-item-card-name">{item.name}</span>
        {editMode ? (
          <motion.button
            onClick={handleStatusClick}
            style={{
              background: 'none',
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            whileTap={{ scale: 0.9 }}
            title="Click to cycle status"
          >
            <StatusBadge status={item.status} />
          </motion.button>
        ) : (
          <StatusDot status={item.status} />
        )}
      </div>

      {/* Tags: function + outcome */}
      <div className="diagnostic-item-card-tags">
        {item.function && (
          <span className="diagnostic-item-card-tag">{item.function}</span>
        )}
        {item.outcome && (
          <span className="diagnostic-item-card-tag">{item.outcome}</span>
        )}
      </div>

      {/* Footer: priority + notes */}
      <div className="diagnostic-item-card-footer">
        <div className="diagnostic-item-card-actions">
          {/* Priority */}
          {editMode ? (
            <motion.button
              className={`diagnostic-item-card-priority-btn ${item.addToEngagement ? 'active' : ''}`}
              onClick={handlePriorityClick}
              whileTap={{ scale: 0.95 }}
              title="Toggle priority"
            >
              {item.addToEngagement ? 'Priority' : 'Set Priority'}
            </motion.button>
          ) : (
            item.addToEngagement && (
              <span className="diagnostic-item-card-priority-badge">Priority</span>
            )
          )}
        </div>

        {/* Notes */}
        {editMode && (
          <button
            className={`diagnostic-item-card-note-btn ${noteCount > 0 ? 'has-notes' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenNotes?.(item.name);
            }}
            title={noteCount > 0 ? `${noteCount} note(s)` : 'Add note'}
          >
            {noteCount > 0 ? `\uD83D\uDCAC ${noteCount}` : '\uD83D\uDCAC'}
          </button>
        )}

        {/* View in SOW link */}
        {sowsWithItem.length > 0 && customerPath && (
          <a
            href={customerPath(`/sow/${sowsWithItem[0].id}`)}
            onClick={(e) => e.stopPropagation()}
            className="diagnostic-item-card-sow-link"
            style={{
              fontSize: '0.7rem',
              color: '#9F8FEF',
              textDecoration: 'none',
              opacity: 1,
              transition: 'color 0.15s',
            }}
          >
            View in SOW
          </a>
        )}
      </div>
    </motion.div>
  );
}
