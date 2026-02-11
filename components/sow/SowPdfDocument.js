/**
 * SowPdfDocument - React PDF template for SOW export
 *
 * Uses @react-pdf/renderer primitives (Document, Page, View, Text)
 * to generate a branded, print-ready PDF.
 *
 * Props:
 *   sow              - The SOW object
 *   sections         - Array of sow_sections
 *   diagnosticResult - Linked diagnostic result (optional)
 *   customerName     - Customer name for header
 *   versionNumber    - Version number (for watermark)
 */

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';

// Color palette matching LeanScale brand
const COLORS = {
  primary: '#6C5CE7',
  primaryLight: '#EDE9FE',
  dark: '#1a1a2e',
  text: '#4A5568',
  textLight: '#718096',
  textMuted: '#A0AEC0',
  border: '#E2E8F0',
  bgLight: '#F7FAFC',
  green: '#276749',
  greenBg: '#F0FDF4',
  red: '#9B2C2C',
  yellow: '#975A16',
  watermark: 'rgba(108, 92, 231, 0.06)',
};

const STATUS_COLORS = {
  healthy: '#22c55e',
  careful: '#eab308',
  warning: '#ef4444',
  unable: '#1f2937',
};

const styles = StyleSheet.create({
  page: {
    padding: 50,
    paddingBottom: 70,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLORS.text,
  },

  // Watermark
  watermark: {
    position: 'absolute',
    top: '35%',
    left: '15%',
    fontSize: 80,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.watermark,
    transform: 'rotate(-35deg)',
    opacity: 1,
  },

  // Header
  header: {
    marginBottom: 30,
    borderBottom: `2px solid ${COLORS.primary}`,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  headerMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  metaItem: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  metaValue: {
    fontFamily: 'Helvetica-Bold',
    color: COLORS.text,
  },

  // Generation date / validity bar
  validityBar: {
    marginTop: 6,
    paddingTop: 6,
    borderTop: `1px solid ${COLORS.border}`,
  },
  validityText: {
    fontSize: 8,
    color: COLORS.textMuted,
  },

  // Table of Contents
  tocContainer: {
    marginBottom: 20,
    padding: 14,
    backgroundColor: COLORS.bgLight,
    borderRadius: 4,
    border: `1px solid ${COLORS.border}`,
  },
  tocTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.dark,
    marginBottom: 10,
  },
  tocItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottom: `1px dotted ${COLORS.border}`,
  },
  tocItemText: {
    fontSize: 9,
    color: COLORS.text,
  },
  tocItemPage: {
    fontSize: 9,
    color: COLORS.primary,
    fontFamily: 'Helvetica-Bold',
  },

  // Section headings
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    color: COLORS.dark,
    marginBottom: 10,
    marginTop: 20,
  },

  // Executive summary
  execSummaryContainer: {
    marginBottom: 20,
    minPresenceAhead: 100,
  },
  summaryBox: {
    backgroundColor: COLORS.bgLight,
    padding: 14,
    borderRadius: 4,
    borderLeft: `3px solid ${COLORS.primary}`,
  },
  summaryLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: COLORS.text,
  },

  // Scope sections
  scopeCard: {
    marginBottom: 14,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scopeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10 14',
    backgroundColor: COLORS.bgLight,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  scopeTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.dark,
  },
  scopeBody: {
    padding: 14,
  },
  scopeDescription: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: COLORS.text,
    marginBottom: 8,
  },
  scopeMeta: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 4,
  },
  scopeMetaItem: {
    fontSize: 9,
    color: COLORS.textLight,
  },

  // Deliverables
  deliverablesHeading: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
  },
  deliverableItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  deliverableBullet: {
    fontSize: 9,
    color: COLORS.primary,
    marginRight: 6,
    width: 8,
  },
  deliverableText: {
    fontSize: 9,
    color: COLORS.text,
    flex: 1,
  },

  // Diagnostic items
  diagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 3,
  },
  diagDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 4,
  },
  diagName: {
    fontSize: 8,
    color: COLORS.textLight,
  },

  // Investment table
  table: {
    marginTop: 10,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: '8 10',
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '7 10',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  tableRowAlt: {
    backgroundColor: COLORS.bgLight,
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.text,
  },
  tableCellBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.dark,
  },
  // Subtotal row per function group
  subtotalRow: {
    flexDirection: 'row',
    padding: '6 10',
    backgroundColor: COLORS.primaryLight,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  tableFooter: {
    flexDirection: 'row',
    padding: '10 10',
    backgroundColor: COLORS.dark,
  },
  tableFooterCell: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
  },

  // Column widths for table
  colSection: { width: '40%' },
  colHours: { width: '15%', textAlign: 'right' },
  colRate: { width: '20%', textAlign: 'right' },
  colSubtotal: { width: '25%', textAlign: 'right' },

  // Timeline
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  timelineLabel: {
    width: 120,
    fontSize: 8,
    color: COLORS.text,
    textAlign: 'right',
    paddingRight: 8,
  },
  timelineDates: {
    fontSize: 8,
    color: COLORS.textLight,
  },
  timelineBar: {
    height: 10,
    borderRadius: 2,
    minWidth: 20,
  },

  // Footer (fixed on every page)
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  footerBrand: {
    fontSize: 8,
    color: COLORS.primary,
    fontFamily: 'Helvetica-Bold',
  },
  footerPageNumber: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
});

