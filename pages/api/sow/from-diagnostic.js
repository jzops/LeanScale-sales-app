/**
 * API endpoint to create a SOW pre-loaded with diagnostic items
 * POST /api/sow/from-diagnostic
 *
 * Body: {
 *   customerId: UUID,
 *   diagnosticResultId: UUID,
 *   diagnosticType: 'gtm' | 'clay' | 'cpq',
 *   customerName: string (for auto-generating title),
 *   sowType: 'clay' | 'q2c' | 'embedded' | 'custom',
 *   createdBy: string
 * }
 *
 * Creates a new SOW linked to the diagnostic result with status 'draft',
 * then returns the SOW so the user can be redirected to /sow/[id]/build.
 */

import { createSow } from '../../../lib/sow';
import { getDiagnosticResult } from '../../../lib/diagnostics';

const VALID_SOW_TYPES = ['clay', 'q2c', 'embedded', 'custom'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      customerId,
      diagnosticResultId,
      diagnosticType,
      customerName,
      sowType,
      createdBy,
    } = req.body;

    if (!customerId) {
      return res.status(400).json({ success: false, error: 'customerId is required' });
    }
    if (!diagnosticResultId) {
      return res.status(400).json({ success: false, error: 'diagnosticResultId is required' });
    }
    if (!sowType || !VALID_SOW_TYPES.includes(sowType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sowType. Must be one of: ${VALID_SOW_TYPES.join(', ')}`,
      });
    }

    // Fetch the diagnostic result to get processes data
    const diagnosticResult = await getDiagnosticResult(customerId, diagnosticType || 'gtm');

    if (!diagnosticResult) {
      return res.status(404).json({
        success: false,
        error: 'Diagnostic result not found for this customer',
      });
    }

    // Compute an overall rating from the diagnostic processes
    const processes = diagnosticResult.processes || [];
    const statusCounts = { warning: 0, unable: 0, careful: 0, healthy: 0 };
    processes.forEach(p => {
      if (statusCounts[p.status] !== undefined) {
        statusCounts[p.status]++;
      }
    });

    let overallRating = 'healthy';
    const criticalPct = (statusCounts.warning + statusCounts.unable) / (processes.length || 1);
    if (criticalPct > 0.5) overallRating = 'critical';
    else if (criticalPct > 0.3) overallRating = 'warning';
    else if (criticalPct > 0.1) overallRating = 'moderate';

    // Auto-generate title
    const title = customerName
      ? `${customerName} Statement of Work`
      : 'Statement of Work';

    // Create the SOW with diagnostic links
    const sow = await createSow({
      customerId,
      title,
      sowType,
      content: {
        executive_summary: '',
        client_info: customerName ? { company: customerName } : {},
        scope: [],
        deliverables_table: [],
        timeline: [],
        investment: { total: 0, payment_terms: '', breakdown: [] },
        team: [],
        assumptions: [],
        acceptance_criteria: [],
      },
      createdBy,
    });

    if (!sow) {
      return res.status(500).json({ success: false, error: 'Failed to create SOW' });
    }

    // Now update the SOW with the new diagnostic-linked fields
    // (createSow doesn't support these yet, so we update after creation)
    const { updateSow } = await import('../../../lib/sow');
    await updateSow(sow.id, {
      diagnostic_result_ids: [diagnosticResultId],
      overall_rating: overallRating,
      diagnostic_snapshot: {
        processes: processes.map(p => ({
          name: p.name,
          status: p.status,
          addToEngagement: p.addToEngagement,
        })),
        snapshotAt: new Date().toISOString(),
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        ...sow,
        diagnostic_result_ids: [diagnosticResultId],
        overall_rating: overallRating,
      },
      diagnosticProcesses: processes,
    });
  } catch (error) {
    console.error('Error creating SOW from diagnostic:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
