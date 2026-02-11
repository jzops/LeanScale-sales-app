/**
 * SowPage — Live editable proposal orchestrator (redesigned).
 *
 * Manages local state, dirty field tracking, and the "Recalculate & Save" flow.
 * All visual rendering is delegated to child components.
 *
 * Props:
 *   sow              - The SOW object (includes sections array from API)
 *   diagnosticResult - Linked diagnostic result (optional, for score card)
 *   versions         - Array of sow_versions
 *   readOnly         - If true, hide edit/action buttons (customer view)
 *   onStatusUpdate(status) - Callback for status changes
 *   onExport()       - Callback for PDF export
 *   onSowUpdate(sow) - Callback when SOW is refreshed from API
 *   customerSlug     - For diagnostic link URL
 *   customerName     - Customer name for display
 */

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import SowHeader from './SowHeader';
import SowExecutiveSummary from './SowExecutiveSummary';
import DiagnosticScoreCard from './DiagnosticScoreCard';
import SowScopeSection from './SowScopeSection';
import SowTimeline from './SowTimeline';
import InvestmentTable from './InvestmentTable';
import VersionHistory from './VersionHistory';
import TeamworkPreview from './TeamworkPreview';
import DiagnosticSyncBanner from './DiagnosticSyncBanner';
import SowRecalculateBar from './SowRecalculateBar';
import SowPreview from '../SowPreview';
import { staggerContainer, fadeUpItem } from '../../lib/animations';

