/**
 * API endpoint for individual SOW section operations
 * PUT    /api/sow/[id]/sections/[sectionId] - Update a section
 * DELETE /api/sow/[id]/sections/[sectionId] - Delete a section
 */

import { updateSection, deleteSection, getSectionById } from '../../../../../lib/sow-sections';
import { getSowById } from '../../../../../lib/sow';

export default async function handler(req, res) {
  const { id, sectionId } = req.query;

  if (!id || !sectionId) {
    return res.status(400).json({ success: false, error: 'Missing id or sectionId' });
  }

  // Verify SOW exists
  const sow = await getSowById(id);
  if (!sow) {
    return res.status(404).json({ success: false, error: 'SOW not found' });
  }

  switch (req.method) {
    case 'PUT':
      return handlePut(sectionId, req, res);
    case 'DELETE':
      return handleDelete(sectionId, res);
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handlePut(sectionId, req, res) {
  try {
    const section = await updateSection(sectionId, req.body);

    if (!section) {
      return res.status(404).json({ success: false, error: 'Section not found or update failed' });
    }

    return res.status(200).json({ success: true, data: section });
  } catch (error) {
    console.error('Error updating section:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleDelete(sectionId, res) {
  try {
    const success = await deleteSection(sectionId);

    if (!success) {
      return res.status(500).json({ success: false, error: 'Failed to delete section' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
