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

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

    return res.status(200).json(config);
  } catch (err) {
    console.error('Error in /api/customer:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
