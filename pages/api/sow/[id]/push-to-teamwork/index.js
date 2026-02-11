/**
 * API endpoint for Teamwork push preview
 * POST /api/sow/[id]/push-to-teamwork - Generate preview of what will be created
 */

import { getSowById } from '../../../../../lib/sow';
import { listSections } from '../../../../../lib/sow-sections';
import { buildTeamworkPreview } from '../../../../../data/teamwork-templates';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing SOW id' });
  }

  try {
    const sow = await getSowById(id);
    if (!sow) {
      return res.status(404).json({ success: false, error: 'SOW not found' });
    }

    // SOW should be in accepted status to push
    if (!['accepted', 'sent', 'review'].includes(sow.status)) {
      return res.status(400).json({
        success: false,
        error: 'SOW must be in review, sent, or accepted status to push to Teamwork',
      });
    }

    // Already pushed?
    if (sow.teamwork_project_id) {
      return res.status(200).json({
        success: true,
        alreadyPushed: true,
        data: {
          teamworkProjectId: sow.teamwork_project_id,
          teamworkProjectUrl: sow.teamwork_project_url,
        },
      });
    }

    const sections = await listSections(id);
    const { customerName } = req.body || {};

    const preview = buildTeamworkPreview({
      customerName: customerName || sow.title,
      sow,
      sections,
    });

    return res.status(200).json({ success: true, data: preview });
  } catch (error) {
    console.error('Error building Teamwork preview:', error);
    return res.status(500).json({ success: false, error: 'Failed to build preview' });
  }
}
