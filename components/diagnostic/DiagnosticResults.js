import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../Layout';
import DonutChart from '../charts/DonutChart';
import BarChart from '../charts/BarChart';
import { StatusDot, StatusBadge, getStatusColor } from './StatusLegend';
import { diagnosticRegistry, countStatuses, groupBy } from '../../data/diagnostic-registry';
import { useCustomer } from '../../context/CustomerContext';
import NoteDrawer from './NoteDrawer';
import MarkdownImport from './MarkdownImport';

const STATUS_CYCLE = ['healthy', 'careful', 'warning', 'unable'];

/**
 * ItemTable — tabular view of diagnostic items with optional function/category column
 * Supports edit mode with status cycling, priority toggling, and notes
 */
function ItemTable({
  items,
  showFunction = false,
  showPriority = true,
  functionLabel = 'Function',
  editMode = false,
  onStatusChange,
  onPriorityToggle,
  notes = [],
  onAddNote,
  onDeleteNote,
  expandedRow,
  onRowExpand,
}) {
  return (
    <div className="diagnostic-table">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            {showFunction && <th>{functionLabel}</th>}
            <th style={{ textAlign: 'center' }}>Status</th>
            {showPriority && <th style={{ textAlign: 'center' }}>Priority</th>}
            {editMode && <th style={{ textAlign: 'center', width: '60px' }}>Notes</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isExpanded = expandedRow === item.name;
            const noteCount = notes.filter(n => n.process_name === item.name).length;

            return (
              <tr key={item.name} style={{ verticalAlign: 'top' }}>
                <td style={{ fontWeight: 'var(--font-medium)' }}>{item.name}</td>
                {showFunction && (
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    {item.function || item.category || '-'}
                  </td>
                )}
                <td style={{ textAlign: 'center' }}>
                  {editMode && onStatusChange ? (
                    <button
                      onClick={() => {
                        const currentIdx = STATUS_CYCLE.indexOf(item.status);
                        const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
                        onStatusChange(item.name, nextStatus);
                      }}
                      style={{
                        background: 'none',
                        border: '1px dashed var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.2rem 0.4rem',
                        cursor: 'pointer',
                      }}
                      title="Click to cycle status"
                    >
                      <StatusBadge status={item.status} />
                    </button>
                  ) : (
                    <StatusBadge status={item.status} />
                  )}
                </td>
                {showPriority && (
                  <td style={{ textAlign: 'center' }}>
                    {editMode && onPriorityToggle ? (
                      <button
                        onClick={() => onPriorityToggle(item.name)}
                        style={{
                          background: item.addToEngagement ? 'var(--ls-lime-green)' : 'var(--bg-subtle)',
                          color: item.addToEngagement ? 'var(--ls-purple)' : 'var(--text-secondary)',
                          border: '1px dashed var(--border-color)',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 'var(--font-semibold)',
                          fontSize: 'var(--text-xs)',
                          cursor: 'pointer',
                        }}
                        title="Click to toggle priority"
                      >
                        {item.addToEngagement ? 'Priority' : '-'}
                      </button>
                    ) : (
                      item.addToEngagement && (
                        <span style={{
                          fontSize: 'var(--text-xs)',
                          background: 'var(--ls-lime-green)',
                          color: 'var(--ls-purple)',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 'var(--font-semibold)',
                        }}>
                          Priority
                        </span>
                      )
                    )}
                  </td>
                )}
                {editMode && (
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => onRowExpand?.(isExpanded ? null : item.name)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        color: noteCount > 0 ? 'var(--ls-purple)' : 'var(--text-muted)',
                        padding: '0.2rem',
                      }}
                      title={isExpanded ? 'Close notes' : 'Open notes'}
                    >
                      {noteCount > 0 ? `💬 ${noteCount}` : '💬'}
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Render NoteDrawer below the table for the expanded row */}
      {editMode && expandedRow && (
        <NoteDrawer
          processName={expandedRow}
          notes={notes}
          onAddNote={onAddNote}
          onDeleteNote={onDeleteNote}
        />
      )}
    </div>
  );
}

/**
 * GroupedView — items grouped by a field with status summaries per group
 */
function GroupedView({ items, groupByField, groupNames }) {
  const grouped = groupBy(items, groupByField);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {groupNames.map((groupName) => {
        const groupItems = grouped[groupName] || [];
        if (groupItems.length === 0) return null;

        const stats = countStatuses(groupItems);

        return (
          <div
            key={groupName}
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          >
            <div style={{
              background: 'var(--bg-subtle)',
              padding: 'var(--space-3) var(--space-4)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
            }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', margin: 0 }}>{groupName}</h3>
              <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                {stats.healthy > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <StatusDot status="healthy" size={8} /> {stats.healthy}
                  </span>
                )}
                {stats.careful > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <StatusDot status="careful" size={8} /> {stats.careful}
                  </span>
                )}
                {stats.warning > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <StatusDot status="warning" size={8} /> {stats.warning}
                  </span>
                )}
                {stats.unable > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <StatusDot status="unable" size={8} /> {stats.unable}
                  </span>
                )}
              </div>
            </div>
            <div style={{ padding: 'var(--space-2)' }}>
              {groupItems.map((item, index) => (
                <div
                  key={item.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    background: index % 2 === 0 ? 'var(--bg-subtle)' : 'white',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1 }}>
                    <span style={{ fontSize: 'var(--text-sm)' }}>{item.name}</span>
                    {item.addToEngagement && (
                      <span style={{
                        fontSize: 'var(--text-2xs)',
                        background: 'var(--ls-lime-green)',
                        color: 'var(--ls-purple)',
                        padding: '0.1rem var(--space-1)',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 'var(--font-semibold)',
                      }}>
                        Priority
                      </span>
                    )}
                  </div>
                  <StatusDot status={item.status} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * StatusColorDot — inline colored dot for the health overview section
 */
function StatusColorDot({ status }) {
  return (
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(status), display: 'inline-block' }} />
  );
}

/**
 * HealthOverviewCard — shows status distribution for a group of items
 */
function HealthOverviewCard({ label, stats }) {
  return (
    <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.08)' }}>
      <div style={{ fontSize: '0.7rem', color: '#a5b4fc', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {stats.healthy > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#4ade80' }}>
            <StatusColorDot status="healthy" /> {stats.healthy}
          </span>
        )}
        {stats.careful > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#facc15' }}>
            <StatusColorDot status="careful" /> {stats.careful}
          </span>
        )}
        {stats.warning > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#f87171' }}>
            <StatusColorDot status="warning" /> {stats.warning}
          </span>
        )}
        {stats.unable > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#9ca3af' }}>
            <StatusColorDot status="unable" /> {stats.unable}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * DiagnosticResults — unified diagnostic results page component
 *
 * Renders any diagnostic type (gtm, clay, cpq) using the diagnostic registry.
 * All three diagnostic pages use this component as their single source of truth.
 *
 * @param {string} diagnosticType - 'gtm' | 'clay' | 'cpq'
 */
export default function DiagnosticResults({ diagnosticType }) {
  const router = useRouter();
  const { customer, isDemo, customerPath } = useCustomer();
  const config = diagnosticRegistry[diagnosticType];

  // --- Edit mode & customer data state ---
  const [editMode, setEditMode] = useState(false);
  const [editableProcesses, setEditableProcesses] = useState(null);
  const [editableTools, setEditableTools] = useState(null);
  const [notes, setNotes] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [diagnosticResultId, setDiagnosticResultId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const saveTimerRef = useRef(null);

  if (!config) {
    return (
      <Layout title="Diagnostic Not Found">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h1>Diagnostic type &quot;{diagnosticType}&quot; not found</h1>
        </div>
      </Layout>
    );
  }

  const { processes: staticProcesses, tools: staticTools, categories, outcomes, power10Metrics: power10Data } = config;

  // Use customer-specific data when available, otherwise static
  const processes = editableProcesses || staticProcesses;
  const toolsData = editableTools || staticTools;
  const hasCustomerData = editableProcesses !== null;

  // --- Load customer-specific diagnostic data ---
  useEffect(() => {
    if (isDemo || !customer?.id) return;

    async function loadDiagnosticData() {
      setLoadingData(true);
      try {
        const res = await fetch(`/api/diagnostics/${diagnosticType}?customerId=${customer.id}`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data) {
          setEditableProcesses(json.data.processes || []);
          setEditableTools(json.data.tools || []);
          setDiagnosticResultId(json.data.id);
          setNotes(json.notes || []);
        }
      } catch (err) {
        console.error('Error loading diagnostic data:', err);
      } finally {
        setLoadingData(false);
      }
    }

    loadDiagnosticData();
  }, [customer?.id, diagnosticType, isDemo]);

  // --- Auto-save (debounced) ---
  const saveToApi = useCallback(async (procs, tls) => {
    if (isDemo || !customer?.id) return;
    setSaving(true);
    try {
      await fetch(`/api/diagnostics/${diagnosticType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          processes: procs,
          tools: tls || [],
          createdBy: customer.customerName || 'unknown',
        }),
      });
    } catch (err) {
      console.error('Error saving diagnostic data:', err);
    } finally {
      setSaving(false);
    }
  }, [customer?.id, diagnosticType, isDemo, customer?.customerName]);

  function scheduleSave(procs, tls) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveToApi(procs, tls), 800);
  }

  // --- Edit handlers ---
  function handleStatusChange(processName, newStatus) {
    const updated = processes.map(p =>
      p.name === processName ? { ...p, status: newStatus } : p
    );
    setEditableProcesses(updated);
    scheduleSave(updated, editableTools);
  }

  function handlePriorityToggle(processName) {
    const updated = processes.map(p =>
      p.name === processName ? { ...p, addToEngagement: !p.addToEngagement } : p
    );
    setEditableProcesses(updated);
    scheduleSave(updated, editableTools);
  }

  // --- Note handlers ---
  async function handleAddNote({ processName, note }) {
    if (!diagnosticResultId) return;
    try {
      const res = await fetch('/api/diagnostics/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosticResultId,
          processName,
          note,
          author: customer?.customerName || 'User',
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setNotes(prev => [...prev, json.data]);
        }
      }
    } catch (err) {
      console.error('Error adding note:', err);
    }
  }

  async function handleDeleteNote(noteId) {
    try {
      const res = await fetch('/api/diagnostics/notes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId }),
      });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
      }
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  }

  // --- Markdown import handler ---
  async function handleImport({ processes: importedProcesses, tools: importedTools }) {
    setEditableProcesses(importedProcesses);
    setEditableTools(importedTools || []);
    setShowImport(false);
    // Save immediately after import
    await saveToApi(importedProcesses, importedTools || []);
    // Reload to get the new diagnosticResultId
    try {
      const res = await fetch(`/api/diagnostics/${diagnosticType}?customerId=${customer.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDiagnosticResultId(json.data.id);
        }
      }
    } catch (_) { /* ignore */ }
  }

  // Build tabs dynamically based on what data is available
  const tabs = [];
  if (power10Data) {
    tabs.push({ id: 'power10', label: 'Power10 Metrics', icon: '\uD83D\uDCC8' });
  }
  if (toolsData && toolsData.length > 0) {
    tabs.push({ id: 'tools', label: 'GTM Tools', icon: '\uD83D\uDD27' });
  }
  tabs.push({ id: 'processes', label: 'Processes', icon: '\u2699\uFE0F' });
  if (categories && categories.length > 0) {
    tabs.push({
      id: 'by-category',
      label: diagnosticType === 'gtm' ? 'By Function' : 'By Category',
      icon: diagnosticType === 'gtm' ? '\uD83D\uDC65' : '\uD83D\uDCC2',
    });
  }
  if (outcomes && outcomes.length > 0) {
    tabs.push({ id: 'by-outcome', label: 'By Outcome', icon: '\uD83C\uDFAF' });
  }

  const [activeTab, setActiveTab] = useState('processes');

  useEffect(() => {
    const { tab } = router.query;
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [router.query]);

  const processStats = countStatuses(processes);
  const toolStats = toolsData ? countStatuses(toolsData) : null;
  const power10Stats = power10Data
    ? countStatuses(power10Data.map(m => ({ status: m.ableToReport || 'unable' })))
    : null;
  const priorityCount = processes.filter(p => p.addToEngagement).length;

  // Build the overview items for the health overview section
  const overviewItems = [];
  if (power10Stats) {
    overviewItems.push({ label: 'Power10 Metrics', stats: power10Stats, count: power10Data.length });
  }
  if (toolStats) {
    overviewItems.push({ label: 'GTM Tools', stats: toolStats, count: toolsData.length });
  }
  overviewItems.push({ label: 'Processes', stats: processStats, count: processes.length });

  // Total stats for the aggregate row
  const totalHealthy = overviewItems.reduce((sum, item) => sum + item.stats.healthy, 0);
  const totalCareful = overviewItems.reduce((sum, item) => sum + item.stats.careful, 0);
  const totalWarning = overviewItems.reduce((sum, item) => sum + item.stats.warning, 0);
  const totalUnable = overviewItems.reduce((sum, item) => sum + item.stats.unable, 0);

  // CTA config per diagnostic type
  const ctaConfig = {
    gtm: {
      title: 'Ready to see your recommended engagement?',
      subtitle: 'View prioritized projects and timeline based on your diagnostic results.',
      primaryLink: '/try-leanscale/engagement',
      primaryLabel: 'View Engagement Overview',
      secondaryLink: '/buy-leanscale',
      secondaryLabel: 'Get Started',
    },
    clay: {
      title: 'Ready to optimize your Clay implementation?',
      subtitle: 'View prioritized projects and timeline based on your diagnostic results.',
      primaryLink: '/try-leanscale/engagement',
      primaryLabel: 'View Engagement Overview',
      secondaryLink: '/buy-leanscale/clay',
      secondaryLabel: 'Explore Clay x LeanScale',
    },
    cpq: {
      title: 'Ready to optimize your Quote-to-Cash process?',
      subtitle: 'View prioritized projects and timeline based on your diagnostic results.',
      primaryLink: '/try-leanscale/engagement',
      primaryLabel: 'View Engagement Overview',
      secondaryLink: '/buy-leanscale',
      secondaryLabel: 'Get Started',
    },
  };
  const cta = ctaConfig[diagnosticType] || ctaConfig.gtm;

  // Category/function field name and label
  const groupField = 'function'; // All types use 'function' as the field name in the data
  const categoryLabel = diagnosticType === 'gtm' ? 'Function' : 'Category';

  return (
    <Layout title={config.title}>
      <div className="container">
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title" style={{ justifyContent: 'center' }}>
            <span>{config.icon}</span> {config.title}
          </h1>
          <p className="page-subtitle">{config.subtitle}</p>

          {/* Edit mode toggle + Import button + View SOW (only for non-demo customers) */}
          {!isDemo && (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.75rem' }}>
              <button
                onClick={() => setEditMode(!editMode)}
                style={{
                  padding: '0.4rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: editMode ? 'var(--ls-purple)' : 'var(--bg-subtle)',
                  color: editMode ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                {editMode ? 'Exit Edit Mode' : 'Edit Mode'}
              </button>
              <button
                onClick={() => setShowImport(true)}
                style={{
                  padding: '0.4rem 1rem',
                  fontSize: '0.8rem',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                Import Markdown
              </button>
              <Link
                href={customerPath('/sow')}
                style={{
                  padding: '0.4rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: 'var(--ls-purple)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                View Statement of Work
              </Link>
              {saving && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                  Saving...
                </span>
              )}
            </div>
          )}
        </div>

        {/* Markdown Import Modal */}
        {showImport && (
          <div style={{ marginBottom: '2rem' }}>
            <MarkdownImport
              diagnosticType={diagnosticType}
              onImport={handleImport}
              onCancel={() => setShowImport(false)}
            />
          </div>
        )}

        {/* Loading indicator for customer data */}
        {loadingData && (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Loading diagnostic data...
          </div>
        )}

        {/* Summary Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Processes</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ls-purple-light)' }}>{processes.length}</div>
          </div>
          {toolsData && (
            <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Tools</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ls-purple-light)' }}>{toolsData.length}</div>
            </div>
          )}
          {power10Data && (
            <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Power10 Metrics</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ls-purple-light)' }}>{power10Data.length}</div>
            </div>
          )}
          {!toolsData && !power10Data && (
            <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Categories</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ls-purple-light)' }}>{categories ? categories.length : 0}</div>
            </div>
          )}
          <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Priority Items</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>{priorityCount}</div>
          </div>
        </div>

        {/* Quick Insights Section - Dark Purple */}
        <section className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{'\uD83C\uDFAF'}</span> Health Overview
          </h2>
          <p style={{ color: '#c4b5fd', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
            Status distribution across all {diagnosticType === 'gtm' ? 'GTM' : diagnosticType === 'clay' ? 'Clay' : 'Quote-to-Cash'} inspection points
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {overviewItems.map((item) => (
              <HealthOverviewCard key={item.label} label={item.label} stats={item.stats} />
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-2xs)', color: '#a5b4fc', marginBottom: '0.25rem' }}>Healthy</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4ade80' }}>{totalHealthy}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-2xs)', color: '#a5b4fc', marginBottom: '0.25rem' }}>Careful</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#facc15' }}>{totalCareful}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-2xs)', color: '#a5b4fc', marginBottom: '0.25rem' }}>Warning</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f87171' }}>{totalWarning}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-2xs)', color: '#a5b4fc', marginBottom: '0.25rem' }}>Unable to Report</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#9ca3af' }}>{totalUnable}</div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="diagnostic-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`diagnostic-tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ marginTop: '2rem' }}>
          {activeTab === 'power10' && power10Data && (
            <div>
              <div className="diagnostic-charts-row" style={{ marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <DonutChart data={power10Stats} title="Health Distribution" size={160} />
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <BarChart
                    data={power10Data.map(m => ({
                      name: m.name,
                      status: m.ableToReport || 'unable'
                    }))}
                    title="Power10 Metrics Status"
                  />
                </div>
              </div>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>All Power10 Metrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }} className="power10-grid">
                  {power10Data.map((metric) => (
                    <div
                      key={metric.name}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-lg)',
                      }}
                    >
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>{metric.name}</span>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Report</div>
                          <StatusDot status={metric.ableToReport || 'unable'} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Plan</div>
                          <StatusDot status={metric.statusAgainstPlan || 'unable'} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && toolsData && (
            <div>
              <div className="diagnostic-charts-row" style={{ marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <DonutChart data={toolStats} title="Health Distribution" size={160} />
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <BarChart data={toolsData} title="GTM Tools Status" />
                </div>
              </div>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>All GTM Tools</h3>
                <ItemTable items={toolsData} showFunction={true} functionLabel={categoryLabel} />
              </div>
            </div>
          )}

          {activeTab === 'processes' && (
            <div>
              <div className="diagnostic-charts-row" style={{ marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <DonutChart data={processStats} title="Health Distribution" size={160} />
                </div>
                <div className="card" style={{ padding: '1.5rem', overflow: 'auto' }}>
                  <BarChart data={processes} title="Process Health Overview" maxItems={Math.min(processes.length, 31)} />
                </div>
              </div>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>All Processes ({processes.length})</h3>
                <ItemTable
                  items={processes}
                  showFunction={true}
                  functionLabel={categoryLabel}
                  editMode={editMode}
                  onStatusChange={handleStatusChange}
                  onPriorityToggle={handlePriorityToggle}
                  notes={notes}
                  onAddNote={handleAddNote}
                  onDeleteNote={handleDeleteNote}
                  expandedRow={expandedRow}
                  onRowExpand={setExpandedRow}
                />
              </div>
            </div>
          )}

          {activeTab === 'by-category' && categories && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Processes by {diagnosticType === 'gtm' ? 'GTM Function' : categoryLabel}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
                {processes.length} processes grouped by {diagnosticType === 'gtm' ? 'their GTM function' : `${diagnosticType === 'clay' ? 'Clay' : 'Q2C'} category`}
              </p>
              <GroupedView items={processes} groupByField={groupField} groupNames={categories} />
            </div>
          )}

          {activeTab === 'by-outcome' && outcomes && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Processes by {diagnosticType === 'gtm' ? 'GTM ' : ''}Outcome
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
                {processes.length} processes grouped by their desired business outcome
              </p>
              <GroupedView items={processes} groupByField="outcome" groupNames={outcomes} />
            </div>
          )}
        </div>

        {/* CTA Banner */}
        <div className="cta-banner" style={{ marginTop: '2rem' }}>
          <h3 className="cta-title">{cta.title}</h3>
          <p className="cta-subtitle">{cta.subtitle}</p>
          <div className="cta-buttons">
            <Link href={customerPath(cta.primaryLink)} className="btn cta-btn-primary">
              {cta.primaryLabel}
            </Link>
            <Link href={customerPath(cta.secondaryLink)} className="btn cta-btn-secondary">
              {cta.secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
