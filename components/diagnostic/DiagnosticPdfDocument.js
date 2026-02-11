/**
 * DiagnosticPdfDocument - React PDF template for Diagnostic export
 *
 * Uses @react-pdf/renderer primitives to generate a branded,
 * print-ready PDF of the GTM Diagnostic Assessment.
 *
 * Props:
 *   processes      - Array of process items with status, function, etc.
 *   notes          - Array of diagnostic_notes records
 *   customerName   - Customer name for header
 *   diagnosticType - 'gtm' | 'clay' | 'cpq'
 */

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';

const COLORS = {
  primary: '#6C5CE7',
  dark: '#1e1b4b',
  text: '#4A5568',
  textLight: '#718096',
  textMuted: '#A0AEC0',
  border: '#E2E8F0',
  bgLight: '#F7FAFC',
};

const STATUS_COLORS = {
  healthy: '#22c55e',
  careful: '#eab308',
  warning: '#ef4444',
  unable: '#1f2937',
  na: '#d1d5db',
};

const STATUS_LABELS = {
  healthy: 'Healthy',
  careful: 'Careful',
  warning: 'Warning',
  unable: 'Unable',
  na: 'N/A',
};

const TYPE_LABELS = {
  gtm: 'GTM Diagnostic Assessment',
  clay: 'Clay Diagnostic Assessment',
  cpq: 'Quote-to-Cash Diagnostic Assessment',
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 60,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: COLORS.text,
  },
  // Header
  header: {
    backgroundColor: COLORS.dark,
    color: 'white',
    padding: 20,
    marginBottom: 20,
    borderRadius: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#c4b5fd',
    marginBottom: 2,
  },
  date: {
    fontSize: 9,
    color: '#a5b4fc',
  },
  // Executive summary
  summaryBox: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    padding: 14,
    backgroundColor: COLORS.bgLight,
    borderRadius: 4,
    borderLeft: `3px solid ${COLORS.primary}`,
  },
  statItem: {
    textAlign: 'center',
    minWidth: 50,
  },
  statNum: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
  },
  statLabel: {
    fontSize: 7,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  // Section headings
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.dark,
    marginBottom: 8,
    marginTop: 16,
  },
  // Function health bars
  funcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  funcLabel: {
    width: 120,
    fontSize: 8,
    color: COLORS.text,
    fontFamily: 'Helvetica-Bold',
  },
  funcBar: {
    flexDirection: 'row',
    flex: 1,
    height: 10,
    borderRadius: 2,
    overflow: 'hidden',
  },
  funcBarSegment: {
    height: 10,
  },
  funcCount: {
    width: 30,
    fontSize: 7,
    color: COLORS.textMuted,
    textAlign: 'right',
  },
  // Process table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: '6 8',
    borderRadius: 2,
    marginBottom: 1,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '5 8',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    minHeight: 18,
  },
  tableRowAlt: {
    backgroundColor: COLORS.bgLight,
  },
  tableRowPriority: {
    backgroundColor: '#FFFBEB',
  },
  colName: { width: '32%' },
  colFunc: { width: '20%' },
  colStatus: { width: '12%', textAlign: 'center' },
  colPriority: { width: '10%', textAlign: 'center' },
  colNotes: { width: '26%' },
  cellText: {
    fontSize: 8,
    color: COLORS.text,
  },
  cellBold: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.dark,
  },
  cellMuted: {
    fontSize: 7,
    color: COLORS.textLight,
  },
  // Status dot
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 3,
  },
  statusInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Notes
  noteText: {
    fontSize: 7,
    color: COLORS.textLight,
    lineHeight: 1.4,
  },
  // Priority star
  priorityStar: {
    fontSize: 8,
    color: '#f59e0b',
    fontFamily: 'Helvetica-Bold',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textMuted,
  },
  footerBrand: {
    fontSize: 7,
    color: COLORS.primary,
    fontFamily: 'Helvetica-Bold',
  },
});

function countStatuses(items) {
  const counts = { healthy: 0, careful: 0, warning: 0, unable: 0, na: 0 };
  items.forEach(p => {
    const s = p.status || 'unable';
    if (counts.hasOwnProperty(s)) counts[s]++;
  });
  return counts;
}

function groupByFunction(processes) {
  const groups = {};
  processes.forEach(p => {
    const fn = p.function || 'Other';
    if (!groups[fn]) groups[fn] = [];
    groups[fn].push(p);
  });
  return groups;
}