export default function SowPage({
  sow: serverSow,
  diagnosticResult,
  versions = [],
  readOnly = false,
  onStatusUpdate,
  onExport,
  onSowUpdate,
  customerSlug,
  customerName,
}) {
  // --- Local editable state ---
  const [localSow, setLocalSow] = useState(serverSow);
  const [localSections, setLocalSections] = useState(serverSow?.sections || []);
  const [dirtyFields, setDirtyFields] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showTeamwork, setShowTeamwork] = useState(false);
  const [teamworkPreview, setTeamworkPreview] = useState(null);
  const [teamworkLoading, setTeamworkLoading] = useState(false);

  // Ref for tracking the server state to revert to
  const serverSowRef = useRef(serverSow);
  const serverSectionsRef = useRef(serverSow?.sections || []);

  if (!localSow) return null;

  const content = localSow.content || {};
  const hasSections = localSections.length > 0;
  const diagnosticProcesses = diagnosticResult?.processes || [];

  // --- Dirty tracking helpers ---
  function markDirty(fieldPath) {
    setDirtyFields(prev => new Set(prev).add(fieldPath));
  }

  // --- SOW-level field changes ---
  function handleSowFieldChange(field, value) {
    setLocalSow(prev => ({ ...prev, [field]: value }));
    markDirty(`sow.${field}`);
  }

  function handleContentFieldChange(field, value) {
    setLocalSow(prev => ({
      ...prev,
      content: { ...prev.content, [field]: value },
    }));
    markDirty(`content.${field}`);
  }

  // --- Section-level field changes ---
  function handleSectionChange(sectionId, field, value) {
    setLocalSections(prev =>
      prev.map(s => s.id === sectionId ? { ...s, [field]: value } : s)
    );
    markDirty(`sections.${sectionId}.${field}`);
  }

  // --- Delete section ---
  async function handleDeleteSection(sectionId) {
    try {
      const res = await fetch(`/api/sow/${localSow.id}/sections/${sectionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLocalSections(prev => prev.filter(s => s.id !== sectionId));
        serverSectionsRef.current = serverSectionsRef.current.filter(s => s.id !== sectionId);
        // Recalculate totals after deletion
        markDirty('sections.deleted');
      }
    } catch (err) {
      console.error('Error deleting section:', err);
      setErrorMsg('Failed to delete section');
    }
  }

  // --- Calculate projected totals ---
  const projectedHours = localSections.reduce((sum, s) => sum + (parseFloat(s.hours) || 0), 0);
  const projectedInvestment = localSections.reduce((sum, s) => {
    return sum + (parseFloat(s.hours) || 0) * (parseFloat(s.rate) || 0);
  }, 0);

  // --- Recalculate & Save ---
  const handleRecalculate = useCallback(async () => {
    setSaving(true);
    setErrorMsg(null);

    try {
      // 1. Save SOW-level changes
      const sowUpdates = {};
      if (dirtyFields.has('sow.title')) sowUpdates.title = localSow.title;
      if (dirtyFields.has('content.executive_summary')) {
        sowUpdates.content = { ...localSow.content };
      }
      // Always update totals
      sowUpdates.totalHours = projectedHours;
      sowUpdates.totalInvestment = projectedInvestment;

      const sowRes = await fetch(`/api/sow/${localSow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sowUpdates),
      });

      if (!sowRes.ok) throw new Error('Failed to save SOW');
      const sowJson = await sowRes.json();

      // 2. Save section-level changes (only dirty ones)
      const sectionPromises = localSections.map(async (section) => {
        // Check if any field of this section is dirty
        const sectionDirty = [...dirtyFields].some(f => f.startsWith(`sections.${section.id}.`));
        if (!sectionDirty) return section;

        const res = await fetch(`/api/sow/${localSow.id}/sections/${section.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: section.title,
            description: section.description,
            hours: section.hours,
            rate: section.rate,
            deliverables: section.deliverables,
            startDate: section.start_date,
            endDate: section.end_date,
          }),
        });

        if (!res.ok) throw new Error(`Failed to save section ${section.title}`);
        const json = await res.json();
        return json.data || section;
      });

      const updatedSections = await Promise.all(sectionPromises);

      // 3. Update local + server refs
      const updatedSow = { ...sowJson.data, sections: updatedSections };
      setLocalSow(updatedSow);
      setLocalSections(updatedSections);
      serverSowRef.current = updatedSow;
      serverSectionsRef.current = updatedSections;
      setDirtyFields(new Set());

      // Notify parent
      onSowUpdate?.(updatedSow);
    } catch (err) {
      console.error('Error saving SOW:', err);
      setErrorMsg(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }, [localSow, localSections, dirtyFields, projectedHours, projectedInvestment, onSowUpdate]);

  // --- Discard changes ---
  function handleDiscard() {
    setLocalSow(serverSowRef.current);
    setLocalSections(serverSectionsRef.current);
    setDirtyFields(new Set());
  }

  // --- Status update (immediate, not dirty-tracked) ---
  async function handleStatusUpdate(newStatus) {
    try {
      await onStatusUpdate?.(newStatus);
      setLocalSow(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      setErrorMsg('Failed to update status');
    }
  }

  // --- Teamwork ---
  async function handlePushToTeamwork() {
    setTeamworkLoading(true);
    try {
      const res = await fetch(`/api/sow/${localSow.id}/push-to-teamwork`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: customerName || localSow.title }),
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

  // --- Build linked diagnostic items map ---
  const linkedDiagnosticItems = [];
  localSections.forEach(s => {
    (s.diagnostic_items || []).forEach(name => {
      const proc = diagnosticProcesses.find(p => p.name === name);
      if (proc && !linkedDiagnosticItems.find(i => i.name === name)) {
        linkedDiagnosticItems.push(proc);
      }
    });
  });

  const sectionHeadingStyle = {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: '0.75rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #6C5CE7',
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ===== HEADER ===== */}
      <SowHeader
        sow={localSow}
        readOnly={readOnly}
        onFieldChange={handleSowFieldChange}
        onStatusUpdate={handleStatusUpdate}
        customerSlug={customerSlug}
        onPushToTeamwork={handlePushToTeamwork}
        teamworkLoading={teamworkLoading}
      />

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

      {/* ===== DIAGNOSTIC SYNC BANNER ===== */}
      {!readOnly && diagnosticResult && (
        <DiagnosticSyncBanner sowId={localSow.id} />
      )}

      {/* ===== TEAMWORK PREVIEW ===== */}
      {showTeamwork && (
        <div style={{ marginBottom: '2rem' }}>
          <TeamworkPreview
            sowId={localSow.id}
            preview={teamworkPreview}
            teamworkUrl={localSow.teamwork_project_url}
            onPushComplete={(result) => {
              if (result?.project?.url) {
                setLocalSow(prev => ({
                  ...prev,
                  teamwork_project_id: result.project.id,
                  teamwork_project_url: result.project.url,
                }));
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
        <SowExecutiveSummary
          summary={content.executive_summary}
          onCommit={(val) => handleContentFieldChange('executive_summary', val)}
          readOnly={readOnly}
        />

        {diagnosticProcesses.length > 0 && (
          <DiagnosticScoreCard
            diagnosticItems={linkedDiagnosticItems.length > 0 ? linkedDiagnosticItems : diagnosticProcesses}
            diagnosticType={diagnosticResult?.diagnostic_type || 'gtm'}
            customerSlug={customerSlug}
            overallRating={localSow.overall_rating || 'moderate'}
          />
        )}
      </div>

      {/* ===== SCOPE SECTIONS ===== */}
      {hasSections && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={sectionHeadingStyle}>Scope of Work</h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {localSections.map((section) => (
              <SowScopeSection
                key={section.id}
                section={section}
                onSectionChange={readOnly ? undefined : handleSectionChange}
                readOnly={readOnly}
                diagnosticProcesses={diagnosticProcesses}
                diagnosticResult={diagnosticResult}
                customerSlug={customerSlug}
                onDeleteSection={readOnly ? undefined : handleDeleteSection}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* ===== TIMELINE ===== */}
      {hasSections && (
        <motion.div
          variants={fadeUpItem}
          initial="hidden"
          animate="show"
          style={{ marginBottom: '2rem' }}
        >
          <h2 style={sectionHeadingStyle}>Timeline</h2>
          <SowTimeline sections={localSections} />
        </motion.div>
      )}

      {/* ===== INVESTMENT TABLE ===== */}
      {hasSections && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={sectionHeadingStyle}>Investment</h2>
          <InvestmentTable
            sections={localSections}
            totalHours={localSow.total_hours ? parseFloat(localSow.total_hours) : undefined}
            totalInvestment={localSow.total_investment ? parseFloat(localSow.total_investment) : undefined}
            readOnly={readOnly}
            onSectionChange={readOnly ? undefined : handleSectionChange}
          />
        </div>
      )}

      {/* ===== TEAM / ASSUMPTIONS / ACCEPTANCE CRITERIA ===== */}
      {(content.team || content.assumptions || content.acceptance_criteria) && (
        <motion.div
          variants={fadeUpItem}
          initial="hidden"
          animate="show"
          style={{
            display: 'grid',
            gridTemplateColumns: content.team ? '1fr 1fr' : '1fr',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
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
        </motion.div>
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
      <motion.div
        variants={fadeUpItem}
        initial="hidden"
        animate="show"
        style={{ marginBottom: '2rem' }}
      >
        <h2 style={sectionHeadingStyle}>Versions</h2>
        <VersionHistory
          versions={versions}
          currentVersion={localSow.current_version || 0}
          sowId={localSow.id}
          onExport={onExport}
          readOnly={readOnly}
        />
      </motion.div>

      {/* ===== RECALCULATE BAR ===== */}
      {!readOnly && (
        <SowRecalculateBar
          visible={dirtyFields.size > 0}
          dirtyCount={dirtyFields.size}
          projectedTotal={projectedInvestment}
          saving={saving}
          onRecalculate={handleRecalculate}
          onDiscard={handleDiscard}
        />
      )}
    </div>
  );
}
