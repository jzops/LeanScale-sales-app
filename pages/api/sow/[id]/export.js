/**
 * API endpoint for SOW PDF export
 * POST /api/sow/[id]/export - Generate and return PDF
 */

import { getSowById } from '../../../../lib/sow';
import { listSections } from '../../../../lib/sow-sections';
import { generateSowPdf, buildPdfFilename } from '../../../../lib/sow-export';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing SOW id' });
  }

  try {
    const sow = await getSowById(id);
    if (!sow) {
      return res.status(404).json({ success: false, error: 'SOW not found' });
    }

    const sections = await listSections(id);
    const { customerName } = req.body || {};

    const pdfBuffer = await generateSowPdf({
      sow,
      sections,
      diagnosticResult: null,
      customerName: customerName || '',
    });

    const filename = buildPdfFilename(customerName || sow.title);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('Error exporting SOW PDF:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate PDF' });
  }
}
