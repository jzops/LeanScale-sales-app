/**
 * API endpoint for single SOW operations
 * GET    /api/sow/[id] - Get SOW by ID (includes sections)
 * PUT    /api/sow/[id] - Update SOW (partial update, supports new fields)
 * DELETE /api/sow/[id] - Delete SOW
 */

import { getSowById, updateSow, deleteSow } from '../../../../lib/sow';
import { listSections } from '../../../../lib/sow-sections';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Missing id parameter',
    });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(id, req, res);
    case 'PUT':
      return handlePut(id, req, res);
    case 'DELETE':
      return handleDelete(id, req, res);
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
      });
  }
}

async function handleGet(id, req, res) {
  try {
    const sow = await getSowById(id);

    if (!sow) {
      return res.status(404).json({
        success: false,
        error: 'SOW not found',
      });
    }

    // Include sections with the SOW
    const sections = await listSections(id);

    return res.status(200).json({
      success: true,
      data: { ...sow, sections },
    });
  } catch (error) {
    console.error('Error fetching SOW:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

async function handlePut(id, req, res) {
  try {
    const {
      title, status, content, transcriptText, diagnosticSnapshot,
      diagnosticResultIds, overallRating, totalHours, totalInvestment,
      startDate, endDate, teamworkProjectId, teamworkProjectUrl, currentVersion,
    } = req.body;

    // Build the update object, mapping camelCase to snake_case where needed
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (status !== undefined) updates.status = status;
    if (content !== undefined) updates.content = content;
    if (transcriptText !== undefined) updates.transcript_text = transcriptText;
    if (diagnosticSnapshot !== undefined) updates.diagnostic_snapshot = diagnosticSnapshot;
    if (diagnosticResultIds !== undefined) updates.diagnostic_result_ids = diagnosticResultIds;
    if (overallRating !== undefined) updates.overall_rating = overallRating;
    if (totalHours !== undefined) updates.total_hours = totalHours;
    if (totalInvestment !== undefined) updates.total_investment = totalInvestment;
    if (startDate !== undefined) updates.start_date = startDate;
    if (endDate !== undefined) updates.end_date = endDate;
    if (teamworkProjectId !== undefined) updates.teamwork_project_id = teamworkProjectId;
    if (teamworkProjectUrl !== undefined) updates.teamwork_project_url = teamworkProjectUrl;
    if (currentVersion !== undefined) updates.current_version = currentVersion;

    const sow = await updateSow(id, updates);

    if (!sow) {
      return res.status(404).json({
        success: false,
        error: 'SOW not found or update failed',
      });
    }

    return res.status(200).json({
      success: true,
      data: sow,
    });
  } catch (error) {
    console.error('Error updating SOW:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

async function handleDelete(id, req, res) {
  try {
    const success = await deleteSow(id);

    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete SOW',
      });
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting SOW:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
