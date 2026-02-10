/**
 * API endpoint for intake form submissions
 * POST /api/intake/submit
 *
 * Accepts intake form data, saves to Supabase, and sends Slack notification.
 * Follows the same pattern as /api/submit-form.js.
 */

import {
  getCustomerBySlug,
  insertFormSubmission,
  updateSlackNotified,
} from '../../../lib/supabase';
import { sendToSlack } from '../../../lib/slack';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { configId, customerSlug, data } = req.body;

    // ========================================
    // VALIDATION
    // ========================================

    if (!configId || typeof configId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'configId is required',
      });
    }

    if (!customerSlug || typeof customerSlug !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'customerSlug is required',
      });
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: 'data must be a non-empty object',
      });
    }

    // ========================================
    // LOOKUP CUSTOMER
    // ========================================

    let customer;
    try {
      customer = await getCustomerBySlug(customerSlug);
      if (!customer) {
        return res.status(400).json({
          success: false,
          error: `Customer not found: ${customerSlug}`,
        });
      }
    } catch (error) {
      console.error('Customer lookup failed:', error.message);
      return res.status(400).json({
        success: false,
        error: `Customer not found: ${customerSlug}`,
      });
    }

    // ========================================
    // SAVE TO SUPABASE
    // ========================================

    // Convert configId to form_type format (e.g., 'clay-intake' -> 'clay_intake')
    const formType = configId.replace(/-/g, '_');

    let submission;
    try {
      submission = await insertFormSubmission({
        customerId: customer.id,
        formType,
        data,
        slackNotified: false,
      });

      if (!submission) {
        console.warn('Intake submission not saved (Supabase not configured)');
        submission = { id: 'local-' + Date.now() };
      }
    } catch (error) {
      console.error('Failed to save intake submission:', error.message);
      submission = { id: 'error-' + Date.now() };
    }

    // ========================================
    // SEND SLACK NOTIFICATION
    // ========================================

    let slackSuccess = false;
    try {
      const selectedProjects = data.selectedProjects || [];
      const customerName = customer.name || customerSlug;

      const slackPayload = formatIntakeSlackMessage(configId, customerName, selectedProjects, data);
      slackSuccess = await sendToSlack(slackPayload);

      if (slackSuccess && submission?.id && !submission.id.startsWith('local-') && !submission.id.startsWith('error-')) {
        await updateSlackNotified(submission.id, true);
      }
    } catch (error) {
      console.error('Slack notification error:', error.message);
    }

    // ========================================
    // SUCCESS RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,
      id: submission?.id || null,
      slackNotified: slackSuccess,
    });
  } catch (error) {
    console.error('Unexpected error in intake/submit:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Format an intake submission for Slack notification
 */
function formatIntakeSlackMessage(configId, customerName, selectedProjects, formData) {
  const title = `New Intake Submission: ${configId}`;

  const projectList = selectedProjects.length > 0
    ? selectedProjects.join(', ')
    : 'None selected';

  // Build field blocks from form data (excluding selectedProjects)
  const fields = Object.entries(formData)
    .filter(([key, value]) => key !== 'selectedProjects' && value !== undefined && value !== '')
    .slice(0, 10) // Slack limits fields
    .map(([key, value]) => {
      const label = key
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      const displayValue = Array.isArray(value) ? value.join(', ') : String(value);

      return {
        type: 'mrkdwn',
        text: `*${label}:*\n${displayValue}`,
      };
    });

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: title,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Customer:* ${customerName}\n*Selected Projects:* ${projectList}`,
        },
      },
      { type: 'divider' },
      ...(fields.length > 0
        ? [{ type: 'section', fields }]
        : []),
      { type: 'divider' },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Submitted at ${new Date().toLocaleString('en-US', {
              timeZone: 'America/New_York',
              dateStyle: 'medium',
              timeStyle: 'short',
            })} ET`,
          },
        ],
      },
    ],
  };
}
