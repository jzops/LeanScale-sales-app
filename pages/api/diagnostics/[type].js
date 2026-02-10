/**
 * API endpoint for customer diagnostic results
 *
 * GET  /api/diagnostics/[type]?customerId=<uuid> — Get diagnostic results
 * PUT  /api/diagnostics/[type] — Create or update diagnostic results
 *
 * Supported types: gtm, clay, cpq
 */

import { getDiagnosticResult, upsertDiagnosticResult, getNotes } from '../../../lib/diagnostics';
import { getCustomerBySlug } from '../../../lib/supabase';

const VALID_TYPES = ['gtm', 'clay', 'cpq'];

/**
 * Resolve the customer slug from the request (set by middleware)
 * and validate that the requested customerId belongs to that customer.
 */
async function validateCustomerAccess(req, customerId) {
  // Admin paths bypass customer checks
  const referer = req.headers.referer || '';
  if (referer.includes('/admin/')) return true;

  const slug = req.headers['x-customer-slug'] || req.cookies?.['customer-slug'];
  if (!slug) return true; // No customer context = allow (demo/admin)

  try {
    const customer = await getCustomerBySlug(slug);
    if (!customer) return false;
    return customer.id === customerId;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  const { type } = req.query;

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({
      success: false,
      error: `Invalid diagnostic type. Must be one of: ${VALID_TYPES.join(', ')}`,
    });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, type);
  } else if (req.method === 'PUT') {
    return handlePut(req, res, type);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handleGet(req, res, type) {
  const { customerId } = req.query;

  if (!customerId) {
    return res.status(400).json({
      success: false,
      error: 'customerId query parameter is required',
    });
  }

  // Validate customer access
  const hasAccess = await validateCustomerAccess(req, customerId);
  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      error: 'Access denied — customerId does not match your session',
    });
  }

  try {
    const result = await getDiagnosticResult(customerId, type);

    if (!result) {
      // No saved data — client should use static/demo data
      return res.status(200).json({
        success: true,
        data: null,
        notes: [],
      });
    }

    // Also fetch notes for this result
    const notes = await getNotes(result.id);

    return res.status(200).json({
      success: true,
      data: result,
      notes,
    });
  } catch (error) {
    console.error('Error fetching diagnostic result:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

async function handlePut(req, res, type) {
  const { customerId, processes, tools, createdBy } = req.body;

  if (!customerId) {
    return res.status(400).json({
      success: false,
      error: 'customerId is required',
    });
  }

  if (!processes || !Array.isArray(processes)) {
    return res.status(400).json({
      success: false,
      error: 'processes must be an array',
    });
  }

  // Validate customer access
  const hasAccess = await validateCustomerAccess(req, customerId);
  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      error: 'Access denied — customerId does not match your session',
    });
  }

  try {
    const result = await upsertDiagnosticResult({
      customerId,
      diagnosticType: type,
      processes,
      tools,
      createdBy,
    });

    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Failed to save diagnostic results',
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error saving diagnostic result:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
