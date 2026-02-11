/**
 * InvestmentTable - Section-by-section pricing breakdown with total
 *
 * Props:
 *   sections       - Array of sow_sections with hours, rate
 *   totalHours     - Pre-calculated total hours (from SOW)
 *   totalInvestment - Pre-calculated total investment (from SOW)
 */

export default function InvestmentTable({ sections = [], totalHours, totalInvestment }) {
  // Calculate from sections if totals not provided
  const calcHours = totalHours ?? sections.reduce((sum, s) => sum + (parseFloat(s.hours) || 0), 0);
  const calcInvestment = totalInvestment ?? sections.reduce((sum, s) => {
    return sum + (parseFloat(s.hours) || 0) * (parseFloat(s.rate) || 0);
  }, 0);

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '0.75rem',
      overflow: 'hidden',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#6C5CE7' }}>
            <th style={thStyle}>Section</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Hours</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Rate</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Subtotal</th>
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
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 500, color: '#1a1a2e' }}>{section.title}</div>
                    {section.description && (
                      <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.125rem' }}>
                        {section.description.length > 80
                          ? section.description.slice(0, 80) + '...'
                          : section.description}
                      </div>
                    )}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {h > 0 ? h : '-'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {r > 0 ? `$${r.toLocaleString()}` : '-'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
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
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
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
    </div>
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
