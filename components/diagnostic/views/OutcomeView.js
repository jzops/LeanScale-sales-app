import CategoryView from './CategoryView';

/**
 * Grouped view by outcome. Reuses CategoryView with outcome field.
 */
export default function OutcomeView({
  processes,
  outcomes,
  editMode,
  onStatusChange,
  onPriorityToggle,
  notes,
  onOpenNotes,
}) {
  return (
    <CategoryView
      processes={processes}
      groupNames={outcomes}
      groupField="outcome"
      groupLabel="Outcome"
      editMode={editMode}
      onStatusChange={onStatusChange}
      onPriorityToggle={onPriorityToggle}
      notes={notes}
      onOpenNotes={onOpenNotes}
    />
  );
}
