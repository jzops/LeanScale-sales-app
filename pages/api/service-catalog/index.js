/**
 * API endpoint for service catalog
 * GET  /api/service-catalog - List services (with optional ?category=, ?active=, ?search=)
 * POST /api/service-catalog - Create a new service
 */

import { listServices, createService } from '../../../lib/service-catalog';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { category, active, search } = req.query;
    const services = await listServices({
      category: category || undefined,
      active: active !== undefined ? active === 'true' : undefined,
      search: search || undefined,
    });
    return res.status(200).json({ success: true, data: services });
  }

  if (req.method === 'POST') {
    try {
      const service = await createService(req.body);
      return res.status(201).json({ success: true, data: service });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
