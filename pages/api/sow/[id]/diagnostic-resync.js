/**
 * Diagnostic Re-sync
 * POST /api/sow/[id]/diagnostic-resync
 *
 * Updates the SOW's diagnostic_snapshot to the current live diagnostic state.
 * Called when the user clicks "Update SOW" on the sync banner.
 */

import { getSowById, updateSow } from '../../../../lib/sow';
import { getDiagnosticResult } from '../../../../lib/diagnostics';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const sow = await getSowById(id);
    if (!sow) {
      return res.status(404).json({ success: false, error: 'SOW not found' });
    }

    if (!sow.customer_id || !sow.diagnostic_result_ids?.length) {
      return res.status(400).json({
        success: false,
        error: 'SOW is not linked to a diagnostic',
      });
    }

    // Fetch live diagnostic data
    let liveResult = null;
    const types = ['gtm', 'clay', 'cpq'];
    for (const type of types) {
      const result = await getDiagnosticResult(sow.customer_id, type);
      if (result && sow.diagnostic_result_ids.includes(result.id)) {
        liveResult = result;
        break;
      }
    }

    if (!liveResult) {
      return res.status(404).json({
        success: false,
        error: 'Linked diagnostic result not found',
      });
    }

    // Update the snapshot
    const updated = await updateSow(id, {
      diagnostic_snapshot: {
        processes: (liveResult.processes || []).map(p => ({
          name: p.name,
          status: p.status,
          addToEngagement: p.addToEngagement,
        })),
        snapshotAt: new Date().toISOString(),
      },
    });

    if (!updated) {
      return res.status(500).json({ success: false, error: 'Failed to update snapshot' });
    }

    return res.status(200).json({
      success: true,
      data: { snapshotAt: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error re-syncing diagnostic:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
