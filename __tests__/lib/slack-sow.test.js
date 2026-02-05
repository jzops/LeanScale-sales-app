/**
 * Tests for lib/slack.js - SOW notification functions (Phase 5 additions)
 *
 * Tests the new notifySowCreated function and its formatSowCreated helper
 * following the same pattern as existing notification functions.
 */

// Mock global fetch
const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  delete process.env.SLACK_WEBHOOK_URL;
});

// We need to require fresh modules to pick up env changes
let slackModule;

beforeEach(() => {
  jest.resetModules();
});

function loadSlack(webhookUrl) {
  if (webhookUrl) {
    process.env.SLACK_WEBHOOK_URL = webhookUrl;
  }
  slackModule = require('../../lib/slack');
}

describe('formatSowCreated', () => {
  beforeEach(() => loadSlack());

  test('returns a Slack Block Kit payload', () => {
    const payload = slackModule.formatSowCreated('Acme Corp', 'clay', 'sow-123');

    expect(payload).toHaveProperty('blocks');
    expect(Array.isArray(payload.blocks)).toBe(true);
  });

  test('includes header block with SOW creation title', () => {
    const payload = slackModule.formatSowCreated('Acme Corp', 'clay', 'sow-123');
    const header = payload.blocks.find(b => b.type === 'header');

    expect(header).toBeDefined();
    expect(header.text.text).toContain('SOW');
  });

  test('includes customer name in the message', () => {
    const payload = slackModule.formatSowCreated('Test Company', 'q2c', 'sow-456');

    const blockTexts = JSON.stringify(payload.blocks);
    expect(blockTexts).toContain('Test Company');
  });

  test('includes SOW type in the message', () => {
    const payload = slackModule.formatSowCreated('Acme Corp', 'embedded', 'sow-789');

    const blockTexts = JSON.stringify(payload.blocks);
    expect(blockTexts).toContain('embedded');
  });

  test('includes SOW ID in the message', () => {
    const payload = slackModule.formatSowCreated('Acme Corp', 'clay', 'sow-abc-123');

    const blockTexts = JSON.stringify(payload.blocks);
    expect(blockTexts).toContain('sow-abc-123');
  });

  test('handles missing customer name gracefully', () => {
    const payload = slackModule.formatSowCreated(null, 'clay', 'sow-1');

    expect(payload).toHaveProperty('blocks');
    // Should not throw
  });
});

describe('notifySowCreated', () => {
  test('calls sendToSlack with formatted payload', async () => {
    loadSlack('https://hooks.slack.com/test');

    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    const result = await slackModule.notifySowCreated('Acme Corp', 'clay', 'sow-123');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://hooks.slack.com/test',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      })
    );

    // Verify the body contains our SOW info
    const sentBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(sentBody).toHaveProperty('blocks');
    expect(result).toBe(true);
  });

  test('returns false when SLACK_WEBHOOK_URL is not configured', async () => {
    loadSlack(); // No webhook URL

    const result = await slackModule.notifySowCreated('Acme', 'clay', 'sow-1');
    expect(result).toBe(false);
  });

  test('returns false when Slack API returns error', async () => {
    loadSlack('https://hooks.slack.com/test');

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'invalid_payload',
    });

    const result = await slackModule.notifySowCreated('Acme', 'clay', 'sow-1');
    expect(result).toBe(false);
  });
});
