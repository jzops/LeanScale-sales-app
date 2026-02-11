import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { WorkflowProvider, useWorkflow } from '../../components/workflow/WorkflowContext';
import SalesWorkflowStepper from '../../components/workflow/SalesWorkflowStepper';
import StepTransition from '../../components/workflow/StepTransition';
import DiagnosticResults from '../../components/diagnostic/DiagnosticResults';
import { useCustomer } from '../../context/CustomerContext';

// ─── Step: Diagnostic (wraps existing component + completion hook) ──────────

function DiagnosticStep() {
  const { completeStep, updateData, nextStep } = useWorkflow();
  const { customer, isDemo } = useCustomer();

  // Poll for diagnostic completion (when diagnosticResultId appears)
  useEffect(() => {
    if (isDemo || !customer?.id) return;

    const check = async () => {
      try {
        const res = await fetch(`/api/diagnostics/gtm?customerId=${customer.id}`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data?.id) {
          const processes = json.data.processes || [];
          const stats = {
            total: processes.length,
            warning: processes.filter(p => p.status === 'warning').length,
            priority: processes.filter(p => p.addToEngagement).length,
          };
          updateData({
            diagnosticResultId: json.data.id,
            diagnosticStats: stats,
            customerId: customer.id,
          });
        }
      } catch { /* ignore */ }
    };

    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [customer?.id, isDemo, updateData]);

  return <DiagnosticResults diagnosticType="gtm" />;
}

// ─── Step: Engagement ───────────────────────────────────────────────────────

function EngagementStep() {
  const { completeStep, updateData, data } = useWorkflow();
  const { customer, isDemo } = useCustomer();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = isDemo || !customer?.id
      ? '/api/engagement'
      : `/api/engagement?customerId=${customer.id}`;

    fetch(url)
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setRecommendation(json.data);
          updateData({ engagementRecommendation: json.data });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [customer?.id, isDemo, updateData]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading engagement recommendations...</div>;
  }

  if (!recommendation) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Unable to load engagement data. Complete the diagnostic first.</div>;
  }

  const { summary } = recommendation;

  return (
    <div>
      {/* Summary card */}
      <div style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        color: 'white',
        borderRadius: 12,
        marginBottom: '2rem',
      }}>
        <h2 style={{ fontSize: '1.5rem', margin: '0 0 1rem' }}>
          {summary.recommendedTier.label} Engagement — {summary.recommendedTier.hours} hrs/mo
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Projects', value: summary.projectCount },
            { label: 'Total Hours', value: summary.avgProjectHours },
            { label: 'Duration', value: `~${summary.estimatedDurationMonths} mo` },
            { label: 'Investment (6mo)', value: `$${(summary.estimatedInvestment / 1000).toFixed(0)}K` },
          ].map(m => (
            <div key={m.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{m.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#c4b5fd', marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects list */}
      <h3 style={{ marginBottom: '1rem' }}>Recommended Projects ({summary.projectCount})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {recommendation.projectSequence?.slice(0, 15).map(p => (
          <div key={p.name} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            background: 'white',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: p.priorityLabel === 'High' ? '#ef4444' : '#eab308',
              }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.name}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--ls-purple-light)', fontWeight: 600 }}>
              {p.hoursLow}–{p.hoursHigh}h
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step: Scope ────────────────────────────────────────────────────────────

function ScopeStep() {
  const { data, updateData, completeStep } = useWorkflow();
  const rec = data.engagementRecommendation;
  const [selected, setSelected] = useState(data.scopeSelections || []);

  const projects = rec?.projectSequence || [];

  const toggle = (name) => {
    setSelected(prev => {
      const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name];
      updateData({ scopeSelections: next });
      return next;
    });
  };

  const selectAll = () => {
    const all = projects.map(p => p.name);
    setSelected(all);
    updateData({ scopeSelections: all });
  };

  if (!rec) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Complete the engagement step first.</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Select Scope ({selected.length} of {projects.length})</h2>
        <button onClick={selectAll} className="btn btn-secondary btn-sm">Select All</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {projects.map(p => (
          <label key={p.name} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: selected.includes(p.name) ? '#f5f3ff' : 'white',
            border: `1px solid ${selected.includes(p.name) ? '#c4b5fd' : '#e5e7eb'}`,
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}>
            <input
              type="checkbox"
              checked={selected.includes(p.name)}
              onChange={() => toggle(p.name)}
              style={{ accentColor: '#7c3aed', width: 18, height: 18 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.name}</div>
              {p.outcome && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{p.outcome}</div>}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--ls-purple-light)', fontWeight: 600 }}>
              {p.hoursLow}–{p.hoursHigh}h
            </span>
            <span style={{
              fontSize: '0.7rem',
              padding: '0.15rem 0.5rem',
              borderRadius: 4,
              background: p.priorityLabel === 'High' ? '#fef2f2' : '#f3f4f6',
              color: p.priorityLabel === 'High' ? '#dc2626' : '#374151',
            }}>
              {p.priorityLabel}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Step: SOW ──────────────────────────────────────────────────────────────

function SowStep() {
  const { data, updateData } = useWorkflow();
  const { customer } = useCustomer();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!data.diagnosticResultId) {
      setError('No diagnostic result available.');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/sow/from-engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: data.customerId || customer?.id,
          diagnosticResultId: data.diagnosticResultId,
          recommendation: data.engagementRecommendation,
          scopeSelections: data.scopeSelections,
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.id) {
        updateData({ sowId: json.data.id });
      } else {
        setError(json.error || 'Failed to create SOW.');
      }
    } catch (err) {
      setError('Network error creating SOW.');
    } finally {
      setCreating(false);
    }
  };

  if (data.sowId) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
        <h2 style={{ marginBottom: '0.5rem' }}>SOW Created</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Your Statement of Work has been generated with {data.scopeSelections?.length || 0} scope items.
        </p>
        <a
          href={`/sow/${data.sowId}/build`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ textDecoration: 'none' }}
        >
          Open SOW Builder →
        </a>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
      <h2 style={{ marginBottom: '0.5rem' }}>Generate Statement of Work</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Auto-generate a SOW from your diagnostic results and selected scope
        ({data.scopeSelections?.length || 0} items).
      </p>
      {error && (
        <div style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>
      )}
      <button
        onClick={handleCreate}
        disabled={creating}
        className="btn btn-primary btn-lg"
        style={{ opacity: creating ? 0.6 : 1 }}
      >
        {creating ? 'Creating SOW...' : 'Build SOW from Selections'}
      </button>
    </div>
  );
}

// ─── Step: Review ───────────────────────────────────────────────────────────

function ReviewStep() {
  const { data, completedSteps, resetWorkflow } = useWorkflow();
  const { customerPath } = useCustomer();

  const allComplete = ['diagnostic', 'engagement', 'scope', 'sow'].every(s => completedSteps.includes(s));

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{allComplete ? '🎉' : '📋'}</div>
        <h2>{allComplete ? 'Workflow Complete!' : 'Review Your Progress'}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {allComplete ? 'All steps completed. Your SOW is ready.' : 'Some steps still need attention.'}
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1rem', maxWidth: 600, margin: '0 auto' }}>
        {[
          { id: 'diagnostic', label: 'Diagnostic', stat: data.diagnosticStats?.total ? `${data.diagnosticStats.total} items assessed` : 'Not started' },
          { id: 'engagement', label: 'Engagement', stat: data.engagementRecommendation ? `${data.engagementRecommendation.summary.projectCount} projects` : 'Not started' },
          { id: 'scope', label: 'Scope', stat: data.scopeSelections ? `${data.scopeSelections.length} items selected` : 'Not started' },
          { id: 'sow', label: 'SOW', stat: data.sowId ? 'Draft created' : 'Not started' },
        ].map(item => (
          <div key={item.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.25rem',
            background: 'white',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
          }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: completedSteps.includes(item.id) ? '#22c55e' : '#e5e7eb',
              color: 'white', fontSize: '0.75rem', fontWeight: 700,
            }}>
              {completedSteps.includes(item.id) ? '✓' : '—'}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.stat}</div>
            </div>
          </div>
        ))}
      </div>

      {data.sowId && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a
            href={`/sow/${data.sowId}/build`}
            className="btn btn-primary btn-lg"
            style={{ textDecoration: 'none', marginRight: '1rem' }}
          >
            Open SOW Builder
          </a>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => { if (confirm('Reset the entire workflow?')) resetWorkflow(); }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Start Over
        </button>
      </div>
    </div>
  );
}

