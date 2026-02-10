/**
 * Tests for pages/api/diagnostic-snapshots/index.js
 */

jest.mock('../../lib/sow', () => ({
  listDiagnosticSnapshots: jest.fn(),
  createDiagnosticSnapshot: jest.fn(),
}));

const { listDiagnosticSnapshots, createDiagnosticSnapshot } = require('../../lib/sow');

let handler;

beforeAll(() => {
  handler = require('../../pages/api/diagnostic-snapshots/index').default;
});

function createMocks({ method = 'GET', query = {}, body = {} } = {}) {
  const req = { method, query, body };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return { req, res };
}

describe('GET /api/diagnostic-snapshots', () => {
  test('returns list of snapshots', async () => {
    const mockSnapshots = [
      { id: '1', diagnostic_type: 'gtm', data: { score: 85 } },
      { id: '2', diagnostic_type: 'clay', data: { score: 90 } },
    ];
    listDiagnosticSnapshots.mockResolvedValue(mockSnapshots);

    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockSnapshots,
    });
  });

  test('passes customerId filter', async () => {
    listDiagnosticSnapshots.mockResolvedValue([]);

    const { req, res } = createMocks({
      method: 'GET',
      query: { customerId: 'cust-1' },
    });
    await handler(req, res);

    expect(listDiagnosticSnapshots).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: 'cust-1' })
    );
  });

  test('passes diagnosticType filter', async () => {
    listDiagnosticSnapshots.mockResolvedValue([]);

    const { req, res } = createMocks({
      method: 'GET',
      query: { diagnosticType: 'gtm' },
    });
    await handler(req, res);

    expect(listDiagnosticSnapshots).toHaveBeenCalledWith(
      expect.objectContaining({ diagnosticType: 'gtm' })
    );
  });

  test('handles errors gracefully', async () => {
    listDiagnosticSnapshots.mockRejectedValue(new Error('DB error'));

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

describe('POST /api/diagnostic-snapshots', () => {
  test('creates snapshot with valid data', async () => {
    const newSnapshot = {
      id: 'snap-1',
      customer_id: 'cust-1',
      diagnostic_type: 'gtm',
      data: { score: 85 },
    };
    createDiagnosticSnapshot.mockResolvedValue(newSnapshot);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: 'cust-1',
        diagnosticType: 'gtm',
        data: { score: 85 },
        assessedBy: 'admin',
      },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: newSnapshot,
    });
  });

  test('validates diagnosticType is required', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: 'cust-1',
        data: { score: 85 },
      },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('diagnosticType'),
      })
    );
  });

  test('validates diagnosticType is a valid value', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: 'cust-1',
        diagnosticType: 'invalid',
        data: { score: 85 },
      },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('diagnosticType'),
      })
    );
  });

  test('validates data is required', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: 'cust-1',
        diagnosticType: 'gtm',
      },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('data'),
      })
    );
  });

  test('validates data must be an object', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: 'cust-1',
        diagnosticType: 'gtm',
        data: 'not an object',
      },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('data'),
      })
    );
  });

  test('handles createDiagnosticSnapshot returning null', async () => {
    createDiagnosticSnapshot.mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: 'cust-1',
        diagnosticType: 'gtm',
        data: { score: 85 },
      },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('handles errors gracefully', async () => {
    createDiagnosticSnapshot.mockRejectedValue(new Error('Insert failed'));

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: 'cust-1',
        diagnosticType: 'gtm',
        data: { score: 85 },
      },
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
