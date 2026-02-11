/**
 * SOW and Diagnostic Snapshot helper functions
 *
 * Uses supabase (anon) for reads and supabaseAdmin (service_role) for writes,
 * matching the pattern established in lib/supabase.js.
 */

import { supabase, supabaseAdmin } from './supabase';

// ============================================
// SOW FUNCTIONS
// ============================================

/**
 * List SOWs (optionally filtered by customer_id or status)
 */
export async function listSows({ customerId, status } = {}) {
  const client = supabaseAdmin || supabase;
  if (!client) {
    return [];
  }

  try {
    let query = client.from('sows').select('*');

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error listing SOWs:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('List SOWs failed:', err);
    return [];
  }
}

/**
 * Get single SOW by ID
 */
export async function getSowById(id) {
  const client = supabaseAdmin || supabase;
  if (!client) {
    return null;
  }

  try {
    const { data, error } = await client
      .from('sows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching SOW:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Get SOW failed:', err);
    return null;
  }
}

/**
 * Create a new SOW (requires admin client)
 */
export async function createSow({
  customerId,
  title,
  sowType,
  intakeSubmissionId,
  transcriptText,
  diagnosticSnapshot,
  content,
  createdBy,
}) {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not configured');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('sows')
      .insert({
        customer_id: customerId || null,
        title,
        sow_type: sowType,
        intake_submission_id: intakeSubmissionId || null,
        transcript_text: transcriptText || null,
        diagnostic_snapshot: diagnosticSnapshot || null,
        content: content || {},
        created_by: createdBy || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating SOW:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Create SOW failed:', err);
    return null;
  }
}

/**
 * Update a SOW (partial update, requires admin client)
 */
export async function updateSow(id, updates) {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not configured');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('sows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating SOW:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Update SOW failed:', err);
    return null;
  }
}

/**
 * Delete a SOW (requires admin client)
 */
export async function deleteSow(id) {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not configured');
    return false;
  }

  try {
    const { error } = await supabaseAdmin
      .from('sows')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting SOW:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Delete SOW failed:', err);
    return false;
  }
}

// ============================================
// DIAGNOSTIC SNAPSHOT FUNCTIONS
// ============================================

/**
 * List diagnostic snapshots (optionally filtered by customer_id or diagnostic_type)
 */
export async function listDiagnosticSnapshots({ customerId, diagnosticType } = {}) {
  const client = supabaseAdmin || supabase;
  if (!client) {
    return [];
  }

  try {
    let query = client.from('diagnostic_snapshots').select('*');

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }
    if (diagnosticType) {
      query = query.eq('diagnostic_type', diagnosticType);
    }

    const { data, error } = await query.order('assessed_at', { ascending: false });

    if (error) {
      console.error('Error listing diagnostic snapshots:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('List diagnostic snapshots failed:', err);
    return [];
  }
}

/**
 * Create a diagnostic snapshot (requires admin client)
 */
export async function createDiagnosticSnapshot({ customerId, diagnosticType, data, assessedBy }) {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not configured');
    return null;
  }

  try {
    const { data: snapshot, error } = await supabaseAdmin
      .from('diagnostic_snapshots')
      .insert({
        customer_id: customerId || null,
        diagnostic_type: diagnosticType,
        data: data,
        assessed_by: assessedBy || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating diagnostic snapshot:', error.message);
      return null;
    }

    return snapshot;
  } catch (err) {
    console.error('Create diagnostic snapshot failed:', err);
    return null;
  }
}
