/**
 * API endpoint for SOW PDF export
 * POST /api/sow/[id]/export - Generate PDF, create version, return PDF
 */

import { getSowById, updateSow } from '../../../../lib/sow';
import { listSections } from '../../../../lib/sow-sections';
import { createVersion, getNextVersionNumber } from '../../../../lib/sow-versions';
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
    // Load SOW and sections
    const sow = await getSowById(id);
    if (!sow) {
      return res.status(404).json({ success: false, error: 'SOW not found' });
    }

    const sections = await listSections(id);
    const { exportedBy, customerName } = req.body || {};

    // Generate PDF buffer
    const pdfBuffer = await generateSowPdf({
      sow,
      sections,
      diagnosticResult: null, // Could fetch if needed
      customerName: customerName || '',
    });

    // Create version snapshot
    const versionNumber = await getNextVersionNumber(id);
    const version = await createVersion({
      sowId: id,
      versionNumber,
      contentSnapshot: sow.content || {},
      sectionsSnapshot: sections,
      exportedBy: exportedBy || null,
    });

    // Update current_version on the SOW
    await updateSow(id, { current_version: versionNumber });

    // Build filename
    const filename = buildPdfFilename(customerName || sow.title);

    // Return PDF as download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Version-Number', String(versionNumber));
    res.setHeader('X-Version-Id', version?.id || '');
    return res.status(200).send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('Error exporting SOW PDF:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate PDF' });
  }
}
