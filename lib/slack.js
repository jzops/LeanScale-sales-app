/**
 * Slack notification helper for form submissions
 * Uses Slack Block Kit for rich formatting
 */

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

/**
 * Send a notification to Slack
 * @param {Object} payload - Slack message payload with blocks
 * @returns {Promise<boolean>} Success status
 */
export async function sendToSlack(payload) {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('SLACK_WEBHOOK_URL not configured, skipping notification');
    return false;
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Slack notification failed:', response.status, text);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Slack notification error:', error);
    return false;
  }
}

/**
 * Format a form submission for Slack notification
 * @param {string} formType - Type of form (getting_started, diagnostic_intake, contact)
 * @param {string} customerName - Customer/company name
 * @param {Object} formData - Form field values
 * @returns {Object} Slack Block Kit payload
 */
export function formatFormSubmission(formType, customerName, formData) {
  const formTypeLabels = {
    getting_started: '🚀 New Getting Started Submission',
    diagnostic_intake: '📋 New Diagnostic Intake',
    contact: '📬 New Contact Form',
  };

  const title = formTypeLabels[formType] || '📝 New Form Submission';

  // Build field blocks from form data
  const fields = Object.entries(formData)
    .filter(([_, value]) => value !== undefined && value !== '')
    .map(([key, value]) => {
      // Convert camelCase to readable label
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();

      return {
        type: 'mrkdwn',
        text: `*${label}:*\n${value}`,
      };
    });

  // Slack Block Kit message
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
          text: `*Customer:* ${customerName}`,
        },
      },
      { type: 'divider' },
      // Split fields into sections (Slack limits 10 per section)
      ...chunkArray(fields, 10).map(chunk => ({
        type: 'section',
        fields: chunk,
      })),
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

/**
 * Format an availability alert for Slack
 * @param {string} cohortDate - The cohort date
 * @param {number} spotsLeft - Remaining spots
 * @returns {Object} Slack Block Kit payload
 */
export function formatAvailabilityAlert(cohortDate, spotsLeft) {
  const urgency = spotsLeft <= 1 ? '🔴 CRITICAL' : spotsLeft <= 2 ? '🟡 LOW' : '🟢 OK';

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${urgency} Cohort Availability Update`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Cohort Date:*\n${cohortDate}`,
          },
          {
            type: 'mrkdwn',
            text: `*Spots Remaining:*\n${spotsLeft}`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: spotsLeft <= 1
              ? '⚠️ This cohort is nearly full!'
              : `Updated at ${new Date().toISOString()}`,
          },
        ],
      },
    ],
  };
}

/**
 * Send a formatted form submission to Slack
 */
export async function notifyFormSubmission(formType, customerName, formData) {
  const payload = formatFormSubmission(formType, customerName, formData);
  return sendToSlack(payload);
}

/**
 * Send an availability alert to Slack
 */
export async function notifyAvailabilityUpdate(cohortDate, spotsLeft) {
  const payload = formatAvailabilityAlert(cohortDate, spotsLeft);
  return sendToSlack(payload);
}

/**
 * Format a SOW creation event for Slack notification
 * @param {string} customerName - Customer/company name
 * @param {string} sowType - SOW type (clay, q2c, embedded, custom)
 * @param {string} sowId - ID of the created SOW
 * @returns {Object} Slack Block Kit payload
 */
export function formatSowCreated(customerName, sowType, sowId) {
  const typeLabels = {
    clay: 'Clay',
    q2c: 'Q2C',
    embedded: 'Embedded',
    custom: 'Custom',
  };

  const typeLabel = typeLabels[sowType] || sowType;
  const displayName = customerName || 'Unknown Customer';

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `New SOW Generated`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Customer:*\n${displayName}`,
          },
          {
            type: 'mrkdwn',
            text: `*SOW Type:*\n${typeLabel} (${sowType})`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*SOW ID:*\n${sowId}`,
          },
        ],
      },
      { type: 'divider' },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Generated at ${new Date().toLocaleString('en-US', {
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

/**
 * Send a SOW creation notification to Slack
 */
export async function notifySowCreated(customerName, sowType, sowId) {
  const payload = formatSowCreated(customerName, sowType, sowId);
  return sendToSlack(payload);
}

// Helper: chunk array into smaller arrays
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export default {
  sendToSlack,
  formatFormSubmission,
  formatAvailabilityAlert,
  formatSowCreated,
  notifyFormSubmission,
  notifyAvailabilityUpdate,
  notifySowCreated,
};
