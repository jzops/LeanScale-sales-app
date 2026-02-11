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
  draft: { bg: '#EDF2F7', color: 'var(--text-primary)' },
  review: { bg: '#FEFCBF', color: 'var(--status-careful-text)' },
  sent: { bg: '#E9D8FD', color: 'var(--ls-purple)' },
  accepted: { bg: '#C6F6D5', color: 'var(--status-healthy-text)' },
  declined: { bg: '#FED7D7', color: 'var(--status-warning-text)' },
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
        marginBottom: 'var(--space-6)',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
      }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--gray-900)', marginBottom: 'var(--space-2)' }}>
            {sow.title}
          </h1>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-block',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-semibold)',
              background: statusColors.bg,
              color: statusColors.color,
            }}>
              {sow.status}
            </span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Type: {sow.sow_type}
            </span>
            {sow.created_by && (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                by {sow.created_by}
              </span>
            )}
            {sow.created_at && (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                {new Date(sow.created_at).toLocaleDateString()}
              </span>
            )}
            {sow.total_hours > 0 && (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ls-purple-light)', fontWeight: 'var(--font-semibold)' }}>
                {sow.total_hours}h
              </span>
            )}
            {sow.total_investment > 0 && (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--status-healthy-text)', fontWeight: 'var(--font-semibold)' }}>
                ${parseFloat(sow.total_investment).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons (internal only) */}
        {!readOnly && (
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              href={customerSlug && customerSlug !== 'demo' ? `/c/${customerSlug}/sow/${sow.id}/build` : `/sow/${sow.id}/build`}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: 'var(--ls-purple-light)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
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
                  padding: 'var(--space-2) var(--space-4)',
                  background: teamworkLoading ? '#9CA3AF' : '#0F766E',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
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
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'var(--status-healthy-bg)',
                  color: '#16A34A',
                  border: '1px solid var(--status-healthy-bg)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
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
          padding: 'var(--space-3) var(--space-5)',
          background: 'var(--status-warning-bg)',
          border: '1px solid var(--status-warning-bg)',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 'var(--space-4)',
          color: 'var(--status-warning-text)',
          fontSize: 'var(--text-sm)',
        }}>
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--status-warning-text)',
              cursor: 'pointer',
              fontSize: 'var(--text-base)',
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
          gap: 'var(--space-3)',
          alignItems: 'center',
          marginBottom: 'var(--space-8)',
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
            Status:
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              background: 'var(--bg-white)',
              color: 'var(--text-primary)',
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
              padding: 'var(--space-2) var(--space-4)',
              background: 'var(--ls-purple-light)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
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
        <div style={{ marginBottom: 'var(--space-8)' }}>
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
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-8)',
      }}>
        {/* Executive Summary */}
        <div style={{
          background: 'var(--bg-white)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
        }}>
          <h2 style={sectionHeadingStyle}>Executive Summary</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.7, margin: 0 }}>
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
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={sectionHeadingStyle}>Scope of Work</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={sectionHeadingStyle}>Timeline</h2>
          <SowTimeline sections={sections} />
        </div>
      )}

      {/* ===== INVESTMENT TABLE ===== */}
      {hasSections && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
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
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-8)',
        }}>
          {/* Team Members */}
          {content.team && (
            <div style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
            }}>
              <h2 style={sectionHeadingStyle}>Team</h2>
              {Array.isArray(content.team) ? (
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {content.team.map((member, idx) => (
                    <li key={idx} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '0.35rem', lineHeight: 1.5 }}>
                      {typeof member === 'string' ? member : `${member.name}${member.role ? ` — ${member.role}` : ''}`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.7, margin: 0 }}>
                  {content.team}
                </p>
              )}
            </div>
          )}

          {/* Assumptions + Acceptance Criteria stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {content.assumptions && (
              <div style={{
                background: 'var(--bg-white)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-6)',
              }}>
                <h2 style={sectionHeadingStyle}>Assumptions</h2>
                {Array.isArray(content.assumptions) ? (
                  <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                    {content.assumptions.map((item, idx) => (
                      <li key={idx} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '0.35rem', lineHeight: 1.5 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.7, margin: 0 }}>
                    {content.assumptions}
                  </p>
                )}
              </div>
            )}

            {content.acceptance_criteria && (
              <div style={{
                background: 'var(--bg-white)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-6)',
              }}>
                <h2 style={sectionHeadingStyle}>Acceptance Criteria</h2>
                {Array.isArray(content.acceptance_criteria) ? (
                  <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                    {content.acceptance_criteria.map((item, idx) => (
                      <li key={idx} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '0.35rem', lineHeight: 1.5 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.7, margin: 0 }}>
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
          background: 'var(--bg-white)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          marginBottom: 'var(--space-8)',
        }}>
          <SowPreview content={content} />
        </div>
      )}

      {/* ===== CUSTOMER WORKFLOW (readOnly mode) ===== */}
      {readOnly && (
        <CustomerWorkflowPanel sowId={sow.id} sowStatus={sow.status} onExport={onExport} />
      )}

      {/* ===== VERSION HISTORY ===== */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
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
 * CustomerWorkflowPanel — Accept/Decline workflow for customer-facing SOW review
 */
function CustomerWorkflowPanel({ sowId, sowStatus, onExport }) {
  const [action, setAction] = useState(null); // 'accept' | 'changes'
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await fetch(`/api/sow/${sowId}/customer-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action === 'accept' ? 'accepted' : 'changes_requested',
          comments,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting response:', err);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div style={{
        background: action === 'accept' ? '#F0FDF4' : '#FFF7ED',
        border: `1px solid ${action === 'accept' ? '#BBF7D0' : '#FED7AA'}`,
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-8)',
        textAlign: 'center',
        marginBottom: 'var(--space-8)',
      }}>
        <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>{action === 'accept' ? '✅' : '📝'}</div>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--gray-900)', marginBottom: 'var(--space-2)' }}>
          {action === 'accept' ? 'Proposal Accepted' : 'Change Request Submitted'}
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          {action === 'accept'
            ? 'Thank you! Your LeanScale team will be in touch to kick things off.'
            : 'Your feedback has been sent to the LeanScale team. They\'ll follow up shortly.'}
        </p>
      </div>
    );
  }

  if (sowStatus === 'accepted') {
    return (
      <div style={{
        background: 'var(--status-healthy-bg)',
        border: '1px solid var(--status-healthy-bg)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        textAlign: 'center',
        marginBottom: 'var(--space-8)',
      }}>
        <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--status-healthy-text)' }}>
          ✅ This proposal has been accepted.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-white)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-6) var(--space-8)',
      marginBottom: 'var(--space-8)',
    }}>
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--gray-900)', marginBottom: 'var(--space-4)' }}>
        Your Response
      </h2>

      {!action ? (
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setAction('accept')}
            style={{
              padding: 'var(--space-3) var(--space-8)',
              background: 'var(--status-healthy)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              cursor: 'pointer',
            }}
          >
            ✓ Accept Proposal
          </button>
          <button
            onClick={() => setAction('changes')}
            style={{
              padding: 'var(--space-3) var(--space-8)',
              background: 'var(--bg-white)',
              color: 'var(--status-careful-text)',
              border: '2px solid var(--status-careful)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              cursor: 'pointer',
            }}
          >
            Request Changes
          </button>
          {onExport && (
            <button
              onClick={onExport}
              style={{
                padding: 'var(--space-3) var(--space-8)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-semibold)',
                cursor: 'pointer',
              }}
            >
              📄 Download PDF
            </button>
          )}
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
            {action === 'accept'
              ? 'Great! Add any optional comments before confirming.'
              : 'Please describe the changes you\'d like:'}
          </p>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={action === 'accept' ? 'Optional comments...' : 'Describe requested changes...'}
            rows={3}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              resize: 'vertical',
              marginBottom: 'var(--space-4)',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              onClick={handleSubmit}
              disabled={submitting || (action === 'changes' && !comments.trim())}
              style={{
                padding: 'var(--space-3) var(--space-6)',
                background: action === 'accept' ? '#22c55e' : '#F59E0B',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                cursor: submitting ? 'wait' : 'pointer',
                opacity: (submitting || (action === 'changes' && !comments.trim())) ? 0.5 : 1,
              }}
            >
              {submitting ? 'Submitting...' : action === 'accept' ? 'Confirm Acceptance' : 'Submit Changes'}
            </button>
            <button
              onClick={() => { setAction(null); setComments(''); }}
              style={{
                padding: 'var(--space-3) var(--space-6)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
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
  const linkedItems = section.diagnostic_items || [];
  const deliverables = section.deliverables || [];

  return (
    <div style={{
      background: 'var(--bg-white)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-4) var(--space-5)',
          cursor: 'pointer',
          background: expanded ? '#F7FAFC' : 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
          <div style={{
            width: 4,
            height: 32,
            background: 'var(--ls-purple-light)',
            borderRadius: '2px',
            flexShrink: 0,
          }} />
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--gray-900)', margin: 0 }}>
              {section.title}
            </h3>
            {section.description && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                {expanded ? section.description : (
                  section.description.length > 120
                    ? section.description.slice(0, 120) + '...'
                    : section.description
                )}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexShrink: 0 }}>
          {h > 0 && (
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{h}h</span>
          )}
{/* Pricing is retainer-based — no per-section cost */}
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }}>
            {expanded ? '▾' : '▸'}
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid #EDF2F7' }}>
          {/* Dates */}
          {(section.start_date || section.end_date) && (
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
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
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Deliverables
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {deliverables.map((d, idx) => (
                  <li key={idx} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1.5 }}>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Linked diagnostic items */}
          {linkedItems.length > 0 && (
            <div>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                    padding: 'var(--space-1) var(--space-3)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-primary)',
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
  fontSize: 'var(--text-lg)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--gray-900)',
  marginBottom: 'var(--space-3)',
  paddingBottom: '0.5rem',
  borderBottom: '2px solid #6C5CE7',
};
