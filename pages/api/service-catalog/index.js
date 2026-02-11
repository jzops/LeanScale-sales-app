/**
 * API endpoint for service catalog
 * GET  /api/service-catalog - List services (public)
 * POST /api/service-catalog - Create a new service (admin only)
 */

import { listServices, createService } from '../../../lib/service-catalog';
import { withAuth } from '../../../lib/api-middleware';
import { withErrorHandler, Errors } from '../../../lib/api-errors';
import { validate, serviceCatalogCreateBody, serviceCatalogQuery, validateSafe } from '../../../lib/api-validation';

async function publicGetHandler(req, res) {
  const { category, active, search } = req.query;
  const services = await listServices({
    category: category || undefined,
    active: active !== undefined ? active === 'true' : undefined,
    search: search || undefined,
  });
  return res.status(200).json({ success: true, data: services });
}

async function adminPostHandler(req, res) {
  const data = validate(serviceCatalogCreateBody, req.body);

  const service = await createService(data);
  if (!service) {
    throw Errors.internal('Failed to create service');
  }
  return res.status(201).json({ success: true, data: service });
}

async function routeHandler(req, res) {
  if (req.method === 'GET') {
    return publicGetHandler(req, res);
  }

  if (req.method === 'POST') {
    // POST requires admin auth
    return withAuth(withErrorHandler(adminPostHandler), { level: 'admin' })(req, res);
  }

  throw Errors.methodNotAllowed(req.method);
}

// GET is public, POST auth is handled inside
export default withErrorHandler(routeHandler);
