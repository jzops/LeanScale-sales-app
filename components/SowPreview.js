/**
 * SowPreview - Reusable SOW content renderer
 *
 * Renders the JSONB content object from a SOW record
 * into a formatted, section-by-section document view.
 *
 * Used by the SOW detail page and potentially a print/PDF view.
 */

export default function SowPreview({ content }) {
  const c = content || {};

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Executive Summary */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={sectionHeadingStyle}>Executive Summary</h2>
        <p style={paragraphStyle}>
          {c.executive_summary || 'No executive summary provided.'}
        </p>
      </section>

      {/* Client Information */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={sectionHeadingStyle}>Client Information</h2>
        {c.client_info ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}>
            {c.client_info.company && (
              <InfoField label="Company" value={c.client_info.company} />
            )}
            {c.client_info.primary_contact && (
              <InfoField label="Primary Contact" value={c.client_info.primary_contact} />
            )}
            {c.client_info.stage && (
              <InfoField label="Stage" value={c.client_info.stage} />
            )}
            {c.client_info.crm && (
              <InfoField label="CRM" value={c.client_info.crm} />
            )}
            {c.client_info.industry && (
              <InfoField label="Industry" value={c.client_info.industry} />
            )}
          </div>
        ) : (
          <p style={paragraphStyle}>No client information available.</p>
        )}
      </section>

      {/* Scope */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={sectionHeadingStyle}>Scope</h2>
        {c.scope && c.scope.length > 0 ? (
          c.scope.map((item, idx) => (
            <div key={idx} style={{
              marginBottom: '1rem',
              padding: '1rem',
              border: '1px solid #E2E8F0',
              borderRadius: '0.5rem',
              background: '#FAFAFA',
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: '#1a1a2e',
                marginBottom: '0.5rem',
              }}>
                {item.title}
              </h3>
              <p style={{ ...paragraphStyle, marginBottom: '0.5rem' }}>
                {item.description}
              </p>
              {item.deliverables && item.deliverables.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {item.deliverables.map((d, dIdx) => (
                    <li key={dIdx} style={{ fontSize: '0.875rem', color: '#4A5568', marginBottom: '0.25rem' }}>
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        ) : (
          <p style={paragraphStyle}>No scope defined.</p>
        )}
      </section>

      {/* Deliverables Table */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={sectionHeadingStyle}>Deliverables</h2>
        {c.deliverables_table && c.deliverables_table.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle} role="table">
              <thead>
                <tr>
                  <th style={thStyle}>Deliverable</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Integration</th>
                </tr>
              </thead>
              <tbody>
                {c.deliverables_table.map((row, idx) => (
                  <tr key={idx}>
                    <td style={tdStyle}>{row.deliverable}</td>
                    <td style={tdStyle}>{row.description}</td>
                    <td style={tdStyle}>{row.integration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={paragraphStyle}>No deliverables defined.</p>
        )}
      </section>

      {/* Timeline */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={sectionHeadingStyle}>Timeline</h2>
        {c.timeline && c.timeline.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {c.timeline.map((phase, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '0.75rem 1rem',
                border: '1px solid #E2E8F0',
                borderRadius: '0.5rem',
                background: idx % 2 === 0 ? '#FAFAFA' : 'white',
              }}>
                <div style={{
                  minWidth: '80px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#6C5CE7',
                }}>
                  {phase.phase}
                </div>
                <div style={{ flex: 1, fontSize: '0.875rem', color: '#4A5568' }}>
                  {phase.activities}
                </div>
                <div style={{
                  minWidth: '70px',
                  textAlign: 'right',
                  fontSize: '0.8rem',
                  color: '#718096',
                }}>
                  {phase.duration}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={paragraphStyle}>No timeline defined.</p>
        )}
      </section>

      {/* Investment */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={sectionHeadingStyle}>Investment</h2>
        {c.investment ? (
          <div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1a1a2e',
              marginBottom: '0.5rem',
            }}>
              ${(c.investment.total || 0).toLocaleString()}
            </div>
            <p style={{ ...paragraphStyle, marginBottom: '1rem' }}>
              {c.investment.payment_terms}
            </p>
            {c.investment.breakdown && c.investment.breakdown.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {c.investment.breakdown.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    background: '#FAFAFA',
                    borderRadius: '0.375rem',
                    border: '1px solid #E2E8F0',
                  }}>
                    <span style={{ fontSize: '0.875rem', color: '#4A5568' }}>{item.item}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a2e' }}>
                      ${(item.amount || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p style={paragraphStyle}>No investment information available.</p>
        )}
      </section>

      {/* Team */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={sectionHeadingStyle}>Team</h2>
        {c.team && c.team.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {c.team.map((member, idx) => (
              <div key={idx} style={{
                display: 'flex',
                gap: '1rem',
                padding: '0.75rem 1rem',
                border: '1px solid #E2E8F0',
                borderRadius: '0.5rem',
              }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1a1a2e', minWidth: '180px' }}>
                  {member.role}
                </span>
                <span style={{ fontSize: '0.875rem', color: '#4A5568' }}>
                  {member.responsibility}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={paragraphStyle}>No team information available.</p>
        )}
      </section>

      {/* Assumptions */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={sectionHeadingStyle}>Assumptions</h2>
        {c.assumptions && c.assumptions.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {c.assumptions.map((item, idx) => (
              <li key={idx} style={{ fontSize: '0.875rem', color: '#4A5568', marginBottom: '0.375rem', lineHeight: 1.6 }}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p style={paragraphStyle}>No assumptions listed.</p>
        )}
      </section>

      {/* Acceptance Criteria */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={sectionHeadingStyle}>Acceptance Criteria</h2>
        {c.acceptance_criteria && c.acceptance_criteria.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {c.acceptance_criteria.map((item, idx) => (
              <li key={idx} style={{ fontSize: '0.875rem', color: '#4A5568', marginBottom: '0.375rem', lineHeight: 1.6 }}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p style={paragraphStyle}>No acceptance criteria listed.</p>
        )}
      </section>
    </div>
  );
}

// -- Helper component --

function InfoField({ label, value }) {
  return (
    <div style={{
      padding: '0.75rem',
      border: '1px solid #E2E8F0',
      borderRadius: '0.5rem',
      background: '#FAFAFA',
    }}>
      <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a2e' }}>
        {value}
      </div>
    </div>
  );
}

// -- Shared styles --

const sectionHeadingStyle = {
  fontSize: '1.125rem',
  fontWeight: 600,
  color: '#1a1a2e',
  marginBottom: '0.75rem',
  paddingBottom: '0.5rem',
  borderBottom: '2px solid #6C5CE7',
};

const paragraphStyle = {
  fontSize: '0.875rem',
  color: '#4A5568',
  lineHeight: 1.7,
  margin: 0,
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.875rem',
};

const thStyle = {
  textAlign: 'left',
  padding: '0.75rem',
  background: '#6C5CE7',
  color: 'white',
  fontWeight: 600,
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle = {
  padding: '0.75rem',
  borderBottom: '1px solid #E2E8F0',
  color: '#4A5568',
};
