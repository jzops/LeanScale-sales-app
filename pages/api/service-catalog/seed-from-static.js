/**
 * Seed service_catalog DB from static services-catalog.js data.
 * Adds slug field to bridge diagnostic serviceId references.
 *
 * POST /api/service-catalog/seed-from-static
 * Body: { clear?: boolean }
 */

import { supabaseAdmin } from '../../../lib/supabase';
import { strategicProjects, managedServices, functionLabels } from '../../../data/services-catalog';

const DEFAULT_HOURS = {
  Strategic: { low: 40, high: 80 },
  'Managed Services': { low: 20, high: 60 },
};

const DEFAULT_RATE = 225;

function flattenCatalog(catalog, category) {
  const entries = [];
  for (const [funcKey, services] of Object.entries(catalog)) {
    const functionLabel = functionLabels[funcKey] || funcKey;
    for (const service of services) {
      entries.push({
        slug: service.id,
        name: service.name,
        description: service.description || '',
        category,
        primary_function: functionLabel,
        hours_low: DEFAULT_HOURS[category]?.low || 40,
        hours_high: DEFAULT_HOURS[category]?.high || 80,
        default_rate: DEFAULT_RATE,
        active: true,
      });
    }
  }
  return entries;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Supabase admin not configured' });
  }

  try {
    const { clear } = req.body || {};

    // Build entries from static data
    const strategic = flattenCatalog(strategicProjects, 'Strategic');
    const managed = flattenCatalog(managedServices, 'Managed Services');
    const allEntries = [...strategic, ...managed];

    if (clear) {
      await supabaseAdmin.from('service_catalog').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    // Upsert by slug to avoid duplicates on re-run
    const { data, error } = await supabaseAdmin
      .from('service_catalog')
      .upsert(allEntries, { onConflict: 'slug' })
      .select('id, slug, name');

    if (error) {
      console.error('Seed from static failed:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      count: data?.length || 0,
      categories: {
        strategic: strategic.length,
        managed: managed.length,
      },
    });
  } catch (error) {
    console.error('Seed from static error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
