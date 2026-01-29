/**
 * API endpoint for handling form submissions
 * POST /api/submit-form
 *
 * Accepts form data, saves to Supabase, and sends Slack notification
 */

import {
  getCustomerBySlug,
  insertFormSubmission,
  updateSlackNotified,
  decrementAvailability,
} from '../../lib/supabase';
import { notifyFormSubmission, notifyAvailabilityUpdate } from '../../lib/slack';

// Valid form types
const VALID_FORM_TYPES = ['getting_started', 'diagnostic_intake', 'contact'];

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { formType, customerSlug, data } = req.body;

    // ========================================
    // VALIDATION
    // ========================================

    if (!formType || !VALID_FORM_TYPES.includes(formType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid formType. Must be one of: ${VALID_FORM_TYPES.join(', ')}`,
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

    let submission;
    try {
      submission = await insertFormSubmission({
        customerId: customer.id,
        formType,
        data,
        slackNotified: false,
      });

      if (!submission) {
        // If Supabase not configured, continue without saving
        console.warn('Form submission not saved (Supabase not configured)');
        submission = { id: 'local-' + Date.now() };
      }
    } catch (error) {
      console.error('Failed to save form submission:', error.message);
      // Continue anyway - we want to at least send the Slack notification
      submission = { id: 'error-' + Date.now() };
    }

    // ========================================
    // SEND SLACK NOTIFICATION
    // ========================================

    let slackSuccess = false;
    try {
      slackSuccess = await notifyFormSubmission(
        formType,
        customer.name || customerSlug,
        data
      );

      if (slackSuccess && submission?.id && !submission.id.startsWith('local-') && !submission.id.startsWith('error-')) {
        await updateSlackNotified(submission.id, true);
      }
    } catch (error) {
      console.error('Slack notification error:', error.message);
      // Don't fail the request if Slack fails
    }

    // ========================================
    // UPDATE AVAILABILITY (getting_started only)
    // ========================================

    if (formType === 'getting_started' && data.startDate) {
      try {
        const availabilityUpdate = await decrementAvailability(data.startDate);

        if (availabilityUpdate) {
          console.log(`Updated availability for ${data.startDate}:`, availabilityUpdate);

          // Send availability alert if spots are low
          if (availabilityUpdate.spotsLeft <= 2) {
            await notifyAvailabilityUpdate(data.startDate, availabilityUpdate.spotsLeft);
          }
        }
      } catch (error) {
        console.error('Availability update error:', error.message);
        // Don't fail the request
      }
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
    console.error('Unexpected error in submit-form:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