const BAR_COLORS = ['#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#0984E3', '#A29BFE'];

/**
 * Group sections by their `function_area` (or 'General') and compute subtotals.
 */
function groupSectionsByFunction(sections) {
  const groups = {};
  for (const section of sections) {
    const key = section.function_area || 'General';
    if (!groups[key]) groups[key] = { label: key, sections: [], totalHours: 0, totalCost: 0 };
    const h = parseFloat(section.hours) || 0;
    const r = parseFloat(section.rate) || 0;
    groups[key].sections.push(section);
    groups[key].totalHours += h;
    groups[key].totalCost += h * r;
  }
  return Object.values(groups);
}

export default function SowPdfDocument({
  sow,
  sections = [],
  diagnosticResult,
  customerName = '',
  versionNumber,
}) {
  const content = sow.content || {};
  const diagnosticProcesses = diagnosticResult?.processes || [];
  const isDraft = sow.status === 'draft';

  // Calculate totals
  const totalHours = sow.total_hours
    ? parseFloat(sow.total_hours)
    : sections.reduce((sum, s) => sum + (parseFloat(s.hours) || 0), 0);
  const totalInvestment = sow.total_investment
    ? parseFloat(sow.total_investment)
    : sections.reduce((sum, s) => {
        return sum + (parseFloat(s.hours) || 0) * (parseFloat(s.rate) || 0);
      }, 0);

  // Dates
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const formattedValidUntil = validUntil.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Watermark text
  const watermarkText = isDraft ? 'DRAFT' : versionNumber ? `v${versionNumber}` : null;

  // Build TOC entries
  const tocEntries = [];
  if (content.executive_summary) tocEntries.push('Executive Summary');
  if (sections.length > 0) tocEntries.push('Scope of Work');
  if (sections.some(s => s.start_date && s.end_date)) tocEntries.push('Timeline');
  if (sections.length > 0) tocEntries.push('Investment Summary');

  // Group sections for investment table
  const functionGroups = groupSectionsByFunction(sections);
  const hasMultipleGroups = functionGroups.length > 1;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ===== WATERMARK ===== */}
        {watermarkText && (
          <Text style={styles.watermark} fixed>
            {watermarkText}
          </Text>
        )}

        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{sow.title}</Text>
          <Text style={styles.headerSubtitle}>
            {customerName ? `Prepared for ${customerName}` : 'Statement of Work'}
          </Text>
          <View style={styles.headerMeta}>
            <Text style={styles.metaItem}>
              Date: <Text style={styles.metaValue}>{formattedDate}</Text>
            </Text>
            <Text style={styles.metaItem}>
              Type: <Text style={styles.metaValue}>{sow.sow_type}</Text>
            </Text>
            {versionNumber && (
              <Text style={styles.metaItem}>
                Version: <Text style={styles.metaValue}>v{versionNumber}</Text>
              </Text>
            )}
            {totalHours > 0 && (
              <Text style={styles.metaItem}>
                Total Hours: <Text style={styles.metaValue}>{totalHours}</Text>
              </Text>
            )}
            {totalInvestment > 0 && (
              <Text style={styles.metaItem}>
                Investment: <Text style={styles.metaValue}>${totalInvestment.toLocaleString()}</Text>
              </Text>
            )}
          </View>
          {/* Generation date and validity */}
          <View style={styles.validityBar}>
            <Text style={styles.validityText}>
              Generated: {formattedDate} | Valid for 30 days (until {formattedValidUntil})
              {isDraft ? ' | STATUS: DRAFT' : ''}
            </Text>
          </View>
        </View>

        {/* ===== TABLE OF CONTENTS ===== */}
        {tocEntries.length > 0 && (
          <View style={styles.tocContainer} wrap={false}>
            <Text style={styles.tocTitle}>Table of Contents</Text>
            {tocEntries.map((entry, idx) => (
              <View key={idx} style={styles.tocItem}>
                <Text style={styles.tocItemText}>
                  {idx + 1}. {entry}
                </Text>
              </View>
            ))}
            {/* Scope subsections */}
            {sections.map((section, idx) => (
              <View key={`sub-${idx}`} style={[styles.tocItem, { paddingLeft: 16 }]}>
                <Text style={[styles.tocItemText, { color: COLORS.textLight, fontSize: 8 }]}>
                  {idx + 1}. {section.title}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ===== EXECUTIVE SUMMARY ===== */}
        {content.executive_summary && (
          <View style={styles.execSummaryContainer} minPresenceAhead={100}>
            <Text style={styles.sectionHeading}>Executive Summary</Text>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Overview</Text>
              <Text style={styles.summaryText}>{content.executive_summary}</Text>
            </View>
          </View>
        )}

        {/* ===== SCOPE OF WORK ===== */}
        {sections.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>Scope of Work</Text>
            {sections.map((section, idx) => {
              const h = parseFloat(section.hours) || 0;
              const r = parseFloat(section.rate) || 0;
              const subtotal = h * r;
              const deliverables = section.deliverables || [];
              const linkedItems = section.diagnostic_items || [];

              return (
                <View
                  key={section.id || idx}
                  style={styles.scopeCard}
                  wrap={false}
                  minPresenceAhead={80}
                >
                  <View style={styles.scopeHeader}>
                    <Text style={styles.scopeTitle}>
                      {idx + 1}. {section.title}
                    </Text>
                    {subtotal > 0 && (
                      <Text style={[styles.tableCell, { color: COLORS.green, fontFamily: 'Helvetica-Bold' }]}>
                        ${subtotal.toLocaleString()}
                      </Text>
                    )}
                  </View>
                  <View style={styles.scopeBody}>
                    {section.description && (
                      <Text style={styles.scopeDescription}>{section.description}</Text>
                    )}

                    <View style={styles.scopeMeta}>
                      {h > 0 && (
                        <Text style={styles.scopeMetaItem}>Hours: {h}</Text>
                      )}
                      {r > 0 && (
                        <Text style={styles.scopeMetaItem}>Rate: ${r.toLocaleString()}/hr</Text>
                      )}
                      {section.start_date && (
                        <Text style={styles.scopeMetaItem}>
                          Start: {new Date(section.start_date).toLocaleDateString()}
                        </Text>
                      )}
                      {section.end_date && (
                        <Text style={styles.scopeMetaItem}>
                          End: {new Date(section.end_date).toLocaleDateString()}
                        </Text>
                      )}
                    </View>

                    {deliverables.length > 0 && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={styles.deliverablesHeading}>Deliverables</Text>
                        {deliverables.map((d, dIdx) => (
                          <View key={dIdx} style={styles.deliverableItem}>
                            <Text style={styles.deliverableBullet}>•</Text>
                            <Text style={styles.deliverableText}>{d}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {linkedItems.length > 0 && diagnosticProcesses.length > 0 && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={styles.deliverablesHeading}>Addresses Diagnostic Findings</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                          {linkedItems.map((name, nIdx) => {
                            const proc = diagnosticProcesses.find(p => p.name === name);
                            const statusColor = proc
                              ? STATUS_COLORS[proc.status] || '#9ca3af'
                              : '#9ca3af';
                            return (
                              <View key={nIdx} style={styles.diagItem}>
                                <View style={[styles.diagDot, { backgroundColor: statusColor }]} />
                                <Text style={styles.diagName}>{name}</Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ===== TIMELINE ===== */}
        {sections.some(s => s.start_date && s.end_date) && (
          <View wrap={false} style={{ marginTop: 10 }} minPresenceAhead={60}>
            <Text style={styles.sectionHeading}>Timeline</Text>
            {sections
              .filter(s => s.start_date && s.end_date)
              .map((section, idx) => {
                const startStr = new Date(section.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const endStr = new Date(section.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const color = BAR_COLORS[idx % BAR_COLORS.length];

                return (
                  <View key={section.id || idx} style={styles.timelineRow}>
                    <Text style={styles.timelineLabel}>{section.title}</Text>
                    <View style={[styles.timelineBar, { backgroundColor: color, width: 100 }]} />
                    <Text style={[styles.timelineDates, { marginLeft: 6 }]}>
                      {startStr} — {endStr}
                    </Text>
                  </View>
                );
              })}
          </View>
        )}

        {/* ===== INVESTMENT TABLE ===== */}
        {sections.length > 0 && (
          <View wrap={false} style={{ marginTop: 10 }} minPresenceAhead={80}>
            <Text style={styles.sectionHeading}>Investment Summary</Text>
            <View style={styles.table}>
              {/* Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colSection]}>Section</Text>
                <Text style={[styles.tableHeaderCell, styles.colHours]}>Hours</Text>
                <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
                <Text style={[styles.tableHeaderCell, styles.colSubtotal]}>Subtotal</Text>
              </View>

              {/* Rows grouped by function */}
              {functionGroups.map((group, gIdx) => {
                let rowIndex = 0;
                return (
                  <View key={gIdx}>
                    {/* Group label if multiple groups */}
                    {hasMultipleGroups && (
                      <View style={[styles.tableRow, { backgroundColor: COLORS.primaryLight }]}>
                        <Text style={[styles.tableCellBold, { color: COLORS.primary, fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5 }]}>
                          {group.label}
                        </Text>
                      </View>
                    )}

                    {group.sections.map((section, idx) => {
                      const h = parseFloat(section.hours) || 0;
                      const r = parseFloat(section.rate) || 0;
                      const subtotal = h * r;
                      const isAlt = rowIndex % 2 === 1;
                      rowIndex++;

                      return (
                        <View
                          key={section.id || idx}
                          style={[styles.tableRow, isAlt ? styles.tableRowAlt : {}]}
                        >
                          <Text style={[styles.tableCellBold, styles.colSection]}>
                            {hasMultipleGroups ? '  ' : ''}{section.title}
                          </Text>
                          <Text style={[styles.tableCell, styles.colHours]}>{h > 0 ? String(h) : '—'}</Text>
                          <Text style={[styles.tableCell, styles.colRate]}>{r > 0 ? `$${r.toLocaleString()}` : '—'}</Text>
                          <Text style={[styles.tableCellBold, styles.colSubtotal, { color: COLORS.green }]}>
                            {subtotal > 0 ? `$${subtotal.toLocaleString()}` : '—'}
                          </Text>
                        </View>
                      );
                    })}

                    {/* Subtotal row per group (only if multiple groups) */}
                    {hasMultipleGroups && (
                      <View style={styles.subtotalRow}>
                        <Text style={[styles.tableCellBold, styles.colSection, { fontSize: 8, color: COLORS.primary }]}>
                          {group.label} Subtotal
                        </Text>
                        <Text style={[styles.tableCellBold, styles.colHours, { fontSize: 8, color: COLORS.primary }]}>
                          {group.totalHours > 0 ? String(group.totalHours) : ''}
                        </Text>
                        <Text style={[styles.tableCell, styles.colRate]}></Text>
                        <Text style={[styles.tableCellBold, styles.colSubtotal, { fontSize: 9, color: COLORS.primary }]}>
                          ${group.totalCost.toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}

              {/* Grand Total Footer */}
              <View style={styles.tableFooter}>
                <Text style={[styles.tableFooterCell, styles.colSection]}>Grand Total</Text>
                <Text style={[styles.tableFooterCell, styles.colHours]}>{totalHours > 0 ? String(totalHours) : ''}</Text>
                <Text style={[styles.tableFooterCell, styles.colRate]}></Text>
                <Text style={[styles.tableFooterCell, styles.colSubtotal, { fontSize: 12 }]}>
                  ${totalInvestment.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ===== FOOTER (fixed on every page) ===== */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {customerName ? `${customerName} — ` : ''}{sow.title}
          </Text>
          <Text
            style={styles.footerPageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
          <Text style={styles.footerBrand}>LeanScale</Text>
        </View>
      </Page>
    </Document>
  );
}
