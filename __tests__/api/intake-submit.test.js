/**
 * Tests for pages/api/intake/submit.js
 *
 * Validates the intake submission API endpoint follows
 * the same pattern as submit-form.js.
 */

// Mock the supabase and slack modules before importing handler
jest.mock('../../lib/supabase', () => ({
  getCustomerBySlug: jest.fn(),
  insertFormSubmission: jest.fn(),
  updateSlackNotified: jest.fn(),
}));

jest.mock('../../lib/slack', () => ({
  sendToSlack: jest.fn(),
  notifyFormSubmission: jest.fn(),
}));

const handler = require('../../pages/api/intake/submit').default;
const { getCustomerBySlug, insertFormSubmission, updateSlackNotified } = require('../../lib/supabase');
const { sendToSlack, notifyFormSubmission } = require('../../lib/slack');

// Helper to create mock req/res
function createMocks({ method = 'POST', body = {} } = {}) {
  const req = {
    method,
    body,
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return { req, res };
}

describe('POST /api/intake/submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 405 for non-POST methods', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('returns 400 when configId is missing', async () => {
    const { req, res } = createMocks({
      body: { customerSlug: 'demo', data: { foo: 'bar' } },
    });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: expect.stringContaining('configId') })
    );
  });

  test('returns 400 when customerSlug is missing', async () => {
    const { req, res } = createMocks({
      body: { configId: 'clay-intake', data: { foo: 'bar' } },
    });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: expect.stringContaining('customerSlug') })
    );
  });

  test('returns 400 when data is missing or not an object', async () => {
    const { req, res } = createMocks({
      body: { configId: 'clay-intake', customerSlug: 'demo' },
    });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: expect.stringContaining('data') })
    );
  });

  test('returns 400 when customer not found', async () => {
    getCustomerBySlug.mockResolvedValue(null);

    const { req, res } = createMocks({
      body: {
        configId: 'clay-intake',
        customerSlug: 'nonexistent',
        data: { selectedProjects: ['market-map'] },
      },
    });

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: expect.stringContaining('not found') })
    );
  });

  test('saves submission to Supabase with correct form_type', async () => {
    getCustomerBySlug.mockResolvedValue({ id: 'cust-1', name: 'Test Co', slug: 'test-co' });
    insertFormSubmission.mockResolvedValue({ id: 'sub-1' });
    sendToSlack.mockResolvedValue(true);
    notifyFormSubmission.mockResolvedValue(true);

    const formData = {
      selectedProjects: ['market-map', 'lead-scoring'],
      crm_type: 'Salesforce',
    };

    const { req, res } = createMocks({
      body: {
        configId: 'clay-intake',
        customerSlug: 'test-co',
        data: formData,
      },
    });

    await handler(req, res);

    expect(insertFormSubmission).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 'cust-1',
        formType: 'clay_intake',
        data: formData,
        slackNotified: false,
      })
    );
  });

  test('sends Slack notification on successful submission', async () => {
    getCustomerBySlug.mockResolvedValue({ id: 'cust-1', name: 'Test Co', slug: 'test-co' });
    insertFormSubmission.mockResolvedValue({ id: 'sub-1' });
    sendToSlack.mockResolvedValue(true);

    const { req, res } = createMocks({
      body: {
        configId: 'clay-intake',
        customerSlug: 'test-co',
        data: { selectedProjects: ['market-map'] },
      },
    });

    await handler(req, res);

    expect(sendToSlack).toHaveBeenCalled();
  });

  test('returns success response with id', async () => {
    getCustomerBySlug.mockResolvedValue({ id: 'cust-1', name: 'Test Co', slug: 'test-co' });
    insertFormSubmission.mockResolvedValue({ id: 'sub-42' });
    sendToSlack.mockResolvedValue(true);

    const { req, res } = createMocks({
      body: {
        configId: 'clay-intake',
        customerSlug: 'test-co',
        data: { selectedProjects: ['market-map'] },
      },
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        id: 'sub-42',
      })
    );
  });

  test('continues without saving when Supabase returns null', async () => {
    getCustomerBySlug.mockResolvedValue({ id: 'cust-1', name: 'Test Co', slug: 'test-co' });
    insertFormSubmission.mockResolvedValue(null);
    sendToSlack.mockResolvedValue(true);

    const { req, res } = createMocks({
      body: {
        configId: 'clay-intake',
        customerSlug: 'test-co',
        data: { selectedProjects: ['market-map'] },
      },
    });

    await handler(req, res);

    // Should still return success even if Supabase didn't save
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test('returns 400 when customer lookup throws an error', async () => {
    getCustomerBySlug.mockRejectedValue(new Error('DB connection failed'));

    const { req, res } = createMocks({
      body: {
        configId: 'clay-intake',
        customerSlug: 'test-co',
        data: { selectedProjects: ['market-map'] },
      },
    });

    await handler(req, res);

    // Customer lookup errors are caught and returned as 400
    // (matching the pattern from submit-form.js)
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('not found'),
      })
    );
  });

  test('returns 500 on truly unexpected errors', async () => {
    // Simulate an error that bypasses inner try/catch blocks
    // by making req.body throw when accessed
    const req = {
      method: 'POST',
      get body() {
        throw new Error('Unexpected crash');
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});
