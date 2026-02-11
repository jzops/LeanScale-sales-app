/**
 * SOW PDF Export
 *
 * Generates a branded PDF from a SOW using @react-pdf/renderer.
 * Called server-side from the export API endpoint.
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import SowPdfDocument from '../components/sow/SowPdfDocument';

/**
 * Generate a PDF buffer for a SOW
 *
 * @param {Object} params
 * @param {Object} params.sow          - The SOW record
 * @param {Array}  params.sections     - SOW sections array
 * @param {Object} params.diagnosticResult - Linked diagnostic (optional)
 * @param {string} params.customerName - Customer name for header
 * @returns {Promise<Buffer>} PDF file as a Buffer
 */
export async function generateSowPdf({
  sow,
  sections = [],
  diagnosticResult = null,
  customerName = '',
  versionNumber = null,
}) {
  const document = React.createElement(SowPdfDocument, {
    sow,
    sections,
    diagnosticResult,
    customerName,
    versionNumber,
  });

  const buffer = await renderToBuffer(document);
  return buffer;
}

/**
 * Build a filename for the exported PDF
 *
 * @param {string} customerName
 * @param {string} date - ISO date string (defaults to now)
 * @returns {string} e.g. "Acme-SOW-2026-02-09.pdf"
 */
export function buildPdfFilename(customerName, date) {
  const d = date ? new Date(date) : new Date();
  const dateStr = d.toISOString().slice(0, 10);
  const safeName = (customerName || 'SOW')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${safeName}-SOW-${dateStr}.pdf`;
}
