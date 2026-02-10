/**
 * Diagnostic Results and Notes CRUD operations
 *
 * Uses supabaseAdmin (service_role) for all operations since
 * diagnostic tables have RLS with service_role-only policies.
 */

import { supabaseAdmin } from './supabase';

const VALID_TYPES = ['gtm', 'clay', 'cpq'];

// ============================================
// DIAGNOSTIC RESULTS
// ============================================

/**
 * Get diagnostic results for a customer + type
 * Returns null if no saved results exist (caller should fall back to static data)
 */
export async function getDiagnosticResult(customerId, diagnosticType) {
  if (!supabaseAdmin) return null;
  if (!VALID_TYPES.includes(diagnosticType)) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from('diagnostic_results')
      .select('*')
      .eq('customer_id', customerId)
      .eq('diagnostic_type', diagnosticType)
      .single();

    if (error) {
      // PGRST116 = no rows found — not an error, just no saved data
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching diagnostic result:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Get diagnostic result failed:', err);
    return null;
  }
}

/**
 * Create or update diagnostic results (upsert)
 * Uses the UNIQUE(customer_id, diagnostic_type) constraint for upsert
 */
export async function upsertDiagnosticResult({ customerId, diagnosticType, processes, tools, createdBy }) {
  if (!supabaseAdmin) return null;
  if (!VALID_TYPES.includes(diagnosticType)) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from('diagnostic_results')
      .upsert(
        {
          customer_id: customerId,
          diagnostic_type: diagnosticType,
          processes: processes || [],
          tools: tools || [],
          created_by: createdBy,
        },
        {
          onConflict: 'customer_id,diagnostic_type',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting diagnostic result:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Upsert diagnostic result failed:', err);
    return null;
  }
}

/**
 * List all diagnostic results for a customer (all types)
 */
export async function listDiagnosticResults(customerId) {
  if (!supabaseAdmin) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from('diagnostic_results')
      .select('*')
      .eq('customer_id', customerId)
      .order('diagnostic_type');

    if (error) {
      console.error('Error listing diagnostic results:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('List diagnostic results failed:', err);
    return [];
  }
}

// ============================================
// DIAGNOSTIC NOTES
// ============================================

/**
 * Get all notes for a diagnostic result
 */
export async function getNotes(diagnosticResultId) {
  if (!supabaseAdmin) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from('diagnostic_notes')
      .select('*')
      .eq('diagnostic_result_id', diagnosticResultId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching notes:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Get notes failed:', err);
    return [];
  }
}

/**
 * Add a note to a diagnostic process item
 */
export async function addNote({ diagnosticResultId, processName, note, author }) {
  if (!supabaseAdmin) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from('diagnostic_notes')
      .insert({
        diagnostic_result_id: diagnosticResultId,
        process_name: processName,
        note,
        author,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding note:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Add note failed:', err);
    return null;
  }
}

/**
 * Update an existing note
 */
export async function updateNote(noteId, { note, author }) {
  if (!supabaseAdmin) return null;

  try {
    const payload = {};
    if (note !== undefined) payload.note = note;
    if (author !== undefined) payload.author = author;

    const { data, error } = await supabaseAdmin
      .from('diagnostic_notes')
      .update(payload)
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Update note failed:', err);
    return null;
  }
}

/**
 * Delete a note
 */
export async function deleteNote(noteId) {
  if (!supabaseAdmin) return false;

  try {
    const { error } = await supabaseAdmin
      .from('diagnostic_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Error deleting note:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Delete note failed:', err);
    return false;
  }
}
