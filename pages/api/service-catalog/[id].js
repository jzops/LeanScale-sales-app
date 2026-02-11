/**
 * API endpoint for individual service
 * GET    /api/service-catalog/[id] - Get service details
 * PUT    /api/service-catalog/[id] - Update service
 * DELETE /api/service-catalog/[id] - Delete service
 */

import { getServiceById, updateService, deleteService } from '../../../lib/service-catalog';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing service id' });
  }

  if (req.method === 'GET') {
    const service = await getServiceById(id);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    return res.status(200).json({ success: true, data: service });
  }

  if (req.method === 'PUT') {
    try {
      const service = await updateService(id, req.body);
      return res.status(200).json({ success: true, data: service });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await deleteService(id);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
