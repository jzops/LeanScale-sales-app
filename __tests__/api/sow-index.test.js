/**
 * Tests for pages/api/sow/index.js - List and Create SOW API
 */

// Mock lib/sow before importing the handler
jest.mock('../../lib/sow', () => ({
  listSows: jest.fn(),
  createSow: jest.fn(),
}));

const { listSows, createSow } = require('../../lib/sow');

// We need to import the handler after mocks are set up
let handler;

beforeAll(() => {
  handler = require('../../pages/api/sow/index').default;
});

// Helper to create mock req/res objects
function createMocks({ method = 'GET', query = {}, body = {} } = {}) {
  const req = {
    method,
    query,
    body,
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return { req, res };
}

describe('GET /api/sow', () => {
  test('returns list of SOWs', async () => {
    const mockSows = [
      { id: '1', title: 'SOW 1', status: 'draft' },
      { id: '2', title: 'SOW 2', status: 'sent' },
    ];
    listSows.mockResolvedValue(mockSows);

    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockSows,
    });
  });

  test('passes customerId filter to listSows', async () => {
    listSows.mockResolvedValue([]);

    const { req, res } = createMocks({
      method: 'GET',
      query: { customerId: 'cust-1' },
    });
    await handler(req, res);

    expect(listSows).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: 'cust-1' })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('passes status filter to listSows', async () => {
    listSows.mockResolvedValue([]);

    const { req, res } = createMocks({
      method: 'GET',
      query: { status: 'draft' },
    });
    await handler(req, res);

    expect(listSows).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft' })
    );
  });

  test('handles errors gracefully', async () => {
    listSows.mockRejectedValue(new Error('Database error'));

    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.any(String),
      })
    );
  });
});

describe('POST /api/sow', () => {
  test('creates a SOW with valid data', async () => {
    const newSow = { id: 'new-1', title: 'New SOW', sow_type: 'clay' };
    createSow.mockResolvedValue(newSow);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        title: 'New SOW',
        sowType: 'clay',
        customerId: 'cust-1',
      },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: newSow,
    });
  });

  test('validates title is required', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('title'),
      })
    );
  });

  test('validates sowType is required', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { title: 'Test SOW' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('sowType'),
      })
    );
  });

  test('validates sowType is a valid value', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { title: 'Test SOW', sowType: 'invalid' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('sowType'),
      })
    );
  });

  test('passes all optional fields to createSow', async () => {
    const newSow = { id: 'new-1', title: 'Full SOW' };
    createSow.mockResolvedValue(newSow);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        title: 'Full SOW',
        sowType: 'embedded',
        customerId: 'cust-1',
        intakeSubmissionId: 'sub-1',
        transcriptText: 'some transcript',
        diagnosticSnapshot: { data: true },
        content: { sections: [] },
        createdBy: 'admin',
      },
    });
    await handler(req, res);

    expect(createSow).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Full SOW',
        sowType: 'embedded',
        customerId: 'cust-1',
        intakeSubmissionId: 'sub-1',
        transcriptText: 'some transcript',
        diagnosticSnapshot: { data: true },
        content: { sections: [] },
        createdBy: 'admin',
      })
    );
  });

  test('handles createSow returning null', async () => {
    createSow.mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      body: { title: 'Test SOW', sowType: 'clay' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      })
    );
  });

  test('handles errors gracefully', async () => {
    createSow.mockRejectedValue(new Error('Insert failed'));

    const { req, res } = createMocks({
      method: 'POST',
      body: { title: 'Test SOW', sowType: 'clay' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.any(String),
      })
    );
  });
});

describe('Method validation', () => {
  test('returns 405 for PUT', async () => {
    const { req, res } = createMocks({ method: 'PUT' });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Method not allowed',
      })
    );
  });

  test('returns 405 for DELETE', async () => {
    const { req, res } = createMocks({ method: 'DELETE' });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});
