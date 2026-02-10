/**
 * Tests for pages/api/sow/generate.js - SOW Generation API
 *
 * This endpoint:
 * 1. Receives POST with generation parameters
 * 2. Looks up customer info from Supabase
 * 3. Optionally fetches intake form submission data
 * 4. Calls n8n webhook for AI-generated content (or falls back to template)
 * 5. Creates the SOW record via createSow
 * 6. Returns the created SOW
 */

// Mock lib/sow
jest.mock('../../lib/sow', () => ({
  createSow: jest.fn(),
}));

// Mock lib/supabase
const mockSupabaseFrom = jest.fn();
const mockSupabaseSelect = jest.fn();
const mockSupabaseEq = jest.fn();
const mockSupabaseSingle = jest.fn();

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: (...args) => {
      mockSupabaseFrom(...args);
      return {
        select: (...a) => {
          mockSupabaseSelect(...a);
          return {
            eq: (...b) => {
              mockSupabaseEq(...b);
              return {
                single: () => mockSupabaseSingle(),
              };
            },
          };
        },
      };
    },
  },
  supabaseAdmin: {},
}));

// Mock lib/slack
jest.mock('../../lib/slack', () => ({
  notifySowCreated: jest.fn().mockResolvedValue(true),
  sendToSlack: jest.fn(),
}));

// Mock global fetch for n8n webhook calls
const originalFetch = global.fetch;

const { createSow } = require('../../lib/sow');
const { notifySowCreated } = require('../../lib/slack');

let handler;

beforeAll(() => {
  handler = require('../../pages/api/sow/generate').default;
});

afterEach(() => {
  jest.clearAllMocks();
  global.fetch = originalFetch;
  delete process.env.N8N_SOW_WEBHOOK_URL;
});

// Helper to create mock req/res objects
function createMocks({ method = 'POST', query = {}, body = {} } = {}) {
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

// ==========================================
// Method Validation
// ==========================================
describe('Method validation', () => {
  test('returns 405 for GET', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Method not allowed',
      })
    );
  });

  test('returns 405 for PUT', async () => {
    const { req, res } = createMocks({ method: 'PUT' });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });

  test('returns 405 for DELETE', async () => {
    const { req, res } = createMocks({ method: 'DELETE' });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});

// ==========================================
// Input Validation
// ==========================================
describe('Input validation', () => {
  test('requires sowType field', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { customerId: 'cust-1' },
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

  test('validates sowType is one of the allowed values', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'invalid_type' },
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

  test('accepts clay as valid sowType', async () => {
    const createdSow = { id: 'sow-1', title: 'SOW for Customer', sow_type: 'clay' };
    createSow.mockResolvedValue(createdSow);

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay' },
    });
    await handler(req, res);

    // Should not get 400 validation error
    expect(res.status).not.toHaveBeenCalledWith(400);
  });

  test('accepts q2c as valid sowType', async () => {
    const createdSow = { id: 'sow-1', title: 'SOW', sow_type: 'q2c' };
    createSow.mockResolvedValue(createdSow);

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'q2c' },
    });
    await handler(req, res);

    expect(res.status).not.toHaveBeenCalledWith(400);
  });

  test('accepts embedded as valid sowType', async () => {
    const createdSow = { id: 'sow-1', title: 'SOW', sow_type: 'embedded' };
    createSow.mockResolvedValue(createdSow);

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'embedded' },
    });
    await handler(req, res);

    expect(res.status).not.toHaveBeenCalledWith(400);
  });

  test('accepts custom as valid sowType', async () => {
    const createdSow = { id: 'sow-1', title: 'SOW', sow_type: 'custom' };
    createSow.mockResolvedValue(createdSow);

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'custom' },
    });
    await handler(req, res);

    expect(res.status).not.toHaveBeenCalledWith(400);
  });
});

