/**
 * API endpoint for SOW list and creation
 * GET  /api/sow - List SOWs (optional filters: customerId, status)
 * POST /api/sow - Create a new SOW
 */

import { listSows, createSow } from '../../../lib/sow';

// Valid SOW types
const VALID_SOW_TYPES = ['clay', 'q2c', 'embedded', 'custom'];

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
    const { customerId, status } = req.query;
    const sows = await listSows({ customerId, status });

    return res.status(200).json({
      success: true,
      data: sows,
    });
  } catch (error) {
    console.error('Error listing SOWs:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

async function handlePost(req, res) {
  try {
    const {
      customerId,
      title,
      sowType,
      intakeSubmissionId,
      transcriptText,
      diagnosticSnapshot,
      content,
      createdBy,
    } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'title is required',
      });
    }

    if (!sowType || !VALID_SOW_TYPES.includes(sowType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sowType. Must be one of: ${VALID_SOW_TYPES.join(', ')}`,
      });
    }

    const sow = await createSow({
      customerId,
      title,
      sowType,
      intakeSubmissionId,
      transcriptText,
      diagnosticSnapshot,
      content,
      createdBy,
    });

    if (!sow) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create SOW',
      });
    }

    return res.status(201).json({
      success: true,
      data: sow,
    });
  } catch (error) {
    console.error('Error creating SOW:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
