/**
 * API endpoint for fetching customer configuration
 * GET /api/customer
 *
 * Uses the shared getCustomerServer helper for slug resolution.
 */

import { getCustomerServer } from '../../lib/getCustomer';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const customer = await getCustomerServer({ req, query: req.query });

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
      });
    }

    // Add customerType (not in shared helper transform)
    const config = {
      ...customer,
      customerType: customer.customerType || 'active',
    };

    // No CDN caching — response varies by slug query param which Netlify
    // edge cache doesn't key on, causing cross-customer data leaks
    res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    res.setHeader('Netlify-Vary', 'query=slug');

    return res.status(200).json(config);
  } catch (err) {
    console.error('Error in /api/customer:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
