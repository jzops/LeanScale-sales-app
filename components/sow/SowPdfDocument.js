/**
 * SowPdfDocument - React PDF template for SOW export
 *
 * Uses @react-pdf/renderer primitives (Document, Page, View, Text)
 * to generate a branded, print-ready PDF.
 *
 * Props:
 *   sow       - The SOW object
 *   sections  - Array of sow_sections
 *   diagnosticResult - Linked diagnostic result (optional)
 *   customerName     - Customer name for header
 */

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
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
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLORS.text,
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
  summaryBox: {
    backgroundColor: COLORS.bgLight,
    padding: 14,
    borderRadius: 4,
    borderLeft: `3px solid ${COLORS.primary}`,
    marginBottom: 20,
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
  tableFooter: {
    flexDirection: 'row',
    padding: '8 10',
    backgroundColor: COLORS.bgLight,
    borderTop: `2px solid ${COLORS.primary}`,
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

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});

const BAR_COLORS = ['#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#0984E3', '#A29BFE'];

export default function SowPdfDocument({
  sow,
  sections = [],
  diagnosticResult,
  customerName = '',
}) {
  const content = sow.content || {};
  const diagnosticProcesses = diagnosticResult?.processes || [];

  // Calculate totals
  const totalHours = sow.total_hours
    ? parseFloat(sow.total_hours)
    : sections.reduce((sum, s) => sum + (parseFloat(s.hours) || 0), 0);
  const totalInvestment = sow.total_investment
    ? parseFloat(sow.total_investment)
    : sections.reduce((sum, s) => {
        return sum + (parseFloat(s.hours) || 0) * (parseFloat(s.rate) || 0);
      }, 0);

  // Date range
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
        </View>

        {/* ===== EXECUTIVE SUMMARY ===== */}
        {content.executive_summary && (
          <View>
            <Text style={styles.sectionHeading}>Executive Summary</Text>
            <View style={styles.summaryBox}>
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
                <View key={section.id || idx} style={styles.scopeCard} wrap={false}>
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
          <View wrap={false} style={{ marginTop: 10 }}>
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
          <View wrap={false} style={{ marginTop: 10 }}>
            <Text style={styles.sectionHeading}>Investment Summary</Text>
            <View style={styles.table}>
              {/* Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colSection]}>Section</Text>
                <Text style={[styles.tableHeaderCell, styles.colHours]}>Hours</Text>
                <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
                <Text style={[styles.tableHeaderCell, styles.colSubtotal]}>Subtotal</Text>
              </View>

              {/* Rows */}
              {sections.map((section, idx) => {
                const h = parseFloat(section.hours) || 0;
                const r = parseFloat(section.rate) || 0;
                const subtotal = h * r;

                return (
                  <View
                    key={section.id || idx}
                    style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                  >
                    <Text style={[styles.tableCellBold, styles.colSection]}>{section.title}</Text>
                    <Text style={[styles.tableCell, styles.colHours]}>{h > 0 ? String(h) : '—'}</Text>
                    <Text style={[styles.tableCell, styles.colRate]}>{r > 0 ? `$${r.toLocaleString()}` : '—'}</Text>
                    <Text style={[styles.tableCellBold, styles.colSubtotal, { color: COLORS.green }]}>
                      {subtotal > 0 ? `$${subtotal.toLocaleString()}` : '—'}
                    </Text>
                  </View>
                );
              })}

              {/* Footer */}
              <View style={styles.tableFooter}>
                <Text style={[styles.tableCellBold, styles.colSection]}>Total</Text>
                <Text style={[styles.tableCellBold, styles.colHours]}>{totalHours > 0 ? String(totalHours) : ''}</Text>
                <Text style={[styles.tableCell, styles.colRate]}></Text>
                <Text style={[styles.tableCellBold, styles.colSubtotal, { color: COLORS.green, fontSize: 11 }]}>
                  ${totalInvestment.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ===== FOOTER ===== */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {customerName ? `${customerName} — ` : ''}{sow.title}
          </Text>
          <Text style={styles.footerBrand}>LeanScale</Text>
        </View>
      </Page>
    </Document>
  );
}
