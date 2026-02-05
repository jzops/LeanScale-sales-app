/**
 * API endpoint for SOW generation
 * POST /api/sow/generate - Generate a new SOW with optional AI content via n8n
 *
 * Accepts:
 *   - sowType (required): 'clay' | 'q2c' | 'embedded' | 'custom'
 *   - customerId (optional): UUID of the customer
 *   - transcriptText (optional): Sales call transcript
 *   - intakeSubmissionId (optional): UUID of a form_submissions record
 *   - diagnosticSnapshot (optional): Diagnostic data object
 *   - createdBy (optional): Who created this SOW
 *
 * Flow:
 *   1. Validate input
 *   2. Look up customer info (if customerId provided)
 *   3. Look up intake submission (if intakeSubmissionId provided)
 *   4. Call n8n webhook for AI-generated content (if configured)
 *   5. Fall back to template SOW if n8n is unavailable
 *   6. Persist SOW via createSow
 *   7. Send Slack notification
 *   8. Return created SOW
 */

import { createSow } from '../../../lib/sow';
import { supabase } from '../../../lib/supabase';
import { notifySowCreated } from '../../../lib/slack';

// Valid SOW types
const VALID_SOW_TYPES = ['clay', 'q2c', 'embedded', 'custom'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const {
      sowType,
      customerId,
      transcriptText,
      intakeSubmissionId,
      diagnosticSnapshot,
      createdBy,
    } = req.body;

    // Validate sowType
    if (!sowType || !VALID_SOW_TYPES.includes(sowType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sowType. Must be one of: ${VALID_SOW_TYPES.join(', ')}`,
      });
    }

    // Step 1: Look up customer info (optional)
    let customerData = null;
    if (customerId && supabase) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .single();

        if (!error && data) {
          customerData = data;
        }
      } catch (err) {
        console.error('Customer lookup failed:', err);
        // Continue without customer data
      }
    }

    const customerName = customerData?.name || null;

    // Step 2: Look up intake submission (optional)
    let intakeSubmission = null;
    if (intakeSubmissionId && supabase) {
      try {
        const { data, error } = await supabase
          .from('form_submissions')
          .select('*')
          .eq('id', intakeSubmissionId)
          .single();

        if (!error && data) {
          intakeSubmission = data;
        }
      } catch (err) {
        console.error('Intake submission lookup failed:', err);
        // Continue without intake data
      }
    }

    // Step 3: Generate SOW content
    let content = null;

    // Try n8n webhook if configured
    if (process.env.N8N_SOW_WEBHOOK_URL) {
      try {
        const response = await fetch(process.env.N8N_SOW_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: customerData,
            sowType,
            transcript: transcriptText,
            intakeData: intakeSubmission?.data,
            diagnosticData: diagnosticSnapshot,
          }),
        });

        if (response.ok) {
          content = await response.json();
        } else {
          const errorText = await response.text();
          console.error('n8n webhook returned error:', response.status, errorText);
          // Fall through to template
        }
      } catch (err) {
        console.error('n8n webhook call failed:', err);
        // Fall through to template
      }
    }

    // Fall back to template if n8n didn't produce content
    if (!content) {
      content = buildTemplateContent(customerName, sowType);
    }

    // Step 4: Build title
    const title = customerName
      ? `SOW for ${customerName} — ${sowType} engagement`
      : `SOW — ${sowType} engagement`;

    // Step 5: Persist the SOW
    const sow = await createSow({
      customerId,
      title,
      sowType,
      intakeSubmissionId,
      transcriptText,
      diagnosticSnapshot,
      content,
      createdBy,
    });

    if (!sow) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create SOW',
      });
    }

    // Step 6: Send Slack notification (fire-and-forget)
    try {
      await notifySowCreated(customerName || 'Unknown', sowType, sow.id);
    } catch (err) {
      console.error('Slack notification failed (non-fatal):', err);
      // Don't fail the request for a notification error
    }

    return res.status(201).json({
      success: true,
      data: sow,
    });
  } catch (error) {
    console.error('Error generating SOW:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Build a template/placeholder SOW structure when n8n is not available
 */
function buildTemplateContent(customerName, sowType) {
  return {
    executive_summary: `Statement of Work for ${customerName || 'Customer'} — ${sowType} engagement.`,
    client_info: {
      company: customerName || '',
      primary_contact: '',
      stage: '',
      crm: '',
      industry: '',
    },
    scope: [
      {
        title: 'Project Scope',
        description: 'To be defined based on discovery.',
        deliverables: ['Discovery and assessment', 'Implementation plan', 'System configuration'],
      },
    ],
    deliverables_table: [
      { deliverable: 'Discovery Document', description: 'Current state assessment', integration: 'N/A' },
      { deliverable: 'Implementation Plan', description: 'Detailed project roadmap', integration: 'CRM / GTM Stack' },
    ],
    timeline: [
      { phase: 'Week 1-2', activities: 'Discovery and assessment', duration: '10 days' },
      { phase: 'Week 3-4', activities: 'Implementation', duration: '10 days' },
    ],
    investment: {
      total: 0,
      payment_terms: 'To be determined',
      breakdown: [],
    },
    team: [
      { role: 'Principal Project Owner', responsibility: 'Strategy and oversight' },
      { role: 'Architect', responsibility: 'Hands-on implementation' },
    ],
    assumptions: [
      'Client will provide timely access to systems and stakeholders',
      'Scope changes require mutual agreement and may affect timeline/investment',
    ],
    acceptance_criteria: [
      'All deliverables completed and reviewed',
      'Client sign-off on implementation',
    ],
  };
}