// ==========================================
// Template Fallback (no n8n configured)
// ==========================================
describe('Template fallback (no n8n webhook)', () => {
  test('generates template SOW when N8N_SOW_WEBHOOK_URL is not set', async () => {
    const createdSow = {
      id: 'sow-1',
      title: 'SOW for Acme Corp — clay engagement',
      sow_type: 'clay',
      content: expect.any(Object),
    };
    createSow.mockResolvedValue(createdSow);

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.any(Object),
      })
    );
  });

  test('template content includes expected structure fields', async () => {
    createSow.mockImplementation(async (args) => ({
      id: 'sow-1',
      ...args,
      content: args.content,
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay' },
    });
    await handler(req, res);

    // Verify createSow was called with template content structure
    expect(createSow).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          executive_summary: expect.any(String),
          client_info: expect.any(Object),
          scope: expect.any(Array),
          deliverables_table: expect.any(Array),
          timeline: expect.any(Array),
          investment: expect.any(Object),
          team: expect.any(Array),
          assumptions: expect.any(Array),
          acceptance_criteria: expect.any(Array),
        }),
      })
    );
  });

  test('template includes customer name when customerId resolves', async () => {
    const customerData = { id: 'cust-1', name: 'Acme Corp', slug: 'acme' };
    mockSupabaseSingle.mockReturnValue({ data: customerData, error: null });

    createSow.mockImplementation(async (args) => ({
      id: 'sow-1',
      ...args,
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay', customerId: 'cust-1' },
    });
    await handler(req, res);

    expect(createSow).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('Acme Corp'),
        content: expect.objectContaining({
          executive_summary: expect.stringContaining('Acme Corp'),
        }),
      })
    );
  });

  test('generates title with sowType when no customer', async () => {
    createSow.mockImplementation(async (args) => ({
      id: 'sow-1',
      ...args,
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'q2c' },
    });
    await handler(req, res);

    expect(createSow).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('q2c'),
        sowType: 'q2c',
      })
    );
  });
});

