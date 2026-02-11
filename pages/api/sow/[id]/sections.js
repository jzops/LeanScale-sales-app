/**
 * API endpoint for SOW sections
 * GET    /api/sow/[id]/sections       - List sections for a SOW
 * POST   /api/sow/[id]/sections       - Create a new section
 * PUT    /api/sow/[id]/sections       - Reorder sections (body: { ordering: [{id, sortOrder}] })
 */

import {
  listSections,
  createSection,
  reorderSections,
} from '../../../../lib/sow-sections';
import { getSowById } from '../../../../lib/sow';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing SOW id' });
  }

  // Verify SOW exists
  const sow = await getSowById(id);
  if (!sow) {
    return res.status(404).json({ success: false, error: 'SOW not found' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(id, res);
    case 'POST':
      return handlePost(id, req, res);
    case 'PUT':
      return handleReorder(id, req, res);
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handleGet(sowId, res) {
  try {
    const sections = await listSections(sowId);
    return res.status(200).json({ success: true, data: sections });
  } catch (error) {
    console.error('Error listing sections:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handlePost(sowId, req, res) {
  try {
    const {
      title, description, deliverables, hours, rate,
      startDate, endDate, diagnosticItems, sortOrder,
      service_catalog_id,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'title is required' });
    }

    const section = await createSection({
      sowId,
      title,
      description,
      deliverables,
      hours,
      rate,
      startDate,
      endDate,
      diagnosticItems,
      sortOrder,
      serviceCatalogId: service_catalog_id,
    });

    if (!section) {
      return res.status(500).json({ success: false, error: 'Failed to create section' });
    }

    return res.status(201).json({ success: true, data: section });
  } catch (error) {
    console.error('Error creating section:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleReorder(sowId, req, res) {
  try {
    const { ordering } = req.body;

    if (!ordering || !Array.isArray(ordering)) {
      return res.status(400).json({
        success: false,
        error: 'ordering must be an array of { id, sortOrder }',
      });
    }

    const success = await reorderSections(sowId, ordering);

    if (!success) {
      return res.status(500).json({ success: false, error: 'Failed to reorder sections' });
    }

    // Return updated sections
    const sections = await listSections(sowId);
    return res.status(200).json({ success: true, data: sections });
  } catch (error) {
    console.error('Error reordering sections:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
