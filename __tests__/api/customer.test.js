/**
 * Tests for pages/api/customer.js - Customer config API
 *
 * Phase 7: Validates that customer_type is returned in the API response.
 */

// Mock lib/supabase before importing the handler
jest.mock('../../lib/supabase', () => ({
  getCustomerBySlug: jest.fn(),
}));

const { getCustomerBySlug } = require('../../lib/supabase');

let handler;

beforeAll(() => {
  handler = require('../../pages/api/customer').default;
});

// Helper to create mock req/res objects
function createMocks({ method = 'GET', query = {}, headers = {}, cookies = {} } = {}) {
  const req = {
    method,
    query,
    headers,
    cookies,
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
  };
  return { req, res };
}

describe('GET /api/customer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns customerType in the response for an active customer', async () => {
    getCustomerBySlug.mockResolvedValue({
      id: '123',
      slug: 'acme',
      name: 'Acme Corp',
      logo_url: '/acme-logo.png',
      nda_link: null,
      intake_form_link: null,
      youtube_video_id: null,
      google_slides_embed_url: null,
      assigned_team: ['alice'],
      is_demo: false,
      customer_type: 'active',
    });

    const { req, res } = createMocks({
      method: 'GET',
      headers: { 'x-customer-slug': 'acme' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.customerType).toBe('active');
  });

  test('returns customerType as prospect by default', async () => {
    getCustomerBySlug.mockResolvedValue({
      id: '456',
      slug: 'newco',
      name: 'NewCo',
      logo_url: null,
      nda_link: null,
      intake_form_link: null,
      youtube_video_id: null,
      google_slides_embed_url: null,
      assigned_team: [],
      is_demo: false,
      customer_type: 'prospect',
    });

    const { req, res } = createMocks({
      method: 'GET',
      headers: { 'x-customer-slug': 'newco' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.customerType).toBe('prospect');
  });

  test('returns customerType as churned for churned customer', async () => {
    getCustomerBySlug.mockResolvedValue({
      id: '789',
      slug: 'oldco',
      name: 'OldCo',
      logo_url: null,
      nda_link: null,
      intake_form_link: null,
      youtube_video_id: null,
      google_slides_embed_url: null,
      assigned_team: [],
      is_demo: false,
      customer_type: 'churned',
    });

    const { req, res } = createMocks({
      method: 'GET',
      headers: { 'x-customer-slug': 'oldco' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.customerType).toBe('churned');
  });

  test('returns prospect when customer_type is null/undefined', async () => {
    getCustomerBySlug.mockResolvedValue({
      id: '000',
      slug: 'legacy',
      name: 'Legacy Inc',
      logo_url: null,
      nda_link: null,
      intake_form_link: null,
      youtube_video_id: null,
      google_slides_embed_url: null,
      assigned_team: [],
      is_demo: false,
      customer_type: null,
    });

    const { req, res } = createMocks({
      method: 'GET',
      headers: { 'x-customer-slug': 'legacy' },
    });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.customerType).toBe('prospect');
  });
});
