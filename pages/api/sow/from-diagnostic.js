/**
 * API endpoint to create a SOW pre-loaded with diagnostic items
 * POST /api/sow/from-diagnostic
 */

import { createSow } from '../../../lib/sow';
import { getDiagnosticResult } from '../../../lib/diagnostics';
import { withAuth } from '../../../lib/api-middleware';
import { withErrorHandler, Errors } from '../../../lib/api-errors';
import { validate, sowFromDiagnosticBody } from '../../../lib/api-validation';

async function handler(req, res) {
  if (req.method !== 'POST') {
    throw Errors.methodNotAllowed(req.method);
  }

  const data = validate(sowFromDiagnosticBody, req.body);

  const {
    customerId,
    diagnosticResultId,
    diagnosticType,
    customerName,
    sowType,
    createdBy,
  } = data;

  // Fetch the diagnostic result to get processes data
  const diagnosticResult = await getDiagnosticResult(customerId, diagnosticType);

  if (!diagnosticResult) {
    throw Errors.notFound('Diagnostic result');
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
    throw Errors.internal('Failed to create SOW');
  }

  // Update the SOW with the new diagnostic-linked fields
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
}

export default withAuth(withErrorHandler(handler), { level: 'admin' });
