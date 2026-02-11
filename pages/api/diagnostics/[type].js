/**
 * API endpoint for customer diagnostic results
 *
 * GET  /api/diagnostics/[type]?customerId=<uuid> — Get diagnostic results
 * PUT  /api/diagnostics/[type] — Create or update diagnostic results
 *
 * Supported types: gtm, clay, cpq
 */

import { getDiagnosticResult, upsertDiagnosticResult, getNotes } from '../../../lib/diagnostics';
import { withAuth } from '../../../lib/api-middleware';
import { withErrorHandler, Errors } from '../../../lib/api-errors';
import { validate, diagnosticGetQuery, diagnosticPutBody } from '../../../lib/api-validation';

const VALID_TYPES = ['gtm', 'clay', 'cpq'];

async function handler(req, res) {
  const { type } = req.query;

  if (!VALID_TYPES.includes(type)) {
    throw Errors.validation(`Invalid diagnostic type. Must be one of: ${VALID_TYPES.join(', ')}`);
  }

  if (req.method === 'GET') {
    return handleGet(req, res, type);
  } else if (req.method === 'PUT') {
    return handlePut(req, res, type);
  }

  throw Errors.methodNotAllowed(req.method);
}

async function handleGet(req, res, type) {
  const { customerId } = req.query;

  if (!customerId) {
    throw Errors.validation('customerId query parameter is required');
  }

  // Verify customer access — req.customer is set by withAuth
  if (req.customer && !req.customer.isDemo && req.customer.id !== customerId) {
    throw Errors.forbidden('Access denied — customerId does not match your session');
  }

  const result = await getDiagnosticResult(customerId, type);

  if (!result) {
    return res.status(200).json({
      success: true,
      data: null,
      notes: [],
    });
  }

  const notes = await getNotes(result.id);

  return res.status(200).json({
    success: true,
    data: result,
    notes,
  });
}

async function handlePut(req, res, type) {
  const data = validate(diagnosticPutBody, req.body);

  // Verify customer access
  if (req.customer && !req.customer.isDemo && req.customer.id !== data.customerId) {
    throw Errors.forbidden('Access denied — customerId does not match your session');
  }

  const result = await upsertDiagnosticResult({
    customerId: data.customerId,
    diagnosticType: type,
    processes: data.processes,
    tools: data.tools,
    createdBy: data.createdBy,
  });

  if (!result) {
    throw Errors.internal('Failed to save diagnostic results');
  }

  return res.status(200).json({
    success: true,
    data: result,
  });
}

export default withAuth(withErrorHandler(handler), { level: 'customer' });
