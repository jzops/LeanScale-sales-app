/**
 * API endpoint for Teamwork push confirmation
 * POST /api/sow/[id]/push-to-teamwork/confirm - Execute the push to Teamwork
 */

import { getSowById, updateSow } from '../../../../../lib/sow';
import { listSections, updateSection } from '../../../../../lib/sow-sections';
import { isTeamworkConfigured, pushSowToTeamwork } from '../../../../../lib/teamwork';
import { getTemplateForSowType } from '../../../../../data/teamwork-templates';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing SOW id' });
  }

  if (!isTeamworkConfigured()) {
    return res.status(500).json({
      success: false,
      error: 'Teamwork API credentials not configured. Set TEAMWORK_SITE_URL and TEAMWORK_API_TOKEN environment variables.',
    });
  }

  try {
    const sow = await getSowById(id);
    if (!sow) {
      return res.status(404).json({ success: false, error: 'SOW not found' });
    }

    // Already pushed?
    if (sow.teamwork_project_id) {
      return res.status(400).json({
        success: false,
        error: 'SOW has already been pushed to Teamwork',
        data: {
          teamworkProjectId: sow.teamwork_project_id,
          teamworkProjectUrl: sow.teamwork_project_url,
        },
      });
    }

    const sections = await listSections(id);
    const { customerName } = req.body || {};

    // Build template tasks mapping
    const template = getTemplateForSowType(sow.sow_type);
    const templateTasks = {};
    // Apply template phases as the default task set for each section
    templateTasks['_default'] = template.phases.flatMap((phase) =>
      phase.tasks.map((t) => ({
        content: t.content,
        description: t.description || '',
      }))
    );

    // Execute the push
    const result = await pushSowToTeamwork({
      customerName: customerName || sow.title,
      sow,
      sections,
      templateTasks,
    });

    // Store Teamwork references on the SOW
    if (result.project?.id) {
      await updateSow(id, {
        teamwork_project_id: result.project.id,
        teamwork_project_url: result.project.url,
      });
    }

    // Store milestone IDs on sections
    for (const milestoneResult of result.milestones || []) {
      if (milestoneResult.sectionId && milestoneResult.id) {
        await updateSection(milestoneResult.sectionId, {
          teamworkMilestoneId: milestoneResult.id,
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error pushing to Teamwork:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to push to Teamwork: ${error.message}`,
    });
  }
}
