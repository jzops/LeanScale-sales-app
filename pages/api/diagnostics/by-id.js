/**
 * GET /api/diagnostics/by-id?id=<uuid>
 *
 * Fetch a diagnostic result by its ID (not by customer+type).
 * Used by the SOW review page to load linked diagnostic data.
 */

import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'id query parameter is required' });
  }

  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    const { data, error } = await supabaseAdmin
      .from('diagnostic_results')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Diagnostic result not found' });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Error fetching diagnostic by ID:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