// ─── Step Router ────────────────────────────────────────────────────────────

const STEP_COMPONENTS = {
  diagnostic: DiagnosticStep,
  engagement: EngagementStep,
  scope: ScopeStep,
  sow: SowStep,
  review: ReviewStep,
};

function WorkflowContent() {
  const { currentStep, previousStep: prevStepFn } = useWorkflow();
  const [prevStepId, setPrevStepId] = useState(null);
  const [direction, setDirection] = useState('forward');
  const lastStep = useRef(currentStep);

  const lastStepRef = useRef(currentStep);

  useEffect(() => {
    const STEP_IDS = ['diagnostic', 'engagement', 'scope', 'sow', 'review'];
    const oldIdx = STEP_IDS.indexOf(lastStepRef.current);
    const newIdx = STEP_IDS.indexOf(currentStep);
    setDirection(newIdx >= oldIdx ? 'forward' : 'back');
    setPrevStepId(lastStepRef.current !== currentStep ? lastStepRef.current : null);
    lastStepRef.current = currentStep;
  }, [currentStep]);

  const StepComponent = STEP_COMPONENTS[currentStep] || DiagnosticStep;

  return (
    <StepTransition direction={direction} previousStepId={prevStepId}>
      <StepComponent />
    </StepTransition>
  );
}

// Need useRef
import { useRef } from 'react';

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function WorkflowPage() {
  return (
    <WorkflowProvider>
      <Layout title="Sales Workflow">
        <SalesWorkflowStepper />
        <div className="container" style={{ paddingTop: '1.5rem' }}>
          <WorkflowContent />
        </div>
      </Layout>
    </WorkflowProvider>
  );
}
