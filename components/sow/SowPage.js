/**
 * SowPage - Auto-generated SOW display
 *
 * Read-only presentation of a diagnostic-driven SOW.
 * Shows header, executive summary, diagnostic score card,
 * scope sections, Gantt timeline, and investment table.
 *
 * Props:
 *   sow              - The SOW object (includes sections array from API)
 *   diagnosticResult - Linked diagnostic result (optional, for score card)
 *   onExport()       - Callback for PDF export
 *   customerSlug     - For diagnostic link URL
 */

import { useState } from 'react';
import Link from 'next/link';
import DiagnosticScoreCard from './DiagnosticScoreCard';
import InvestmentTable from './InvestmentTable';
import SowTimeline from './SowTimeline';

const STATUS_COLORS = {
  draft: { bg: '#EDF2F7', color: '#4A5568' },
  review: { bg: '#FEFCBF', color: '#975A16' },
  sent: { bg: '#E9D8FD', color: '#553C9A' },
  accepted: { bg: '#C6F6D5', color: '#276749' },
  declined: { bg: '#FED7D7', color: '#9B2C2C' },
};

export default function SowPage({
  sow,
  diagnosticResult,
  onExport,
  customerSlug,
}) {
  if (!sow) return null;

  const sections = sow.sections || [];
  const content = sow.content || {};
  const hasSections = sections.length > 0;
  const diagnosticProcesses = diagnosticResult?.processes || [];

  // Build a map of all diagnostic items referenced in sections
  const linkedDiagnosticItems = [];
  sections.forEach(s => {
    (s.diagnostic_items || []).forEach(name => {
      const proc = diagnosticProcesses.find(p => p.name === name);
      if (proc && !linkedDiagnosticItems.find(i => i.name === name)) {
        linkedDiagnosticItems.push(proc);
      }
    });
  });

  const statusColors = STATUS_COLORS[sow.status] || STATUS_COLORS.draft;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ===== HEADER ===== */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.5rem' }}>
            {sow.title}
          </h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: statusColors.bg,
              color: statusColors.color,
            }}>
              {sow.status}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#718096' }}>
              Type: {sow.sow_type}
            </span>
            {sow.created_at && (
              <span style={{ fontSize: '0.8rem', color: '#A0AEC0' }}>
                {new Date(sow.created_at).toLocaleDateString()}
              </span>
            )}
            {sow.total_hours > 0 && (
              <span style={{ fontSize: '0.8rem', color: '#6C5CE7', fontWeight: 600 }}>
                {sow.total_hours}h
              </span>
            )}
            {sow.total_investment > 0 && (
              <span style={{ fontSize: '0.8rem', color: '#276749', fontWeight: 600 }}>
                ${parseFloat(sow.total_investment).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Export button */}
        {onExport && (
          <button
            onClick={onExport}
            style={{
              padding: '0.5rem 1rem',
              background: '#6C5CE7',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Export PDF
          </button>
        )}
      </div>

      {/* ===== TOP GRID: Executive Summary + Diagnostic Score ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: diagnosticProcesses.length > 0 ? '1fr 280px' : '1fr',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Executive Summary */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '0.75rem',
          padding: '1.5rem',
        }}>
          <h2 style={sectionHeadingStyle}>Executive Summary</h2>
          <p style={{ fontSize: '0.875rem', color: '#4A5568', lineHeight: 1.7, margin: 0 }}>
            {content.executive_summary || 'No executive summary provided.'}
          </p>
        </div>

        {/* Diagnostic Score Card */}
        {diagnosticProcesses.length > 0 && (
          <DiagnosticScoreCard
            diagnosticItems={linkedDiagnosticItems.length > 0 ? linkedDiagnosticItems : diagnosticProcesses}
            diagnosticType={diagnosticResult?.diagnostic_type || 'gtm'}
            customerSlug={customerSlug}
            overallRating={sow.overall_rating || 'moderate'}
          />
        )}
      </div>

      {/* ===== SCOPE SECTIONS ===== */}
      {hasSections && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={sectionHeadingStyle}>Scope of Work</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sections.map((section) => (
              <ScopeCard
                key={section.id}
                section={section}
                diagnosticProcesses={diagnosticProcesses}
                diagnosticResult={diagnosticResult}
                customerSlug={customerSlug}
              />
            ))}
          </div>
        </div>
      )}

      {/* ===== TIMELINE ===== */}
      {hasSections && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={sectionHeadingStyle}>Timeline</h2>
          <SowTimeline sections={sections} />
        </div>
      )}

      {/* ===== INVESTMENT TABLE ===== */}
      {hasSections && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={sectionHeadingStyle}>Investment</h2>
          <InvestmentTable
            sections={sections}
            totalHours={sow.total_hours ? parseFloat(sow.total_hours) : undefined}
            totalInvestment={sow.total_investment ? parseFloat(sow.total_investment) : undefined}
          />
        </div>
      )}

      {/* ===== TEAM / ASSUMPTIONS / ACCEPTANCE CRITERIA ===== */}
      {(content.team || content.assumptions || content.acceptance_criteria) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: content.team ? '1fr 1fr' : '1fr',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {content.team && (
            <div style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '0.75rem',
              padding: '1.5rem',
            }}>
              <h2 style={sectionHeadingStyle}>Team</h2>
              {Array.isArray(content.team) ? (
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {content.team.map((member, idx) => (
                    <li key={idx} style={{ fontSize: '0.875rem', color: '#4A5568', marginBottom: '0.35rem', lineHeight: 1.5 }}>
                      {typeof member === 'string' ? member : `${member.name}${member.role ? ` — ${member.role}` : ''}`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '0.875rem', color: '#4A5568', lineHeight: 1.7, margin: 0 }}>
                  {content.team}
                </p>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {content.assumptions && (
              <div style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '0.75rem',
                padding: '1.5rem',
              }}>
                <h2 style={sectionHeadingStyle}>Assumptions</h2>
                {Array.isArray(content.assumptions) ? (
                  <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                    {content.assumptions.map((item, idx) => (
                      <li key={idx} style={{ fontSize: '0.875rem', color: '#4A5568', marginBottom: '0.35rem', lineHeight: 1.5 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: '#4A5568', lineHeight: 1.7, margin: 0 }}>
                    {content.assumptions}
                  </p>
                )}
              </div>
            )}

            {content.acceptance_criteria && (
              <div style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '0.75rem',
                padding: '1.5rem',
              }}>
                <h2 style={sectionHeadingStyle}>Acceptance Criteria</h2>
                {Array.isArray(content.acceptance_criteria) ? (
                  <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                    {content.acceptance_criteria.map((item, idx) => (
                      <li key={idx} style={{ fontSize: '0.875rem', color: '#4A5568', marginBottom: '0.35rem', lineHeight: 1.5 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: '#4A5568', lineHeight: 1.7, margin: 0 }}>
                    {content.acceptance_criteria}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ScopeCard - Expandable card for a single SOW section
 */
function ScopeCard({ section, diagnosticProcesses = [], diagnosticResult, customerSlug }) {
  const [expanded, setExpanded] = useState(false);

  const h = parseFloat(section.hours) || 0;
  const r = parseFloat(section.rate) || 0;
  const subtotal = h * r;
  const linkedItems = section.diagnostic_items || [];
  const deliverables = section.deliverables || [];

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '0.75rem',
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          cursor: 'pointer',
          background: expanded ? '#F7FAFC' : 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <div style={{
            width: 4,
            height: 32,
            background: '#6C5CE7',
            borderRadius: '2px',
            flexShrink: 0,
          }} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
              {section.title}
            </h3>
            {section.description && (
              <p style={{ fontSize: '0.8rem', color: '#718096', margin: '0.25rem 0 0 0' }}>
                {expanded ? section.description : (
                  section.description.length > 120
                    ? section.description.slice(0, 120) + '...'
                    : section.description
                )}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
          {h > 0 && (
            <span style={{ fontSize: '0.8rem', color: '#718096' }}>{h}h</span>
          )}
          {subtotal > 0 && (
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#276749' }}>
              ${subtotal.toLocaleString()}
            </span>
          )}
          <span style={{ color: '#A0AEC0', fontSize: '1rem' }}>
            {expanded ? '▾' : '▸'}
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #EDF2F7' }}>
          {/* Dates */}
          {(section.start_date || section.end_date) && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#718096' }}>
              {section.start_date && (
                <span>Start: {new Date(section.start_date).toLocaleDateString()}</span>
              )}
              {section.end_date && (
                <span>End: {new Date(section.end_date).toLocaleDateString()}</span>
              )}
            </div>
          )}

          {/* Deliverables */}
          {deliverables.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Deliverables
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {deliverables.map((d, idx) => (
                  <li key={idx} style={{ fontSize: '0.85rem', color: '#4A5568', marginBottom: '0.25rem', lineHeight: 1.5 }}>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Linked diagnostic items */}
          {linkedItems.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Addresses Diagnostic Findings
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {linkedItems.map((name, idx) => {
                  const proc = diagnosticProcesses.find(p => p.name === name);
                  const statusColor = proc ? {
                    healthy: '#22c55e',
                    careful: '#eab308',
                    warning: '#ef4444',
                    unable: '#1f2937',
                  }[proc.status] || '#9ca3af' : '#9ca3af';

                  const itemContent = (
                    <>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: statusColor, display: 'inline-block',
                      }} />
                      {name}
                    </>
                  );

                  const itemStyle = {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.25rem 0.625rem',
                    background: '#F7FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    color: '#4A5568',
                    textDecoration: 'none',
                    transition: 'border-color 0.15s',
                  };

                  const diagType = diagnosticResult?.diagnostic_type;
                  const diagUrl = diagType && customerSlug
                    ? `/c/${customerSlug}/try-leanscale/${diagType === 'gtm' ? 'diagnostic' : `${diagType}-diagnostic`}`
                    : diagType
                      ? `/try-leanscale/${diagType === 'gtm' ? 'diagnostic' : `${diagType}-diagnostic`}`
                      : null;

                  if (diagUrl) {
                    return (
                      <Link key={idx} href={diagUrl} style={itemStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6C5CE7'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
                      >
                        {itemContent}
                      </Link>
                    );
                  }

                  return (
                    <span key={idx} style={itemStyle}>
                      {itemContent}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const sectionHeadingStyle = {
  fontSize: '1.125rem',
  fontWeight: 600,
  color: '#1a1a2e',
  marginBottom: '0.75rem',
  paddingBottom: '0.5rem',
  borderBottom: '2px solid #6C5CE7',
};
