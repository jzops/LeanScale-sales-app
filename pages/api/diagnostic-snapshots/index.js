/**
 * API endpoint for diagnostic snapshots
 * GET  /api/diagnostic-snapshots - List snapshots (optional filters: customerId, diagnosticType)
 * POST /api/diagnostic-snapshots - Create a new diagnostic snapshot
 */

import { listDiagnosticSnapshots, createDiagnosticSnapshot } from '../../../lib/sow';

// Valid diagnostic types
const VALID_DIAGNOSTIC_TYPES = ['gtm', 'clay', 'cpq'];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
  });
}

async function handleGet(req, res) {
  try {
    const { customerId, diagnosticType } = req.query;
    const snapshots = await listDiagnosticSnapshots({ customerId, diagnosticType });

    return res.status(200).json({
      success: true,
      data: snapshots,
    });
  } catch (error) {
    console.error('Error listing diagnostic snapshots:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

async function handlePost(req, res) {
  try {
    const { customerId, diagnosticType, data, assessedBy } = req.body;

    // Validation
    if (!diagnosticType || !VALID_DIAGNOSTIC_TYPES.includes(diagnosticType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid diagnosticType. Must be one of: ${VALID_DIAGNOSTIC_TYPES.join(', ')}`,
      });
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: 'data must be a non-empty object',
      });
    }

    const snapshot = await createDiagnosticSnapshot({
      customerId,
      diagnosticType,
      data,
      assessedBy,
    });

    if (!snapshot) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create diagnostic snapshot',
      });
    }

    return res.status(201).json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    console.error('Error creating diagnostic snapshot:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
