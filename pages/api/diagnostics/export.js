/**
 * API endpoint for Diagnostic PDF export
 *
 * GET /api/diagnostics/export?diagnosticType=gtm&customerId=<uuid>
 *
 * Fetches diagnostic_results + diagnostic_notes from Supabase,
 * renders DiagnosticPdfDocument to a buffer, and returns the PDF.
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import DiagnosticPdfDocument from '../../../components/diagnostic/DiagnosticPdfDocument';
import { getDiagnosticResult, getNotes } from '../../../lib/diagnostics';
import { supabaseAdmin } from '../../../lib/supabase';

const VALID_TYPES = ['gtm', 'clay', 'cpq'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { diagnosticType, customerId } = req.query;

  if (!diagnosticType || !VALID_TYPES.includes(diagnosticType)) {
    return res.status(400).json({
      success: false,
      error: `Invalid diagnosticType. Must be one of: ${VALID_TYPES.join(', ')}`,
    });
  }

  if (!customerId) {
    return res.status(400).json({ success: false, error: 'customerId is required' });
  }

  try {
    // Fetch diagnostic result
    const result = await getDiagnosticResult(customerId, diagnosticType);
    if (!result) {
      return res.status(404).json({ success: false, error: 'No diagnostic results found for this customer' });
    }

    // Fetch notes
    const notes = await getNotes(result.id);

    // Fetch customer name
    let customerName = '';
    if (supabaseAdmin) {
      const { data: customer } = await supabaseAdmin
        .from('customers')
        .select('customer_name')
        .eq('id', customerId)
        .single();
      customerName = customer?.customer_name || '';
    }

    // Render PDF
    const document = React.createElement(DiagnosticPdfDocument, {
      processes: result.processes || [],
      notes: notes || [],
      customerName,
      diagnosticType,
    });

    const pdfBuffer = await renderToBuffer(document);

    // Build filename
    const safeName = (customerName || 'Diagnostic')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `${safeName}-${diagnosticType}-diagnostic-${dateStr}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('Error exporting diagnostic PDF:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate PDF' });
  }
}
