/**
 * API endpoint for seeding service catalog
 * POST /api/service-catalog/seed - Parse catalog markdown and bulk insert
 *
 * Body: { services: [...] } - Array of service objects to insert
 * Or: { clear: true } - Clear all existing services first
 */

import { bulkInsertServices } from '../../../lib/service-catalog';
import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { services, clear } = req.body;

    // Optionally clear existing data
    if (clear && supabaseAdmin) {
      await supabaseAdmin.from('service_catalog').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ success: false, error: 'No services provided' });
    }

    const data = await bulkInsertServices(services);

    return res.status(201).json({
      success: true,
      data: { inserted: data.length },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
