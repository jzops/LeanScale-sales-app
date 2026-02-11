/**
 * API endpoint for SOW versions
 * GET  /api/sow/[id]/versions              - List versions for a SOW
 * POST /api/sow/[id]/versions              - Create a new version (export snapshot)
 */

import { listVersions, createVersion, getNextVersionNumber } from '../../../../lib/sow-versions';
import { getSowById, updateSow } from '../../../../lib/sow';
import { listSections } from '../../../../lib/sow-sections';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing SOW id' });
  }

  const sow = await getSowById(id);
  if (!sow) {
    return res.status(404).json({ success: false, error: 'SOW not found' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(id, res);
    case 'POST':
      return handlePost(id, sow, req, res);
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handleGet(sowId, res) {
  try {
    const versions = await listVersions(sowId);
    return res.status(200).json({ success: true, data: versions });
  } catch (error) {
    console.error('Error listing versions:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handlePost(sowId, sow, req, res) {
  try {
    const { exportedBy } = req.body;

    // Get current sections
    const sections = await listSections(sowId);

    // Determine next version number
    const versionNumber = await getNextVersionNumber(sowId);

    // Create version with full snapshot
    const version = await createVersion({
      sowId,
      versionNumber,
      contentSnapshot: sow.content || {},
      sectionsSnapshot: sections,
      exportedBy,
    });

    if (!version) {
      return res.status(500).json({ success: false, error: 'Failed to create version' });
    }

    // Update current_version on the SOW
    await updateSow(sowId, { current_version: versionNumber });

    return res.status(201).json({ success: true, data: version });
  } catch (error) {
    console.error('Error creating version:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
