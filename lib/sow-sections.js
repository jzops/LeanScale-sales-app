/**
 * SOW Sections CRUD operations
 *
 * Uses supabaseAdmin (service_role) for all operations since
 * sow_sections table has RLS with service_role-only policies.
 */

import { supabaseAdmin } from './supabase';

// ============================================
// SOW SECTIONS
// ============================================

/**
 * List all sections for a SOW, ordered by sort_order
 */
export async function listSections(sowId) {
  if (!supabaseAdmin) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from('sow_sections')
      .select('*')
      .eq('sow_id', sowId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error listing sections:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('List sections failed:', err);
    return [];
  }
}

/**
 * Get a single section by ID
 */
export async function getSectionById(sectionId) {
  if (!supabaseAdmin) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from('sow_sections')
      .select('*')
      .eq('id', sectionId)
      .single();

    if (error) {
      console.error('Error fetching section:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Get section failed:', err);
    return null;
  }
}

/**
 * Create a new section for a SOW
 */
export async function createSection({
  sowId,
  title,
  description,
  deliverables,
  hours,
  rate,
  startDate,
  endDate,
  diagnosticItems,
  sortOrder,
  serviceCatalogId,
}) {
  if (!supabaseAdmin) return null;

  try {
    const insertData = {
      sow_id: sowId,
      title,
      description: description || null,
      deliverables: deliverables || [],
      hours: hours || null,
      rate: rate || null,
      start_date: startDate || null,
      end_date: endDate || null,
      diagnostic_items: diagnosticItems || [],
      sort_order: sortOrder || 0,
    };
    if (serviceCatalogId) insertData.service_catalog_id = serviceCatalogId;

    const { data, error } = await supabaseAdmin
      .from('sow_sections')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating section:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Create section failed:', err);
    return null;
  }
}

/**
 * Update a section (partial update)
 */
export async function updateSection(sectionId, updates) {
  if (!supabaseAdmin) return null;

  try {
    // Map camelCase input to snake_case columns
    const mapped = {};
    if (updates.title !== undefined) mapped.title = updates.title;
    if (updates.description !== undefined) mapped.description = updates.description;
    if (updates.deliverables !== undefined) mapped.deliverables = updates.deliverables;
    if (updates.hours !== undefined) mapped.hours = updates.hours;
    if (updates.rate !== undefined) mapped.rate = updates.rate;
    if (updates.startDate !== undefined) mapped.start_date = updates.startDate;
    if (updates.endDate !== undefined) mapped.end_date = updates.endDate;
    if (updates.diagnosticItems !== undefined) mapped.diagnostic_items = updates.diagnosticItems;
    if (updates.sortOrder !== undefined) mapped.sort_order = updates.sortOrder;
    if (updates.teamworkMilestoneId !== undefined) mapped.teamwork_milestone_id = updates.teamworkMilestoneId;

    const { data, error } = await supabaseAdmin
      .from('sow_sections')
      .update(mapped)
      .eq('id', sectionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating section:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Update section failed:', err);
    return null;
  }
}

/**
 * Delete a section
 */
export async function deleteSection(sectionId) {
  if (!supabaseAdmin) return false;

  try {
    const { error } = await supabaseAdmin
      .from('sow_sections')
      .delete()
      .eq('id', sectionId);

    if (error) {
      console.error('Error deleting section:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Delete section failed:', err);
    return false;
  }
}

/**
 * Reorder sections — accepts an array of { id, sortOrder } pairs
 */
export async function reorderSections(sowId, ordering) {
  if (!supabaseAdmin) return false;

  try {
    // Update each section's sort_order
    const updates = ordering.map(({ id, sortOrder }) =>
      supabaseAdmin
        .from('sow_sections')
        .update({ sort_order: sortOrder })
        .eq('id', id)
        .eq('sow_id', sowId)
    );

    const results = await Promise.all(updates);
    const hasError = results.some(r => r.error);

    if (hasError) {
      console.error('Error reordering sections');
      return false;
    }

    return true;
  } catch (err) {
    console.error('Reorder sections failed:', err);
    return false;
  }
}

/**
 * Bulk create sections (used when initializing SOW from diagnostic)
 */
export async function bulkCreateSections(sowId, sections) {
  if (!supabaseAdmin) return [];

  try {
    const rows = sections.map((s, idx) => ({
      sow_id: sowId,
      title: s.title,
      description: s.description || null,
      deliverables: s.deliverables || [],
      hours: s.hours || null,
      rate: s.rate || null,
      start_date: s.startDate || null,
      end_date: s.endDate || null,
      diagnostic_items: s.diagnosticItems || [],
      sort_order: s.sortOrder ?? idx,
    }));

    const { data, error } = await supabaseAdmin
      .from('sow_sections')
      .insert(rows)
      .select();

    if (error) {
      console.error('Error bulk creating sections:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Bulk create sections failed:', err);
    return [];
  }
}
