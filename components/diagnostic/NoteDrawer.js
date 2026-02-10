import { useState } from 'react';

/**
 * NoteDrawer — inline notes section for a diagnostic process item
 *
 * Shows existing notes and allows adding new ones.
 *
 * @param {string} processName - Name of the process this note is for
 * @param {Array} notes - Existing notes for this process
 * @param {function} onAddNote - Called with { processName, note } when adding a note
 * @param {function} onDeleteNote - Called with noteId when deleting a note
 * @param {boolean} readOnly - If true, hide add/delete controls
 */
export default function NoteDrawer({ processName, notes = [], onAddNote, onDeleteNote, readOnly = false }) {
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  async function handleAdd() {
    if (!newNote.trim()) return;
    setIsAdding(true);
    try {
      await onAddNote({ processName, note: newNote.trim() });
      setNewNote('');
    } finally {
      setIsAdding(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  }

  const processNotes = notes.filter(n => n.process_name === processName);

  return (
    <div style={{
      background: '#f8f9fa',
      borderTop: '1px solid var(--border-color)',
      padding: '0.75rem 1rem',
    }}>
      {processNotes.length > 0 && (
        <div style={{ marginBottom: readOnly ? 0 : '0.5rem' }}>
          {processNotes.map((note) => (
            <div
              key={note.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '0.4rem 0',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.4 }}>{note.note}</p>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  {note.author && `${note.author} · `}
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
              {!readOnly && onDeleteNote && (
                <button
                  onClick={() => onDeleteNote(note.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.4rem',
                    marginLeft: '0.5rem',
                    flexShrink: 0,
                  }}
                  title="Delete note"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!readOnly && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a note..."
            style={{
              flex: 1,
              padding: '0.4rem 0.6rem',
              fontSize: '0.8rem',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              background: 'white',
            }}
          />
          <button
            onClick={handleAdd}
            disabled={!newNote.trim() || isAdding}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: newNote.trim() ? 'var(--ls-purple)' : 'var(--bg-subtle)',
              color: newNote.trim() ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: newNote.trim() ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap',
            }}
          >
            {isAdding ? '...' : 'Add'}
          </button>
        </div>
      )}

      {processNotes.length === 0 && readOnly && (
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No notes
        </p>
      )}
    </div>
  );
}
