/**
 * API endpoint for fetching customer configuration
 * GET /api/customer
 *
 * Reads customer slug from:
 * 1. Cookie (set by middleware)
 * 2. Query param (?slug=xxx or ?customer=xxx)
 */

import { getCustomerBySlug } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get slug from various sources (in priority order)
  // 1. Header set by middleware (most authoritative - reflects current URL)
  // 2. Query param (explicit override)
  // 3. Cookie (persisted from previous visit - least authoritative)
  let slug = req.headers['x-customer-slug'];

  if (!slug) {
    slug = req.query.slug || req.query.customer;
  }

  if (!slug) {
    slug = req.cookies['customer-slug'];
  }

  // Default to demo
  slug = slug || 'demo';

  try {
    const customer = await getCustomerBySlug(slug);

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        slug: slug,
      });
    }

    // Transform to camelCase and exclude sensitive fields
    const config = {
      id: customer.id,
      slug: customer.slug,
      customerName: customer.name,
      customerLogo: customer.logo_url,
      ndaLink: customer.nda_link,
      intakeFormLink: customer.intake_form_link,
      youtubeVideoId: customer.youtube_video_id,
      googleSlidesEmbedUrl: customer.google_slides_embed_url,
      assignedTeam: customer.assigned_team || [],
      isDemo: customer.is_demo,
      customerType: customer.customer_type || 'prospect',
    };

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

    return res.status(200).json(config);
  } catch (err) {
    console.error('Error in /api/customer:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
