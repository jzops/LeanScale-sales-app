/**
 * Tests for pages/api/sow/[id].js - Single SOW operations
 */

jest.mock('../../lib/sow', () => ({
  getSowById: jest.fn(),
  updateSow: jest.fn(),
  deleteSow: jest.fn(),
}));

const { getSowById, updateSow, deleteSow } = require('../../lib/sow');

let handler;

beforeAll(() => {
  handler = require('../../pages/api/sow/[id]').default;
});

function createMocks({ method = 'GET', query = {}, body = {} } = {}) {
  const req = { method, query, body };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return { req, res };
}

describe('GET /api/sow/[id]', () => {
  test('returns SOW when found', async () => {
    const mockSow = { id: 'sow-1', title: 'Test SOW', status: 'draft' };
    getSowById.mockResolvedValue(mockSow);

    const { req, res } = createMocks({
      method: 'GET',
      query: { id: 'sow-1' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockSow,
    });
    expect(getSowById).toHaveBeenCalledWith('sow-1');
  });

  test('returns 404 when SOW not found', async () => {
    getSowById.mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'GET',
      query: { id: 'nonexistent' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('not found'),
      })
    );
  });

  test('returns 400 when id missing', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {},
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('id'),
      })
    );
  });

  test('handles errors gracefully', async () => {
    getSowById.mockRejectedValue(new Error('Database error'));

    const { req, res } = createMocks({
      method: 'GET',
      query: { id: 'sow-1' },
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

describe('PUT /api/sow/[id]', () => {
  test('updates SOW with valid data', async () => {
    const updatedSow = { id: 'sow-1', title: 'Updated', status: 'review' };
    updateSow.mockResolvedValue(updatedSow);

    const { req, res } = createMocks({
      method: 'PUT',
      query: { id: 'sow-1' },
      body: { status: 'review' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: updatedSow,
    });
    expect(updateSow).toHaveBeenCalledWith('sow-1', { status: 'review' });
  });

  test('allows updating title', async () => {
    updateSow.mockResolvedValue({ id: 'sow-1', title: 'New Title' });

    const { req, res } = createMocks({
      method: 'PUT',
      query: { id: 'sow-1' },
      body: { title: 'New Title' },
    });
    await handler(req, res);

    expect(updateSow).toHaveBeenCalledWith('sow-1', { title: 'New Title' });
  });

  test('allows updating content', async () => {
    updateSow.mockResolvedValue({ id: 'sow-1', content: { new: true } });

    const { req, res } = createMocks({
      method: 'PUT',
      query: { id: 'sow-1' },
      body: { content: { new: true } },
    });
    await handler(req, res);

    expect(updateSow).toHaveBeenCalledWith('sow-1', { content: { new: true } });
  });

  test('allows updating transcriptText', async () => {
    updateSow.mockResolvedValue({ id: 'sow-1' });

    const { req, res } = createMocks({
      method: 'PUT',
      query: { id: 'sow-1' },
      body: { transcriptText: 'new transcript' },
    });
    await handler(req, res);

    expect(updateSow).toHaveBeenCalledWith('sow-1', expect.objectContaining({
      transcript_text: 'new transcript',
    }));
  });

  test('allows updating diagnosticSnapshot', async () => {
    updateSow.mockResolvedValue({ id: 'sow-1' });

    const { req, res } = createMocks({
      method: 'PUT',
      query: { id: 'sow-1' },
      body: { diagnosticSnapshot: { updated: true } },
    });
    await handler(req, res);

    expect(updateSow).toHaveBeenCalledWith('sow-1', expect.objectContaining({
      diagnostic_snapshot: { updated: true },
    }));
  });

  test('returns 404 when updateSow returns null', async () => {
    updateSow.mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'PUT',
      query: { id: 'sow-1' },
      body: { status: 'review' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('returns 400 when id missing', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: {},
      body: { status: 'review' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('DELETE /api/sow/[id]', () => {
  test('deletes SOW successfully', async () => {
    deleteSow.mockResolvedValue(true);

    const { req, res } = createMocks({
      method: 'DELETE',
      query: { id: 'sow-1' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
    });
    expect(deleteSow).toHaveBeenCalledWith('sow-1');
  });

  test('returns 500 when delete fails', async () => {
    deleteSow.mockResolvedValue(false);

    const { req, res } = createMocks({
      method: 'DELETE',
      query: { id: 'sow-1' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      })
    );
  });

  test('returns 400 when id missing', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
      query: {},
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('Method validation', () => {
  test('returns 405 for POST', async () => {
    const { req, res } = createMocks({ method: 'POST', query: { id: 'sow-1' } });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Method not allowed',
      })
    );
  });

  test('returns 405 for PATCH', async () => {
    const { req, res } = createMocks({ method: 'PATCH', query: { id: 'sow-1' } });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});
