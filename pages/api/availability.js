/**
 * API endpoint for fetching availability dates
 * GET /api/availability
 *
 * Returns all upcoming cohort dates with availability status
 * Public endpoint - no auth required
 */

import { getAvailabilityDates } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const dates = await getAvailabilityDates();

    // Transform to match frontend expected format
    const availability = dates.map(d => ({
      date: d.date,
      cohortNumber: d.cohort_number,
      status: d.status,
      spotsTotal: d.spots_total,
      spotsLeft: d.spots_left,
    }));

    // Cache for 1 minute (availability changes more frequently)
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    return res.status(200).json(availability);
  } catch (err) {
    console.error('Error in /api/availability:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
