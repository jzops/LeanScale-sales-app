/**
 * Diagnostic Sync Check
 * GET /api/sow/[id]/diagnostic-sync
 *
 * Compares the SOW's diagnostic_snapshot (frozen at creation) against
 * the current live diagnostic data to detect changes.
 *
 * Returns:
 *   { hasChanges, changes: { added, removed, statusChanged }, snapshotAt }
 */

import { getSowById } from '../../../../lib/sow';
import { getDiagnosticResult } from '../../../../lib/diagnostics';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const sow = await getSowById(id);
    if (!sow) {
      return res.status(404).json({ success: false, error: 'SOW not found' });
    }

    const snapshot = sow.diagnostic_snapshot;
    if (!snapshot || !snapshot.processes) {
      return res.status(200).json({
        success: true,
        data: { hasChanges: false, noSnapshot: true },
      });
    }

    // Fetch live diagnostic data
    if (!sow.customer_id || !sow.diagnostic_result_ids?.length) {
      return res.status(200).json({
        success: true,
        data: { hasChanges: false, noDiagnostic: true },
      });
    }

    // Try all diagnostic types to find the linked one
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
      return res.status(200).json({
        success: true,
        data: { hasChanges: false, diagnosticNotFound: true },
      });
    }

    // Compare snapshot vs live
    const snapshotMap = {};
    snapshot.processes.forEach(p => {
      snapshotMap[p.name] = p;
    });

    const liveMap = {};
    (liveResult.processes || []).forEach(p => {
      liveMap[p.name] = p;
    });

    const added = [];
    const removed = [];
    const statusChanged = [];

    // Find added items (in live but not in snapshot)
    for (const name of Object.keys(liveMap)) {
      if (!snapshotMap[name]) {
        added.push({
          name,
          status: liveMap[name].status,
        });
      }
    }

    // Find removed items (in snapshot but not in live)
    for (const name of Object.keys(snapshotMap)) {
      if (!liveMap[name]) {
        removed.push({
          name,
          previousStatus: snapshotMap[name].status,
        });
      }
    }

    // Find status changes
    for (const name of Object.keys(snapshotMap)) {
      if (liveMap[name] && liveMap[name].status !== snapshotMap[name].status) {
        statusChanged.push({
          name,
          previousStatus: snapshotMap[name].status,
          currentStatus: liveMap[name].status,
        });
      }
    }

    const hasChanges = added.length > 0 || removed.length > 0 || statusChanged.length > 0;

    return res.status(200).json({
      success: true,
      data: {
        hasChanges,
        changes: { added, removed, statusChanged },
        snapshotAt: snapshot.snapshotAt,
        totalChanges: added.length + removed.length + statusChanged.length,
      },
    });
  } catch (error) {
    console.error('Error checking diagnostic sync:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
