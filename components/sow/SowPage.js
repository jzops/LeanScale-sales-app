/**
 * SowPage - Rich interactive SOW display
 *
 * Replaces the old SowPreview with a section-based, diagnostic-linked
 * presentation. Shows header, executive summary, diagnostic score card,
 * scope sections, timeline, investment table, and version history.
 *
 * Props:
 *   sow              - The SOW object (includes sections array from API)
 *   diagnosticResult - Linked diagnostic result (optional, for score card)
 *   versions         - Array of sow_versions
 *   readOnly         - If true, hide edit/action buttons (customer view)
 *   onStatusUpdate(status) - Callback for status changes
 *   onExport()       - Callback for PDF export
 *   customerSlug     - For diagnostic link URL
 */

import { useState } from 'react';
import Link from 'next/link';
import DiagnosticScoreCard from './DiagnosticScoreCard';
import InvestmentTable from './InvestmentTable';
import SowTimeline from './SowTimeline';
import VersionHistory from './VersionHistory';
import TeamworkPreview from './TeamworkPreview';
import DiagnosticSyncBanner from './DiagnosticSyncBanner';
import SowPreview from '../SowPreview';

const STATUS_OPTIONS = ['draft', 'review', 'sent', 'accepted', 'declined'];

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
  versions = [],
  readOnly = false,
  onStatusUpdate,
  onExport,
  customerSlug,
  customerName,
}) {
  const [selectedStatus, setSelectedStatus] = useState(sow?.status || 'draft');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showTeamwork, setShowTeamwork] = useState(false);
  const [teamworkPreview, setTeamworkPreview] = useState(null);
  const [teamworkLoading, setTeamworkLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

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

  async function handleStatusUpdate() {
    if (!selectedStatus || selectedStatus === sow.status) return;
    setStatusUpdating(true);
    try {
      await onStatusUpdate?.(selectedStatus);
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handlePushToTeamwork() {
    setTeamworkLoading(true);
    try {
      const res = await fetch(`/api/sow/${sow.id}/push-to-teamwork`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: customerName || sow.title }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setTeamworkPreview(json.data);
        setShowTeamwork(true);
      } else {
        setErrorMsg(json.error || 'Failed to generate Teamwork preview.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to Teamwork. Please try again.');
    } finally {
      setTeamworkLoading(false);
    }
  }

  const statusColors = STATUS_COLORS[sow.status] || STATUS_COLORS.draft;
  const canPushToTeamwork = !readOnly && ['review', 'sent', 'accepted'].includes(sow.status) && !sow.teamwork_project_id;

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
            {sow.created_by && (
              <span style={{ fontSize: '0.8rem', color: '#718096' }}>
                by {sow.created_by}
              </span>
            )}
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

        {/* Action buttons (internal only) */}
        {!readOnly && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              href={customerSlug && customerSlug !== 'demo' ? `/c/${customerSlug}/sow/${sow.id}/build` : `/sow/${sow.id}/build`}
              style={{
                padding: '0.5rem 1rem',
                background: '#6C5CE7',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Builder
            </Link>
            {canPushToTeamwork && (
              <button
                onClick={handlePushToTeamwork}
                disabled={teamworkLoading}
                style={{
                  padding: '0.5rem 1rem',
                  background: teamworkLoading ? '#9CA3AF' : '#0F766E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: teamworkLoading ? 'wait' : 'pointer',
                }}
              >
                {teamworkLoading ? 'Loading...' : 'Push to Teamwork'}
              </button>
            )}
            {sow.teamwork_project_url && (
              <a
                href={sow.teamwork_project_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.5rem 1rem',
                  background: '#F0FDF4',
                  color: '#16A34A',
                  border: '1px solid #BBF7D0',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                View in Teamwork
              </a>
            )}
          </div>
        )}
      </div>

      {/* ===== ERROR BANNER ===== */}
      {errorMsg && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1.25rem',
          background: '#FFF5F5',
          border: '1px solid #FED7D7',
          borderRadius: '0.75rem',
          marginBottom: '1rem',
          color: '#9B2C2C',
          fontSize: '0.875rem',
        }}>
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#9B2C2C',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0 0.25rem',
            }}
          >
            x
          </button>
        </div>
      )}

      {/* ===== STATUS BAR (internal only) ===== */}
      {!readOnly && (
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '0.75rem 1rem',
          background: '#F7FAFC',
          borderRadius: '0.5rem',
          border: '1px solid #E2E8F0',
        }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#4A5568' }}>
            Status:
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              border: '1px solid #E2E8F0',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              background: 'white',
              color: '#4A5568',
            }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={statusUpdating || selectedStatus === sow.status}
            style={{
              padding: '0.4rem 1rem',
              background: '#6C5CE7',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: statusUpdating ? 'wait' : 'pointer',
              opacity: (statusUpdating || selectedStatus === sow.status) ? 0.5 : 1,
            }}
          >
            {statusUpdating ? 'Updating...' : 'Update'}
          </button>
        </div>
      )}

      {/* ===== DIAGNOSTIC SYNC BANNER ===== */}
      {!readOnly && diagnosticResult && (
        <DiagnosticSyncBanner sowId={sow.id} />
      )}

      {/* ===== TEAMWORK PREVIEW ===== */}
      {showTeamwork && (
        <div style={{ marginBottom: '2rem' }}>
          <TeamworkPreview
            sowId={sow.id}
            preview={teamworkPreview}
            teamworkUrl={sow.teamwork_project_url}
            onPushComplete={(result) => {
              if (result?.project?.url) {
                sow.teamwork_project_id = result.project.id;
                sow.teamwork_project_url = result.project.url;
              }
            }}
            onClose={() => setShowTeamwork(false)}
          />
        </div>
      )}

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
          {/* Team Members */}
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

          {/* Assumptions + Acceptance Criteria stacked */}
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

      {/* ===== LEGACY CONTENT (if no sections but has old content) ===== */}
      {!hasSections && Object.keys(content).length > 1 && (
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginBottom: '2rem',
        }}>
          <SowPreview content={content} />
        </div>
      )}

      {/* ===== VERSION HISTORY ===== */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={sectionHeadingStyle}>Versions</h2>
        <VersionHistory
          versions={versions}
          currentVersion={sow.current_version || 0}
          sowId={sow.id}
          onExport={onExport}
          readOnly={readOnly}
        />
      </div>
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

                  // If we have a diagnostic type and customer slug, link to the diagnostic page
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
