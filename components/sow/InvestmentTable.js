import { motion } from 'framer-motion';
import EditableField from './EditableField';
import EditableNumber from './EditableNumber';
import { fadeUpItem } from '../../lib/animations';

/**
 * InvestmentTable - Editable section-by-section pricing breakdown with total.
 *
 * Every cell is editable when not in readOnly mode:
 * - Section name, hours, rate are all clickable inline-edit fields.
 * - Subtotals auto-calculate from hours * rate.
 * - Total row auto-sums.
 *
 * @param {Array} sections - Array of sow_sections with hours, rate
 * @param {number} totalHours - Pre-calculated total hours (from SOW)
 * @param {number} totalInvestment - Pre-calculated total investment (from SOW)
 * @param {boolean} readOnly - If true, all cells are static
 * @param {function} onSectionChange - Called with (sectionId, field, value)
 */
export default function InvestmentTable({
  sections = [],
  totalHours,
  totalInvestment,
  readOnly = false,
  onSectionChange,
}) {
  // Calculate from sections (reflects latest local edits)
  const calcHours = sections.reduce((sum, s) => sum + (parseFloat(s.hours) || 0), 0);
  const calcInvestment = sections.reduce((sum, s) => {
    return sum + (parseFloat(s.hours) || 0) * (parseFloat(s.rate) || 0);
  }, 0);

  return (
    <motion.div
      variants={fadeUpItem}
      initial="hidden"
      animate="show"
      style={{
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '0.75rem',
        overflow: 'hidden',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#6C5CE7' }}>
            <th style={thStyle}>Section</th>
            <th style={{ ...thStyle, textAlign: 'right', width: '120px' }}>Hours</th>
            <th style={{ ...thStyle, textAlign: 'right', width: '120px' }}>Rate</th>
            <th style={{ ...thStyle, textAlign: 'right', width: '140px' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {sections.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: '#A0AEC0', fontSize: '0.875rem' }}>
                No sections defined yet
              </td>
            </tr>
          ) : (
            sections.map((section, idx) => {
              const h = parseFloat(section.hours) || 0;
              const r = parseFloat(section.rate) || 0;
              const subtotal = h * r;

              return (
                <tr key={section.id || idx} style={{ borderBottom: '1px solid #EDF2F7' }}>
                  {/* Section name */}
                  <td style={tdStyle}>
                    <EditableField
                      value={section.title}
                      onCommit={(val) => onSectionChange?.(section.id, 'title', val)}
                      readOnly={readOnly}
                      placeholder="Section name..."
                      style={{ fontWeight: 500, color: '#1a1a2e', fontSize: '0.875rem' }}
                    />
                    {section.description && (
                      <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.125rem', paddingLeft: '0.5rem' }}>
                        {section.description.length > 80
                          ? section.description.slice(0, 80) + '...'
                          : section.description}
                      </div>
                    )}
                  </td>

                  {/* Hours */}
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <EditableNumber
                      value={h}
                      onCommit={(val) => onSectionChange?.(section.id, 'hours', val)}
                      readOnly={readOnly}
                      format="number"
                      placeholder="-"
                      style={{ fontSize: '0.875rem', color: '#4A5568' }}
                    />
                  </td>

                  {/* Rate */}
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <EditableNumber
                      value={r}
                      onCommit={(val) => onSectionChange?.(section.id, 'rate', val)}
                      readOnly={readOnly}
                      format="currency"
                      placeholder="-"
                      style={{ fontSize: '0.875rem', color: '#4A5568' }}
                    />
                  </td>

                  {/* Subtotal (always computed, not editable) */}
                  <td style={{
                    ...tdStyle,
                    textAlign: 'right',
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                    color: '#4A5568',
                  }}>
                    {subtotal > 0 ? `$${subtotal.toLocaleString()}` : '-'}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        {sections.length > 0 && (
          <tfoot>
            <tr style={{ background: '#F7FAFC', borderTop: '2px solid #6C5CE7' }}>
              <td style={{ ...tdStyle, fontWeight: 700, color: '#1a1a2e' }}>Total</td>
              <td style={{
                ...tdStyle,
                textAlign: 'right',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {calcHours}
              </td>
              <td style={tdStyle}></td>
              <td style={{
                ...tdStyle,
                textAlign: 'right',
                fontWeight: 700,
                fontSize: '1.05rem',
                color: '#276749',
                fontVariantNumeric: 'tabular-nums',
              }}>
                ${calcInvestment.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </motion.div>
  );
}

const thStyle = {
  padding: '0.75rem 1rem',
  color: 'white',
  fontWeight: 600,
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  textAlign: 'left',
};

const tdStyle = {
  padding: '0.75rem 1rem',
  fontSize: '0.875rem',
  color: '#4A5568',
};
