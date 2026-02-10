/**
 * API endpoint for diagnostic inline notes
 *
 * POST   /api/diagnostics/notes — Add a new note
 * PUT    /api/diagnostics/notes — Update an existing note
 * DELETE /api/diagnostics/notes — Delete a note
 */

import { addNote, updateNote, deleteNote } from '../../../lib/diagnostics';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handlePost(req, res);
  } else if (req.method === 'PUT') {
    return handlePutNote(req, res);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handlePost(req, res) {
  const { diagnosticResultId, processName, note, author } = req.body;

  if (!diagnosticResultId || !processName || !note) {
    return res.status(400).json({
      success: false,
      error: 'diagnosticResultId, processName, and note are required',
    });
  }

  try {
    const result = await addNote({
      diagnosticResultId,
      processName,
      note,
      author,
    });

    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Failed to add note',
      });
    }

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error adding note:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

async function handlePutNote(req, res) {
  const { noteId, note, author } = req.body;

  if (!noteId) {
    return res.status(400).json({
      success: false,
      error: 'noteId is required',
    });
  }

  try {
    const result = await updateNote(noteId, { note, author });

    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update note',
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error updating note:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

async function handleDelete(req, res) {
  const { noteId } = req.body;

  if (!noteId) {
    return res.status(400).json({
      success: false,
      error: 'noteId is required',
    });
  }

  try {
    const success = await deleteNote(noteId);

    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete note',
      });
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
