/**
 * TeamworkPreview - Two-step push-to-Teamwork UI
 *
 * Step 1: Shows a hierarchical preview of what will be created
 * Step 2: Confirms and executes the push, shows results
 *
 * Props:
 *   sowId           - SOW id
 *   preview         - Preview data from buildTeamworkPreview()
 *   teamworkUrl     - If already pushed, the existing Teamwork project URL
 *   onPushComplete(result) - Callback after successful push
 *   onClose()       - Callback to dismiss the panel
 */

import { useState } from 'react';

const COLORS = {
  primary: '#6C5CE7',
  primaryLight: '#EDE9FE',
  green: '#16A34A',
  greenBg: '#F0FDF4',
  greenBorder: '#BBF7D0',
  text: '#4A5568',
  textDark: '#1a1a2e',
  textMuted: '#A0AEC0',
  border: '#E2E8F0',
  bg: '#F7FAFC',
  red: '#DC2626',
  redBg: '#FEF2F2',
};

export default function TeamworkPreview({
  sowId,
  preview,
  teamworkUrl,
  onPushComplete,
  onClose,
}) {
  const [step, setStep] = useState(teamworkUrl ? 'done' : 'preview');
  const [pushing, setPushing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [expandedMilestones, setExpandedMilestones] = useState({});

  if (!preview && step === 'preview') return null;

  function toggleMilestone(idx) {
    setExpandedMilestones((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  }

  async function handleConfirm() {
    setPushing(true);
    setError(null);

    try {
      const res = await fetch(`/api/sow/${sowId}/push-to-teamwork/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to push to Teamwork');
      }

      const json = await res.json();
      setResult(json.data);
      setStep('done');
      onPushComplete?.(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setPushing(false);
    }
  }

  // Count totals for summary
  const totalMilestones = preview?.milestones?.length || 0;
  const totalTaskLists = preview?.milestones?.reduce(
    (sum, m) => sum + (m.taskLists?.length || 0), 0
  ) || 0;
  const totalTasks = preview?.milestones?.reduce(
    (sum, m) => sum + m.taskLists?.reduce(
      (s, tl) => s + (tl.tasks?.length || 0), 0
    ) || 0, 0
  ) || 0;

  return (
    <div style={{
      background: 'white',
      border: `1px solid ${COLORS.border}`,
      borderRadius: '0.75rem',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.25rem',
        background: COLORS.bg,
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: COLORS.textDark, margin: 0 }}>
            Push to Teamwork
          </h3>
          <p style={{ fontSize: '0.8rem', color: COLORS.textMuted, margin: '0.25rem 0 0 0' }}>
            {step === 'preview' && 'Review what will be created before confirming'}
            {step === 'done' && 'Successfully pushed to Teamwork'}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            color: COLORS.textMuted,
            cursor: 'pointer',
            padding: '0.25rem',
          }}
        >
          ×
        </button>
      </div>

      {/* Already pushed state */}
      {step === 'done' && (teamworkUrl || result) && (
        <div style={{ padding: '1.5rem 1.25rem' }}>
          <div style={{
            background: COLORS.greenBg,
            border: `1px solid ${COLORS.greenBorder}`,
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>✓</span>
              <span style={{ fontWeight: 600, color: COLORS.green }}>
                Project created in Teamwork
              </span>
            </div>
            {(result?.project?.url || teamworkUrl) && (
              <a
                href={result?.project?.url || teamworkUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: COLORS.primary,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Open in Teamwork →
              </a>
            )}
          </div>

          {result && (
            <div style={{ fontSize: '0.85rem', color: COLORS.text }}>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span>Company: <strong>{result.company?.name}</strong> {result.company?.created ? '(new)' : '(existing)'}</span>
                <span>Milestones: <strong>{result.milestones?.length || 0}</strong></span>
                <span>Task Lists: <strong>{result.taskLists?.length || 0}</strong></span>
                <span>Tasks: <strong>{result.tasks?.length || 0}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview step */}
      {step === 'preview' && preview && (
        <div style={{ padding: '1.25rem' }}>
          {/* Summary counts */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
          }}>
            {[
              { label: 'Company', value: preview.company },
              { label: 'Project', value: preview.project?.name },
              { label: 'Template', value: preview.project?.template },
              { label: 'Milestones', value: totalMilestones },
              { label: 'Task Lists', value: totalTaskLists },
              { label: 'Tasks', value: totalTasks },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: '0.5rem 0.75rem',
                background: COLORS.bg,
                borderRadius: '0.375rem',
                border: `1px solid ${COLORS.border}`,
              }}>
                <div style={{ fontSize: '0.65rem', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {label}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.textDark }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Hierarchical preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {preview.milestones?.map((milestone, mIdx) => (
              <div
                key={mIdx}
                style={{
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                }}
              >
                {/* Milestone header */}
                <div
                  onClick={() => toggleMilestone(mIdx)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    background: expandedMilestones[mIdx] ? COLORS.bg : 'white',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: COLORS.primary,
                      background: COLORS.primaryLight,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '0.25rem',
                    }}>
                      MILESTONE
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: COLORS.textDark }}>
                      {milestone.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {milestone.deadline && (
                      <span style={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
                        Due: {new Date(milestone.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
                      {milestone.taskLists?.length || 0} lists, {milestone.taskLists?.reduce((s, tl) => s + (tl.tasks?.length || 0), 0) || 0} tasks
                    </span>
                    <span style={{ color: COLORS.textMuted }}>
                      {expandedMilestones[mIdx] ? '▾' : '▸'}
                    </span>
                  </div>
                </div>

                {/* Expanded: task lists and tasks */}
                {expandedMilestones[mIdx] && (
                  <div style={{ padding: '0 1rem 0.75rem', borderTop: `1px solid ${COLORS.border}` }}>
                    {milestone.taskLists?.map((taskList, tlIdx) => (
                      <div key={tlIdx} style={{ marginTop: '0.75rem' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.375rem',
                        }}>
                          <span style={{
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            color: taskList.source === 'template' ? '#D97706' : COLORS.green,
                            background: taskList.source === 'template' ? '#FFFBEB' : COLORS.greenBg,
                            padding: '0.1rem 0.375rem',
                            borderRadius: '0.2rem',
                            textTransform: 'uppercase',
                          }}>
                            {taskList.source === 'template' ? 'Template' : 'SOW'}
                          </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 500, color: COLORS.text }}>
                            {taskList.name}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: COLORS.textMuted }}>
                            ({taskList.tasks?.length || 0} tasks)
                          </span>
                        </div>
                        <div style={{ paddingLeft: '1.25rem' }}>
                          {taskList.tasks?.map((task, tIdx) => (
                            <div key={tIdx} style={{
                              fontSize: '0.8rem',
                              color: COLORS.text,
                              padding: '0.2rem 0',
                              borderBottom: tIdx < (taskList.tasks.length - 1) ? `1px solid ${COLORS.border}` : 'none',
                            }}>
                              {task.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: COLORS.redBg,
              border: `1px solid ${COLORS.red}20`,
              borderRadius: '0.375rem',
              fontSize: '0.85rem',
              color: COLORS.red,
            }}>
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: `1px solid ${COLORS.border}`,
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                background: 'white',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                color: COLORS.text,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={pushing}
              style={{
                padding: '0.5rem 1.25rem',
                background: pushing ? '#9CA3AF' : COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: pushing ? 'wait' : 'pointer',
              }}
            >
              {pushing ? 'Creating in Teamwork...' : 'Create in Teamwork'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
