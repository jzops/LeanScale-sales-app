/**
 * POST /api/sow/from-engagement
 *
 * Create a SOW pre-populated from an engagement recommendation.
 * Called from the engagement overview page's "Build SOW" CTA.
 *
 * Body: {
 *   customerId: UUID,
 *   diagnosticResultId: UUID,
 *   recommendation: { summary, functionGroups, projectSequence, ... }
 * }
 */

import { createSow, updateSow } from '../../../lib/sow';
import { autoGenerateSow } from '../../../lib/sow-auto-builder';
import { bulkCreateSections } from '../../../lib/sow-sections';
import { getDiagnosticResult } from '../../../lib/diagnostics';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { customerId, diagnosticResultId, recommendation } = req.body;

    if (!customerId || !diagnosticResultId || !recommendation) {
      return res.status(400).json({
        success: false,
        error: 'customerId, diagnosticResultId, and recommendation are required',
      });
    }

    const { summary } = recommendation;
    const customerName = recommendation.customerName || '';

    // Fetch diagnostic result for the auto-builder
    const diagnosticResult = await getDiagnosticResult(customerId, recommendation.diagnosticType || 'gtm');
    const processes = diagnosticResult?.processes || [];

    // Use auto-builder to generate sections
    const {
      sections: sectionDefs,
      executiveSummary,
      statusCounts,
    } = await autoGenerateSow({
      processes,
      groupBy: 'function',
      customerName,
      diagnosticType: recommendation.diagnosticType || 'gtm',
    });

    // Determine overall rating
    const criticalPct = (statusCounts.warning + statusCounts.unable) / (processes.length || 1);
    let overallRating = 'healthy';
    if (criticalPct > 0.5) overallRating = 'critical';
    else if (criticalPct > 0.3) overallRating = 'warning';
    else if (criticalPct > 0.1) overallRating = 'moderate';

    const title = customerName
      ? `${customerName} Statement of Work`
      : 'Statement of Work';

    // Create SOW
    const sow = await createSow({
      customerId,
      title,
      sowType: 'custom',
      content: {
        executive_summary: executiveSummary,
        client_info: customerName ? { company: customerName } : {},
        assumptions: [
          'Client will provide timely access to required systems and stakeholders.',
          'Scope changes will be managed through a change request process.',
          'All work will be performed remotely unless otherwise agreed.',
        ],
        acceptance_criteria: [
          'Deliverables reviewed and approved by client stakeholder.',
          'Knowledge transfer session completed for each section.',
        ],
      },
    });

    if (!sow) {
      return res.status(500).json({ success: false, error: 'Failed to create SOW' });
    }

    // Link diagnostic and set rating
    await updateSow(sow.id, {
      diagnostic_result_ids: [diagnosticResultId],
      overall_rating: overallRating,
      diagnostic_snapshot: {
        processes: processes.map(p => ({
          name: p.name,
          status: p.status,
          addToEngagement: p.addToEngagement,
          function: p.function,
          outcome: p.outcome,
        })),
        snapshotAt: new Date().toISOString(),
      },
    });

    // Create sections
    let generatedSections = [];
    if (sectionDefs.length > 0) {
      generatedSections = await bulkCreateSections(sow.id, sectionDefs);

      // Update SOW totals
      let totalHours = 0, totalInvestment = 0;
      generatedSections.forEach(s => {
        const h = parseFloat(s.hours) || 0;
        const r = parseFloat(s.rate) || 0;
        totalHours += h;
        totalInvestment += h * r;
      });

      await updateSow(sow.id, {
        total_hours: totalHours,
        total_investment: totalInvestment,
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        ...sow,
        sections: generatedSections,
      },
    });
  } catch (error) {
    console.error('Error in from-engagement SOW:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
