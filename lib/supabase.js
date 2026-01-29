import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client (for client-side and read operations)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin client (for server-side write operations - bypasses RLS)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Warn if not configured (but don't crash - allow fallback to static data)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using static fallback data.');
}

/**
 * Get customer by slug
 * Falls back to demo config if Supabase not configured
 */
export async function getCustomerBySlug(slug) {
  if (!supabase) {
    return slug === 'demo' ? getDemoConfig() : null;
  }

  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching customer:', error.message);
      // Fall back to demo for the demo slug
      if (slug === 'demo') return getDemoConfig();
      return null;
    }

    return data;
  } catch (err) {
    console.error('Supabase query failed:', err);
    return slug === 'demo' ? getDemoConfig() : null;
  }
}

/**
 * Get all upcoming availability dates
 */
export async function getAvailabilityDates() {
  if (!supabase) {
    return getStaticAvailability();
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    const { data, error } = await supabase
      .from('availability_dates')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching availability:', error.message);
      return getStaticAvailability();
    }

    return data || [];
  } catch (err) {
    console.error('Supabase query failed:', err);
    return getStaticAvailability();
  }
}

/**
 * Insert a form submission (requires admin client)
 */
export async function insertFormSubmission({ customerId, formType, data, slackNotified = false }) {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not configured');
    return null;
  }

  try {
    const { data: submission, error } = await supabaseAdmin
      .from('form_submissions')
      .insert({
        customer_id: customerId,
        form_type: formType,
        data: data,
        slack_notified: slackNotified,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting form submission:', error.message);
      return null;
    }

    return submission;
  } catch (err) {
    console.error('Insert form submission failed:', err);
    return null;
  }
}

/**
 * Update slack_notified status
 */
export async function updateSlackNotified(submissionId, notified = true) {
  if (!supabaseAdmin) return false;

  try {
    const { error } = await supabaseAdmin
      .from('form_submissions')
      .update({ slack_notified: notified })
      .eq('id', submissionId);

    return !error;
  } catch (err) {
    console.error('Update slack_notified failed:', err);
    return false;
  }
}

/**
 * Decrement availability spots for a date
 */
export async function decrementAvailability(dateStr) {
  if (!supabaseAdmin) return null;

  try {
    // Get current availability
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('availability_dates')
      .select('id, spots_left, status')
      .eq('date', dateStr)
      .single();

    if (fetchError || !current) {
      console.error('Availability date not found:', dateStr);
      return null;
    }

    const newSpotsLeft = Math.max(0, current.spots_left - 1);
    let newStatus = current.status;

    // Update status based on remaining spots
    if (newSpotsLeft <= 0) {
      newStatus = 'waitlist';
    } else if (newSpotsLeft <= 2) {
      newStatus = 'limited';
    }

    const { error: updateError } = await supabaseAdmin
      .from('availability_dates')
      .update({ spots_left: newSpotsLeft, status: newStatus })
      .eq('id', current.id);

    if (updateError) {
      console.error('Failed to update availability:', updateError.message);
      return null;
    }

    return { spotsLeft: newSpotsLeft, status: newStatus };
  } catch (err) {
    console.error('Decrement availability failed:', err);
    return null;
  }
}

// ============================================
// STATIC FALLBACKS (when Supabase not configured)
// ============================================

function getDemoConfig() {
  return {
    id: 'demo',
    slug: 'demo',
    name: 'Demo',
    logo_url: null,
    password: 'demo2026',
    nda_link: 'https://powerforms.docusign.net/0758efed-0a42-4275-b5d9-f26875d64ae6?env=na4&acct=9287b4d2-50a6-4309-b7e8-7f0b785470c0&accountId=9287b4d2-50a6-4309-b7e8-7f0b785470c0',
    intake_form_link: 'https://forms.fillout.com/t/nqEbrHoL5Eus',
    youtube_video_id: 'M7oECb8xsy0',
    google_slides_embed_url: 'https://docs.google.com/presentation/d/e/2PACX-1vSGSLvHvPn9Cus6N3BpGnK6AkZsUiEdh8cARVVBiZ4w54uUCjHHJ-lHfymW8wfPPraAXMfgXtePxIwf/pubembed?start=true&loop=true&delayms=3000',
    assigned_team: ['izzy', 'brian', 'dave', 'kavean'],
    is_demo: true,
  };
}

function getStaticAvailability() {
  return [
    { date: '2026-02-02', cohort_number: 1, status: 'waitlist', spots_total: 4, spots_left: 0 },
    { date: '2026-02-16', cohort_number: 2, status: 'waitlist', spots_total: 4, spots_left: 0 },
    { date: '2026-03-02', cohort_number: 3, status: 'limited', spots_total: 4, spots_left: 2 },
    { date: '2026-03-16', cohort_number: 4, status: 'available', spots_total: 4, spots_left: 3 },
    { date: '2026-03-30', cohort_number: 5, status: 'available', spots_total: 4, spots_left: 4 },
    { date: '2026-04-13', cohort_number: 6, status: 'available', spots_total: 4, spots_left: 4 },
  ];
}
