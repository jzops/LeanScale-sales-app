import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { StatusBadge } from './StatusLegend';
import { getPlaybookForService } from '../../data/services-catalog';

const STATUS_CYCLE = ['healthy', 'careful', 'warning', 'unable'];

/**
 * DiagnosticItemModal — full detail modal for a diagnostic item.
 *
 * Replaces the inline NoteDrawer with a richer editing experience:
 * status cycling, priority toggle, function/outcome display,
 * service catalog info, and notes CRUD.
 */
export default function DiagnosticItemModal({
  item,
  open,
  onClose,
  editMode = false,
  onStatusChange,
  onPriorityToggle,
  notes = [],
  onAddNote,
  onDeleteNote,
}) {
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!item) return null;

  const processNotes = notes.filter(n => n.process_name === item.name);
  const service = item.serviceId ? getPlaybookForService(item.serviceId) : null;

  function handleStatusCycle() {
    if (!editMode || !onStatusChange) return;
    const idx = STATUS_CYCLE.indexOf(item.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    onStatusChange(item.name, next);
  }

  function handlePriorityToggle() {
    if (!editMode || !onPriorityToggle) return;
    onPriorityToggle(item.name);
  }

  async function handleAddNote() {
    if (!newNote.trim() || !onAddNote) return;
    setIsAdding(true);
    try {
      await onAddNote({ processName: item.name, note: newNote.trim() });
      setNewNote('');
    } finally {
      setIsAdding(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="diagnostic-modal-overlay" />
        <Dialog.Content className="diagnostic-modal-content">
          {/* Header */}
          <div className="diagnostic-modal-header">
            <Dialog.Title className="diagnostic-modal-title">
              {item.name}
            </Dialog.Title>
            <Dialog.Close className="diagnostic-modal-close" aria-label="Close">
              ✕
            </Dialog.Close>
          </div>

          {/* Status & Priority row */}
          <div className="diagnostic-modal-row">
            <div className="diagnostic-modal-field">
              <label className="diagnostic-modal-label">Status</label>
              {editMode ? (
                <button
                  onClick={handleStatusCycle}
                  className="diagnostic-modal-status-btn"
                  title="Click to cycle status"
                >
                  <StatusBadge status={item.status} />
                </button>
              ) : (
                <StatusBadge status={item.status} />
              )}
            </div>

            <div className="diagnostic-modal-field">
              <label className="diagnostic-modal-label">Priority</label>
              {editMode ? (
                <button
                  onClick={handlePriorityToggle}
                  className={`diagnostic-modal-priority-btn ${item.addToEngagement ? 'active' : ''}`}
                >
                  {item.addToEngagement ? '⭐ Priority' : 'Set Priority'}
                </button>
              ) : (
                <span className={`diagnostic-modal-priority-badge ${item.addToEngagement ? 'active' : ''}`}>
                  {item.addToEngagement ? '⭐ Priority' : '—'}
                </span>
              )}
            </div>
          </div>

          {/* Function & Outcome */}
          {(item.function || item.outcome) && (
            <div className="diagnostic-modal-row">
              {item.function && (
                <div className="diagnostic-modal-field">
                  <label className="diagnostic-modal-label">Function</label>
                  <span className="diagnostic-modal-tag">{item.function}</span>
                </div>
              )}
              {item.outcome && (
                <div className="diagnostic-modal-field">
                  <label className="diagnostic-modal-label">Outcome</label>
                  <span className="diagnostic-modal-tag">{item.outcome}</span>
                </div>
              )}
            </div>
          )}

          {/* Service Catalog Info */}
          {service && (
            <div className="diagnostic-modal-service">
              <label className="diagnostic-modal-label">Linked Service</label>
              <div className="diagnostic-modal-service-card">
                <strong>{service.name || service.title}</strong>
                {service.description && (
                  <p style={{ margin: '0.25rem 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    {service.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="diagnostic-modal-notes">
            <label className="diagnostic-modal-label">
              Notes {processNotes.length > 0 && `(${processNotes.length})`}
            </label>

            {processNotes.length > 0 && (
              <div className="diagnostic-modal-notes-list">
                {processNotes.map((note) => (
                  <div key={note.id} className="diagnostic-modal-note-item">
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>{note.note}</p>
                      <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
                        {note.author && `${note.author} · `}
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {editMode && onDeleteNote && (
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="diagnostic-modal-note-delete"
                        title="Delete note"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {processNotes.length === 0 && (
              <p style={{ margin: '0.25rem 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No notes yet
              </p>
            )}

            {editMode && (
              <div className="diagnostic-modal-note-input">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a note..."
                  rows={2}
                  className="diagnostic-modal-textarea"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isAdding}
                  className="diagnostic-modal-add-btn"
                >
                  {isAdding ? '...' : 'Add Note'}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="diagnostic-modal-footer">
            <Dialog.Close className="diagnostic-modal-close-btn">
              Close
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
