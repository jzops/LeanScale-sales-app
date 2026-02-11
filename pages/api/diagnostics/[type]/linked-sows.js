/**
 * Linked SOWs API
 * GET /api/diagnostics/[type]/linked-sows?customerId=...
 *
 * Returns all SOWs that are linked to the diagnostic result for the given
 * customer and diagnostic type. Used by the diagnostic page to show
 * "You have X linked SOWs" toast after auto-save.
 */

import { getDiagnosticResult } from '../../../../lib/diagnostics';
import { listSows } from '../../../../lib/sow';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { type, customerId } = req.query;

  if (!customerId) {
    return res.status(400).json({ success: false, error: 'Missing customerId' });
  }

  try {
    // Get the diagnostic result for this customer + type
    const diagResult = await getDiagnosticResult(customerId, type);
    if (!diagResult) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Get all SOWs for this customer
    const sows = await listSows({ customerId });

    // Filter to SOWs that reference this diagnostic result
    const linkedSows = sows.filter(s =>
      s.diagnostic_result_ids && s.diagnostic_result_ids.includes(diagResult.id)
    );

    return res.status(200).json({
      success: true,
      data: linkedSows.map(s => ({
        id: s.id,
        title: s.title,
        status: s.status,
        totalHours: s.total_hours,
        totalInvestment: s.total_investment,
        createdAt: s.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching linked SOWs:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
