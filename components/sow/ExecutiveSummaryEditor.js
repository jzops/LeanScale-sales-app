/**
 * ExecutiveSummaryEditor - Rich text editor for the SOW executive summary
 *
 * Features:
 *   - Textarea with markdown support
 *   - Auto-populated from auto-builder's generated summary
 *   - Debounced auto-save
 *   - Character count indicator
 *   - "Regenerate" button from current diagnostic data
 *   - Template variables: {{customerName}}, {{overallRating}}, {{warningCount}}, {{functionBreakdown}}
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const TEMPLATE_VARS = ['customerName', 'overallRating', 'warningCount', 'functionBreakdown'];

function resolveTemplateVars(text, vars = {}) {
  if (!text) return text;
  return text
    .replace(/\{\{customerName\}\}/g, vars.customerName || 'the organization')
    .replace(/\{\{overallRating\}\}/g, vars.overallRating || 'moderate')
    .replace(/\{\{warningCount\}\}/g, String(vars.warningCount ?? 0))
    .replace(/\{\{functionBreakdown\}\}/g, vars.functionBreakdown || '');
}

function generateSummaryFromDiagnostic(processes, customerName, diagnosticType) {
  const total = processes.length;
  if (total === 0) return '';

  const statusCounts = {};
  processes.forEach(p => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });

  const warningCount = statusCounts.warning || 0;
  const unableCount = statusCounts.unable || 0;
  const criticalCount = warningCount + unableCount;
  const criticalPct = Math.round((criticalCount / total) * 100);

  const priorityItems = processes.filter(p =>
    p.status === 'warning' || p.status === 'unable' || p.addToEngagement
  );
  const functions = [...new Set(priorityItems.map(p => p.function).filter(Boolean))];

  const diagnosticLabel = {
    gtm: 'GTM Operations',
    clay: 'Clay Enrichment',
    cpq: 'Quote-to-Cash',
  }[diagnosticType] || 'Operations';

  const companyRef = customerName || 'your organization';

  let severityDesc;
  if (criticalPct > 50) {
    severityDesc = 'significant operational gaps requiring immediate attention';
  } else if (criticalPct > 30) {
    severityDesc = 'several areas requiring strategic improvement';
  } else if (criticalPct > 10) {
    severityDesc = 'targeted opportunities for optimization';
  } else {
    severityDesc = 'a strong foundation with select enhancement opportunities';
  }

  return [
    `Following a comprehensive ${diagnosticLabel} diagnostic assessment of ${companyRef}, ` +
    `LeanScale identified ${severityDesc}. ` +
    `Of the ${total} processes evaluated, ${criticalCount} (${criticalPct}%) ` +
    `require attention — ${warningCount} flagged as warning and ${unableCount} unable to report.`,
    '',
    `This Statement of Work addresses ${priorityItems.length} priority items` +
    (functions.length > 0 ? ` spanning ${functions.join(', ')}` : '') + '. ' +
    `The recommended engagement focuses on establishing operational foundations, ` +
    `implementing key process improvements, and enabling data-driven decision making ` +
    `across ${companyRef}'s go-to-market organization.`,
  ].join('\n');
}

export default function ExecutiveSummaryEditor({
  value = '',
  onChange,
  onSave,
  sowId,
  diagnosticResult,
  customerName,
  templateVars = {},
}) {
  const [text, setText] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const debounceRef = useRef(null);

  // Sync from parent if value changes externally
  useEffect(() => {
    setText(value);
  }, [value]);

  const persistSave = useCallback(async (newText) => {
    setSaving(true);
    setSaved(false);
    try {
      if (onSave) {
        await onSave(newText);
      } else if (sowId) {
        await fetch(`/api/sow/${sowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentPartial: { executive_summary: newText },
          }),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save executive summary:', err);
    } finally {
      setSaving(false);
    }
  }, [onSave, sowId]);

  function handleChange(e) {
    const newText = e.target.value;
    setText(newText);
    onChange?.(newText);

    // Debounced auto-save
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      persistSave(newText);
    }, 1500);
  }

  async function handleRegenerate() {
    const processes = diagnosticResult?.processes || [];
    if (processes.length === 0) return;

    setRegenerating(true);
    try {
      const generated = generateSummaryFromDiagnostic(
        processes,
        customerName || templateVars.customerName,
        diagnosticResult?.diagnostic_type
      );
      const resolved = resolveTemplateVars(generated, templateVars);
      setText(resolved);
      onChange?.(resolved);
      await persistSave(resolved);
    } finally {
      setRegenerating(false);
    }
  }

  const charCount = text.length;

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
      }}>
        <label style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#1a1a2e',
        }}>
          Executive Summary
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {saving && (
            <span style={{ fontSize: '0.75rem', color: '#A0AEC0' }}>Saving...</span>
          )}
          {saved && (
            <span style={{ fontSize: '0.75rem', color: '#38A169' }}>✓ Saved</span>
          )}
          {diagnosticResult?.processes?.length > 0 && (
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              style={{
                padding: '0.3rem 0.75rem',
                background: '#EDF2F7',
                color: '#4A5568',
                border: '1px solid #E2E8F0',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: regenerating ? 'wait' : 'pointer',
                opacity: regenerating ? 0.7 : 1,
              }}
            >
              {regenerating ? 'Regenerating...' : '🔄 Regenerate'}
            </button>
          )}
        </div>
      </div>

      <textarea
        value={text}
        onChange={handleChange}
        rows={5}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '1px solid #E2E8F0',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          lineHeight: 1.7,
          resize: 'vertical',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
        placeholder="Executive summary will appear here. Use {{customerName}}, {{overallRating}}, {{warningCount}}, {{functionBreakdown}} as template variables..."
      />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '0.375rem',
      }}>
        <span style={{
          fontSize: '0.7rem',
          color: charCount > 2000 ? '#E53E3E' : '#A0AEC0',
        }}>
          {charCount.toLocaleString()} characters
        </span>
        <span style={{ fontSize: '0.7rem', color: '#A0AEC0' }}>
          Supports markdown formatting
        </span>
      </div>
    </div>
  );
}
