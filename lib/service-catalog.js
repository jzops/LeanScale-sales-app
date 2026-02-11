/**
 * Service Catalog CRUD operations
 *
 * Uses supabase (anon) for reads and supabaseAdmin (service_role) for writes.
 */

import { supabase, supabaseAdmin } from './supabase';

/**
 * List services with optional filters
 */
export async function listServices({ category, active, search } = {}) {
  if (!supabase) return [];

  try {
    let query = supabase.from('service_catalog').select('*');

    if (category) query = query.eq('category', category);
    if (active !== undefined) query = query.eq('active', active);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error } = await query.order('sort_order').order('name');

    if (error) {
      console.error('Error listing services:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('List services failed:', err);
    return [];
  }
}

/**
 * Get a single service by ID
 */
export async function getServiceById(id) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('service_catalog')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting service:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Get service failed:', err);
    return null;
  }
}

/**
 * Create a new service
 */
export async function createService(service) {
  if (!supabaseAdmin) throw new Error('Supabase admin not configured');

  const { data, error } = await supabaseAdmin
    .from('service_catalog')
    .insert(service)
    .select()
    .single();

  if (error) throw new Error(`Create service failed: ${error.message}`);
  return data;
}

/**
 * Update a service
 */
export async function updateService(id, updates) {
  if (!supabaseAdmin) throw new Error('Supabase admin not configured');

  const { data, error } = await supabaseAdmin
    .from('service_catalog')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Update service failed: ${error.message}`);
  return data;
}

/**
 * Delete a service (hard delete)
 */
export async function deleteService(id) {
  if (!supabaseAdmin) throw new Error('Supabase admin not configured');

  const { error } = await supabaseAdmin
    .from('service_catalog')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Delete service failed: ${error.message}`);
}

/**
 * Bulk insert services (for seeding)
 */
export async function bulkInsertServices(services) {
  if (!supabaseAdmin) throw new Error('Supabase admin not configured');

  const { data, error } = await supabaseAdmin
    .from('service_catalog')
    .insert(services)
    .select();

  if (error) throw new Error(`Bulk insert failed: ${error.message}`);
  return data;
}

/**
 * Get distinct categories
 */
export async function getCategories() {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('service_catalog')
      .select('category')
      .order('category');

    if (error) return [];
    const unique = [...new Set((data || []).map(d => d.category))];
    return unique;
  } catch {
    return [];
  }
}

/**
 * Search services for SOW section creation
 * Returns active services matching the query, useful for autocomplete
 */
export async function searchServices(query) {
  if (!supabase || !query) return [];

  try {
    const { data, error } = await supabase
      .from('service_catalog')
      .select('id, name, category, hours_low, hours_high, default_rate, project_type, primary_function, description')
      .eq('active', true)
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(20);

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}
