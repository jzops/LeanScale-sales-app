import PriorityHero from '../PriorityHero';
import PrioritySection from '../PrioritySection';
import NoteDrawer from '../NoteDrawer';

/**
 * Default view: priority-based storytelling.
 * Shows hero at top, then critical → warning → moderate → healthy sections.
 */
export default function PriorityView({
  tiers,
  stats,
  priorityCount,
  diagnosticType,
  title,
  editMode,
  onStatusChange,
  onPriorityToggle,
  notes,
  expandedRow,
  onRowExpand,
  onAddNote,
  onDeleteNote,
  linkedSows = [],
  highlightedItem,
  customerPath,
  onOpenModal,
}) {
  return (
    <div>
      <PriorityHero
        stats={stats}
        priorityCount={priorityCount}
        diagnosticType={diagnosticType}
        title={title}
      />

      {tiers.critical.length > 0 && (
        <PrioritySection
          tier="critical"
          items={tiers.critical}
          editMode={editMode}
          onStatusChange={onStatusChange}
          onPriorityToggle={onPriorityToggle}
          notes={notes}
          onOpenNotes={(name) => onRowExpand(name === expandedRow ? null : name)}
          linkedSows={linkedSows}
          highlightedItem={highlightedItem}
          customerPath={customerPath}
          onOpenModal={onOpenModal}
        />
      )}

      {tiers.warning.length > 0 && (
        <PrioritySection
          tier="warning"
          items={tiers.warning}
          editMode={editMode}
          onStatusChange={onStatusChange}
          onPriorityToggle={onPriorityToggle}
          notes={notes}
          onOpenNotes={(name) => onRowExpand(name === expandedRow ? null : name)}
          linkedSows={linkedSows}
          highlightedItem={highlightedItem}
          customerPath={customerPath}
          onOpenModal={onOpenModal}
        />
      )}

      {tiers.moderate.length > 0 && (
        <PrioritySection
          tier="moderate"
          items={tiers.moderate}
          editMode={editMode}
          onStatusChange={onStatusChange}
          onPriorityToggle={onPriorityToggle}
          notes={notes}
          onOpenNotes={(name) => onRowExpand(name === expandedRow ? null : name)}
          linkedSows={linkedSows}
          highlightedItem={highlightedItem}
          customerPath={customerPath}
          onOpenModal={onOpenModal}
        />
      )}

      {tiers.healthy.length > 0 && (
        <PrioritySection
          tier="healthy"
          items={tiers.healthy}
          editMode={editMode}
          onStatusChange={onStatusChange}
          onPriorityToggle={onPriorityToggle}
          notes={notes}
          onOpenNotes={(name) => onRowExpand(name === expandedRow ? null : name)}
          linkedSows={linkedSows}
          highlightedItem={highlightedItem}
          customerPath={customerPath}
          onOpenModal={onOpenModal}
        />
      )}

      {/* Note drawer rendered below everything, keyed to expanded row */}
      {editMode && expandedRow && (
        <div style={{ margin: 'var(--space-4) 0' }}>
          <NoteDrawer
            processName={expandedRow}
            notes={notes}
            onAddNote={onAddNote}
            onDeleteNote={onDeleteNote}
          />
        </div>
      )}
    </div>
  );
}