export default function DiagnosticPdfDocument({
  processes = [],
  notes = [],
  customerName = '',
  diagnosticType = 'gtm',
}) {
  const stats = countStatuses(processes);
  const byFunction = groupByFunction(processes);
  const functionNames = Object.keys(byFunction).sort();
  const noteMap = {};
  notes.forEach(n => {
    if (!noteMap[n.process_name]) noteMap[n.process_name] = [];
    noteMap[n.process_name].push(n);
  });

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const title = TYPE_LABELS[diagnosticType] || 'Diagnostic Assessment';

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* HEADER */}
        <View style={styles.header} fixed={false}>
          <Text style={styles.title}>{title}</Text>
          {customerName && <Text style={styles.subtitle}>Prepared for {customerName}</Text>}
          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        {/* EXECUTIVE SUMMARY */}
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <View style={styles.summaryBox}>
          {Object.entries(stats).filter(([, v]) => v > 0).map(([status, count]) => (
            <View key={status} style={styles.statItem}>
              <Text style={[styles.statNum, { color: STATUS_COLORS[status] }]}>{count}</Text>
              <Text style={styles.statLabel}>{STATUS_LABELS[status]}</Text>
            </View>
          ))}
          <View style={[styles.statItem, { borderLeft: `1px solid ${COLORS.border}`, paddingLeft: 12 }]}>
            <Text style={[styles.statNum, { color: COLORS.primary }]}>{processes.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* HEALTH BY FUNCTION */}
        <Text style={styles.sectionTitle}>Health by Function</Text>
        <View style={{ marginBottom: 16 }}>
          {functionNames.map(fn => {
            const items = byFunction[fn];
            const fnStats = countStatuses(items);
            const total = items.length;
            return (
              <View key={fn} style={styles.funcRow}>
                <Text style={styles.funcLabel}>{fn}</Text>
                <View style={styles.funcBar}>
                  {['healthy', 'careful', 'warning', 'unable', 'na'].map(s =>
                    fnStats[s] > 0 ? (
                      <View
                        key={s}
                        style={[
                          styles.funcBarSegment,
                          {
                            backgroundColor: STATUS_COLORS[s],
                            width: `${(fnStats[s] / total) * 100}%`,
                          },
                        ]}
                      />
                    ) : null
                  )}
                </View>
                <Text style={styles.funcCount}>{total}</Text>
              </View>
            );
          })}
        </View>

        {/* FULL PROCESS TABLE */}
        <Text style={styles.sectionTitle}>Process Health Assessment</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colName]}>Process</Text>
          <Text style={[styles.tableHeaderCell, styles.colFunc]}>Function</Text>
          <Text style={[styles.tableHeaderCell, styles.colStatus]}>Status</Text>
          <Text style={[styles.tableHeaderCell, styles.colPriority]}>Priority</Text>
          <Text style={[styles.tableHeaderCell, styles.colNotes]}>Notes</Text>
        </View>
        {processes.map((p, i) => {
          const processNotes = noteMap[p.name] || [];
          const isPriority = p.addToEngagement;
          const rowStyle = [
            styles.tableRow,
            i % 2 === 1 ? styles.tableRowAlt : {},
            isPriority ? styles.tableRowPriority : {},
          ];
          return (
            <View key={p.name || i} style={rowStyle} wrap={false}>
              <Text style={[isPriority ? styles.cellBold : styles.cellText, styles.colName]}>
                {p.name}
              </Text>
              <Text style={[styles.cellMuted, styles.colFunc]}>
                {p.function || '-'}
              </Text>
              <View style={[styles.colStatus, styles.statusInline]}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[p.status] || '#9ca3af' }]} />
                <Text style={[styles.cellText, { color: STATUS_COLORS[p.status] || '#9ca3af' }]}>
                  {STATUS_LABELS[p.status] || p.status || 'Unable'}
                </Text>
              </View>
              <Text style={[styles.colPriority, isPriority ? styles.priorityStar : styles.cellMuted]}>
                {isPriority ? '★ Yes' : '-'}
              </Text>
              <View style={styles.colNotes}>
                {processNotes.length > 0 ? (
                  processNotes.map((n, ni) => (
                    <Text key={ni} style={styles.noteText}>
                      {n.note}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.noteText}>-</Text>
                )}
              </View>
            </View>
          );
        })}

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {customerName ? `${customerName} — ` : ''}{title}
          </Text>
          <Text style={styles.footerBrand}>LeanScale</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
