/**
 * SOW Versions CRUD operations
 *
 * Uses supabaseAdmin (service_role) for all operations since
 * sow_versions table has RLS with service_role-only policies.
 */

import { supabaseAdmin } from './supabase';

/**
 * List all versions for a SOW, ordered by version_number descending
 */
export async function listVersions(sowId) {
  if (!supabaseAdmin) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from('sow_versions')
      .select('id, sow_id, version_number, exported_by, exported_at, pdf_url')
      .eq('sow_id', sowId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Error listing versions:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('List versions failed:', err);
    return [];
  }
}

/**
 * Get a specific version by ID (includes full snapshots)
 */
export async function getVersionById(versionId) {
  if (!supabaseAdmin) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from('sow_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (error) {
      console.error('Error fetching version:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Get version failed:', err);
    return null;
  }
}

/**
 * Create a new version (snapshot on export)
 */
export async function createVersion({
  sowId,
  versionNumber,
  contentSnapshot,
  sectionsSnapshot,
  exportedBy,
  pdfUrl,
}) {
  if (!supabaseAdmin) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from('sow_versions')
      .insert({
        sow_id: sowId,
        version_number: versionNumber,
        content_snapshot: contentSnapshot,
        sections_snapshot: sectionsSnapshot,
        exported_by: exportedBy || null,
        pdf_url: pdfUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating version:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Create version failed:', err);
    return null;
  }
}

/**
 * Get the next version number for a SOW
 */
export async function getNextVersionNumber(sowId) {
  if (!supabaseAdmin) return 1;

  try {
    const { data, error } = await supabaseAdmin
      .from('sow_versions')
      .select('version_number')
      .eq('sow_id', sowId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error getting next version number:', error.message);
      return 1;
    }

    return (data?.[0]?.version_number || 0) + 1;
  } catch (err) {
    console.error('Get next version number failed:', err);
    return 1;
  }
}
