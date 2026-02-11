/**
 * API endpoint for SOW list and creation
 * GET  /api/sow - List SOWs (optional filters: customerId, status)
 * POST /api/sow - Create a new SOW
 */

import { listSows, createSow } from '../../../lib/sow';
import { withAuth } from '../../../lib/api-middleware';
import { withErrorHandler, Errors } from '../../../lib/api-errors';
import { validate, sowCreateBody } from '../../../lib/api-validation';

async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  throw Errors.methodNotAllowed(req.method);
}

async function handleGet(req, res) {
  const { customerId, status } = req.query;
  const sows = await listSows({ customerId, status });

  return res.status(200).json({
    success: true,
    data: sows,
  });
}

async function handlePost(req, res) {
  const data = validate(sowCreateBody, req.body);

  const sow = await createSow(data);

  if (!sow) {
    throw Errors.internal('Failed to create SOW');
  }

  return res.status(201).json({
    success: true,
    data: sow,
  });
}

export default withAuth(withErrorHandler(handler), { level: 'admin' });
