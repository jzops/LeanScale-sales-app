/**
 * API endpoint for a specific SOW version
 * GET /api/sow/[id]/versions/[versionId]          - Get version details
 * GET /api/sow/[id]/versions/[versionId]?pdf=true  - Regenerate and download PDF from snapshot
 */

import { getSowById } from '../../../../../lib/sow';
import { getVersionById } from '../../../../../lib/sow-versions';
import { generateSowPdf, buildPdfFilename } from '../../../../../lib/sow-export';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id, versionId, pdf } = req.query;

  if (!id || !versionId) {
    return res.status(400).json({ success: false, error: 'Missing SOW id or version id' });
  }

  try {
    const version = await getVersionById(versionId);
    if (!version || version.sow_id !== id) {
      return res.status(404).json({ success: false, error: 'Version not found' });
    }

    // If ?pdf=true, regenerate PDF from snapshot and return as download
    if (pdf === 'true') {
      const sow = await getSowById(id);
      const snapshotSow = {
        ...sow,
        content: version.content_snapshot || sow?.content || {},
      };
      const snapshotSections = version.sections_snapshot || [];

      const pdfBuffer = await generateSowPdf({
        sow: snapshotSow,
        sections: snapshotSections,
        customerName: '',
      });

      const filename = buildPdfFilename(
        sow?.title || 'SOW',
        version.exported_at,
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(Buffer.from(pdfBuffer));
    }

    // Otherwise return version metadata
    return res.status(200).json({ success: true, data: version });
  } catch (error) {
    console.error('Error fetching version:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