// ==========================================
// Customer Lookup
// ==========================================
describe('Customer lookup', () => {
  test('looks up customer data when customerId is provided', async () => {
    const customerData = { id: 'cust-1', name: 'Test Co', slug: 'test' };
    mockSupabaseSingle.mockReturnValue({ data: customerData, error: null });

    createSow.mockImplementation(async (args) => ({
      id: 'sow-1',
      ...args,
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay', customerId: 'cust-1' },
    });
    await handler(req, res);

    expect(mockSupabaseFrom).toHaveBeenCalledWith('customers');
    expect(mockSupabaseEq).toHaveBeenCalledWith('id', 'cust-1');
  });

  test('proceeds without customer data if lookup fails', async () => {
    mockSupabaseSingle.mockReturnValue({ data: null, error: { message: 'Not found' } });

    createSow.mockImplementation(async (args) => ({
      id: 'sow-1',
      ...args,
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay', customerId: 'nonexistent' },
    });
    await handler(req, res);

    // Should still succeed with template
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('skips customer lookup when no customerId provided', async () => {
    createSow.mockImplementation(async (args) => ({
      id: 'sow-1',
      ...args,
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'embedded' },
    });
    await handler(req, res);

    expect(mockSupabaseFrom).not.toHaveBeenCalledWith('customers');
  });
});

// ==========================================
// Intake Submission Lookup
// ==========================================
describe('Intake submission lookup', () => {
  test('fetches intake submission when intakeSubmissionId is provided', async () => {
    const intakeData = {
      id: 'sub-1',
      form_type: 'getting_started',
      data: { company: 'Test Co', crm: 'HubSpot' },
    };
    // First call for intake, not customer
    mockSupabaseSingle.mockReturnValue({ data: intakeData, error: null });

    createSow.mockImplementation(async (args) => ({
      id: 'sow-1',
      ...args,
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay', intakeSubmissionId: 'sub-1' },
    });
    await handler(req, res);

    expect(mockSupabaseFrom).toHaveBeenCalledWith('form_submissions');
    expect(mockSupabaseEq).toHaveBeenCalledWith('id', 'sub-1');
  });

  test('proceeds without intake data if lookup fails', async () => {
    mockSupabaseSingle.mockReturnValue({ data: null, error: { message: 'Not found' } });

    createSow.mockImplementation(async (args) => ({
      id: 'sow-1',
      ...args,
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay', intakeSubmissionId: 'nonexistent' },
    });
    await handler(req, res);

    // Should still succeed
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// ==========================================
// n8n Webhook Integration
// ==========================================
describe('n8n webhook integration', () => {
  test('calls n8n webhook when N8N_SOW_WEBHOOK_URL is configured', async () => {
    process.env.N8N_SOW_WEBHOOK_URL = 'https://n8n.example.com/webhook/sow';

    const generatedContent = {
      executive_summary: 'AI-generated summary',
      scope: [{ title: 'AI Scope', description: 'Generated' }],
    };

    // n8n returns { success: true, content: <sowContent> }
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, content: generatedContent }),
    });

    createSow.mockImplementation(async (args) => ({
      id: 'sow-1',
      ...args,
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        sowType: 'clay',
        transcriptText: 'Sales call transcript here',
      },
    });
    await handler(req, res);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://n8n.example.com/webhook/sow',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      })
    );
  });

  test('sends customer data and transcript to n8n', async () => {
    process.env.N8N_SOW_WEBHOOK_URL = 'https://n8n.example.com/webhook/sow';

    const customerData = { id: 'cust-1', name: 'Webhook Co' };
    mockSupabaseSingle.mockReturnValue({ data: customerData, error: null });

    // n8n returns { success: true, content: <sowContent> }
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, content: { executive_summary: 'Generated' } }),
    });

    createSow.mockImplementation(async (args) => ({
      id: 'sow-1',
      ...args,
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        sowType: 'clay',
        customerId: 'cust-1',
        transcriptText: 'Call transcript',
        diagnosticSnapshot: { score: 80 },
      },
    });
    await handler(req, res);

    const fetchBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(fetchBody).toEqual(
      expect.objectContaining({
        customer: expect.objectContaining({ name: 'Webhook Co' }),
        sowType: 'clay',
        transcript: 'Call transcript',
        diagnosticData: { score: 80 },
      })
    );
  });

  test('uses n8n-generated content for the SOW', async () => {
    process.env.N8N_SOW_WEBHOOK_URL = 'https://n8n.example.com/webhook/sow';

    const generatedContent = {
      executive_summary: 'AI-generated executive summary for Acme Corp',
      scope: [{ title: 'Custom Scope', description: 'AI generated' }],
    };

    // n8n returns { success: true, content: <sowContent> }
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, content: generatedContent }),
    });

    createSow.mockImplementation(async (args) => ({
      id: 'sow-1',
      ...args,
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay' },
    });
    await handler(req, res);

    expect(createSow).toHaveBeenCalledWith(
      expect.objectContaining({
        content: generatedContent,
      })
    );
  });

  test('falls back to template when n8n call fails', async () => {
    process.env.N8N_SOW_WEBHOOK_URL = 'https://n8n.example.com/webhook/sow';

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });

    createSow.mockImplementation(async (args) => ({
      id: 'sow-1',
      ...args,
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay' },
    });
    await handler(req, res);

    // Should still succeed with template fallback
    expect(res.status).toHaveBeenCalledWith(201);
    expect(createSow).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          executive_summary: expect.any(String),
          scope: expect.any(Array),
          timeline: expect.any(Array),
        }),
      })
    );
  });

  test('falls back to template when n8n fetch throws', async () => {
    process.env.N8N_SOW_WEBHOOK_URL = 'https://n8n.example.com/webhook/sow';

    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    createSow.mockImplementation(async (args) => ({
      id: 'sow-1',
      ...args,
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay' },
    });
    await handler(req, res);

    // Should still succeed with template fallback
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// ==========================================
// SOW Creation / Database Persistence
// ==========================================
describe('SOW creation', () => {
  test('passes all fields to createSow', async () => {
    createSow.mockImplementation(async (args) => ({
      id: 'sow-1',
      ...args,
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        sowType: 'clay',
        customerId: 'cust-1',
        transcriptText: 'some transcript',
        intakeSubmissionId: 'sub-1',
        diagnosticSnapshot: { data: true },
        createdBy: 'admin',
      },
    });
    await handler(req, res);

    expect(createSow).toHaveBeenCalledWith(
      expect.objectContaining({
        sowType: 'clay',
        customerId: 'cust-1',
        transcriptText: 'some transcript',
        intakeSubmissionId: 'sub-1',
        diagnosticSnapshot: { data: true },
        createdBy: 'admin',
      })
    );
  });

  test('returns 201 with created SOW data', async () => {
    const createdSow = {
      id: 'sow-99',
      title: 'Generated SOW',
      sow_type: 'clay',
      status: 'draft',
      content: { executive_summary: 'Test' },
    };
    createSow.mockResolvedValue(createdSow);

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: createdSow,
    });
  });

  test('returns 500 when createSow returns null', async () => {
    createSow.mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay' },
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

  test('returns 500 on unexpected error', async () => {
    createSow.mockRejectedValue(new Error('Unexpected DB error'));

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Internal server error',
      })
    );
  });
});

// ==========================================
// Slack Notification
// ==========================================
describe('Slack notification', () => {
  test('sends Slack notification after successful SOW creation', async () => {
    const customerData = { id: 'cust-1', name: 'Slack Test Co' };
    mockSupabaseSingle.mockReturnValue({ data: customerData, error: null });

    const createdSow = { id: 'sow-1', title: 'Test SOW', sow_type: 'clay' };
    createSow.mockResolvedValue(createdSow);

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay', customerId: 'cust-1' },
    });
    await handler(req, res);

    expect(notifySowCreated).toHaveBeenCalledWith('Slack Test Co', 'clay', 'sow-1');
  });

  test('does not fail if Slack notification fails', async () => {
    const { notifySowCreated: mockNotify } = require('../../lib/slack');
    mockNotify.mockRejectedValue(new Error('Slack down'));

    createSow.mockResolvedValue({ id: 'sow-1', title: 'SOW', sow_type: 'clay' });

    const { req, res } = createMocks({
      method: 'POST',
      body: { sowType: 'clay' },
    });
    await handler(req, res);

    // Should still return success - Slack notification is fire-and-forget
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
