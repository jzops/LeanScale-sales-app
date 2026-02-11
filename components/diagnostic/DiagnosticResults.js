import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from '../Layout';
import { diagnosticRegistry, countStatuses } from '../../data/diagnostic-registry';
import { useCustomer } from '../../context/CustomerContext';
import { slideUp } from '../../lib/animations';

// Views
import DiagnosticNav from './DiagnosticNav';
import PriorityView from './views/PriorityView';
import CategoryView from './views/CategoryView';
import OutcomeView from './views/OutcomeView';
import TableView from './views/TableView';
import MetricsView from './views/MetricsView';
import MarkdownImport from './MarkdownImport';
import DiagnosticSkeleton from './DiagnosticSkeleton';
import DiagnosticItemModal from './DiagnosticItemModal';

/**
 * Sort processes into priority tiers.
 */
function sortByPriority(processes) {
  const tiers = { critical: [], warning: [], moderate: [], healthy: [] };

  processes.forEach((p) => {
    if (p.status === 'unable' || (p.status === 'warning' && p.addToEngagement)) {
      tiers.critical.push(p);
    } else if (p.status === 'warning') {
      tiers.warning.push(p);
    } else if (p.status === 'careful') {
      tiers.moderate.push(p);
    } else {
      tiers.healthy.push(p);
    }
  });

  return tiers;
}

/**
 * DiagnosticResults — unified diagnostic results page component (redesigned)
 *
 * Orchestrates data loading, edit state, and view rendering.
 * All visual rendering is delegated to view components.
 *
 * @param {string} diagnosticType - 'gtm' | 'clay' | 'cpq'
 */
export default function DiagnosticResults({ diagnosticType }) {
  const router = useRouter();
  const { customer, isDemo, customerPath } = useCustomer();
  const config = diagnosticRegistry[diagnosticType];

  // --- State ---
  const [editMode, setEditMode] = useState(false);
  const [editableProcesses, setEditableProcesses] = useState(null);
  const [editableTools, setEditableTools] = useState(null);
  const [notes, setNotes] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [diagnosticResultId, setDiagnosticResultId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [activeView, setActiveView] = useState('priority');
  const [linkedSows, setLinkedSows] = useState([]);
  const [syncToast, setSyncToast] = useState(null);
  const [highlightedItem, setHighlightedItem] = useState(null);
  const [modalItem, setModalItem] = useState(null);
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

  // --- Load linked SOWs ---
  useEffect(() => {
    if (isDemo || !customer?.id) return;

    async function loadLinkedSows() {
      try {
        const res = await fetch(`/api/diagnostics/${diagnosticType}/linked-sows?customerId=${customer.id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) setLinkedSows(json.data || []);
        }
      } catch (_) { /* ignore */ }
    }

    loadLinkedSows();
  }, [customer?.id, diagnosticType, isDemo]);

  // --- Handle highlight query param ---
  useEffect(() => {
    const { highlight } = router.query;
    if (highlight) {
      setHighlightedItem(highlight);
      // Auto-clear after 3 seconds
      const timer = setTimeout(() => setHighlightedItem(null), 3000);
      // Scroll to the item
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-process-name="${CSS.escape(highlight)}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      return () => clearTimeout(timer);
    }
  }, [router.query]);

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
      // Show sync toast if there are linked SOWs
      if (linkedSows.length > 0) {
        setSyncToast({
          count: linkedSows.length,
          sows: linkedSows,
        });
        setTimeout(() => setSyncToast(null), 5000);
      }
    } catch (err) {
      console.error('Error saving diagnostic data:', err);
    } finally {
      setSaving(false);
    }
  }, [customer?.id, diagnosticType, isDemo, customer?.customerName, linkedSows]);

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
    await saveToApi(importedProcesses, importedTools || []);
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

  // --- Build SOW handler ---
  async function handleBuildSow() {
    try {
      const res = await fetch('/api/sow/from-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          diagnosticResultId,
          diagnosticType,
          customerName: customer.customerName,
          sowType: diagnosticType === 'clay' ? 'clay' : diagnosticType === 'cpq' ? 'q2c' : 'embedded',
          createdBy: 'sales-app',
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.id) {
        router.push(customerPath(`/sow/${json.data.id}`));
      }
    } catch (err) {
      console.error('Error creating SOW from diagnostic:', err);
    }
  }

  // --- Computed data ---
  const processStats = countStatuses(processes);
  const toolStats = toolsData ? countStatuses(toolsData) : null;
  const power10Stats = power10Data
    ? countStatuses(power10Data.map(m => ({ status: m.ableToReport || 'unable' })))
    : null;
  const priorityCount = processes.filter(p => p.addToEngagement).length;
  const tiers = sortByPriority(processes);

  // Build available views based on data
  const availableViews = ['priority'];
  if (categories && categories.length > 0) availableViews.push('by-category');
  if (outcomes && outcomes.length > 0) availableViews.push('by-outcome');
  availableViews.push('table');
  if (power10Data || (toolsData && toolsData.length > 0)) availableViews.push('metrics');

  const categoryLabel = diagnosticType === 'gtm' ? 'Function' : 'Category';

  // --- Sync active view from URL ---
  useEffect(() => {
    const { view } = router.query;
    if (view && availableViews.includes(view)) {
      setActiveView(view);
    }
  }, [router.query]);

  return (
    <Layout title={config.title}>
      <div className="container">
        {/* Page header */}
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title" style={{ justifyContent: 'center' }}>
            <span>{config.icon}</span> {config.title}
          </h1>
          <p className="page-subtitle">{config.subtitle}</p>
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

        {/* Loading skeleton */}
        {loadingData && <DiagnosticSkeleton />}

        {/* Sticky navigation */}
        <DiagnosticNav
          activeView={activeView}
          onViewChange={setActiveView}
          editMode={editMode}
          onEditToggle={() => setEditMode(!editMode)}
          onImport={() => setShowImport(true)}
          onBuildSow={handleBuildSow}
          saving={saving}
          hasCustomerData={editableProcesses !== null}
          hasDiagnosticResult={!!diagnosticResultId}
          isDemo={isDemo}
          availableViews={availableViews}
        />

        {/* Active View */}
        <div style={{ marginTop: 'var(--space-4)' }}>
          {activeView === 'priority' && (
            <PriorityView
              tiers={tiers}
              stats={processStats}
              priorityCount={priorityCount}
              diagnosticType={diagnosticType}
              title={config.title}
              editMode={editMode}
              onStatusChange={handleStatusChange}
              onPriorityToggle={handlePriorityToggle}
              notes={notes}
              expandedRow={expandedRow}
              onRowExpand={setExpandedRow}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              linkedSows={linkedSows}
              highlightedItem={highlightedItem}
              customerPath={customerPath}
              onOpenModal={editMode ? setModalItem : undefined}
            />
          )}

          {activeView === 'by-category' && categories && (
            <CategoryView
              processes={processes}
              groupNames={categories}
              groupField="function"
              groupLabel={categoryLabel}
              editMode={editMode}
              onStatusChange={handleStatusChange}
              onPriorityToggle={handlePriorityToggle}
              notes={notes}
              onOpenNotes={(name) => setExpandedRow(name === expandedRow ? null : name)}
              linkedSows={linkedSows}
              highlightedItem={highlightedItem}
              customerPath={customerPath}
              onOpenModal={editMode ? setModalItem : undefined}
            />
          )}

          {activeView === 'by-outcome' && outcomes && (
            <OutcomeView
              processes={processes}
              outcomes={outcomes}
              editMode={editMode}
              onStatusChange={handleStatusChange}
              onPriorityToggle={handlePriorityToggle}
              notes={notes}
              onOpenNotes={(name) => setExpandedRow(name === expandedRow ? null : name)}
              onOpenModal={editMode ? setModalItem : undefined}
            />
          )}

          {activeView === 'table' && (
            <TableView
              processes={processes}
              editMode={editMode}
              onStatusChange={handleStatusChange}
              onPriorityToggle={handlePriorityToggle}
              notes={notes}
              expandedRow={expandedRow}
              onRowExpand={setExpandedRow}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              categoryLabel={categoryLabel}
              onOpenModal={editMode ? setModalItem : undefined}
            />
          )}

          {activeView === 'metrics' && (
            <MetricsView
              power10Data={power10Data}
              toolsData={toolsData}
              processStats={processStats}
              toolStats={toolStats}
              power10Stats={power10Stats}
              processes={processes}
            />
          )}
        </div>

        {/* CTA Banner */}
        <div className="cta-banner" style={{ marginTop: '2rem' }}>
          <h3 className="cta-title">
            {diagnosticType === 'clay'
              ? 'Ready to optimize your Clay implementation?'
              : diagnosticType === 'cpq'
              ? 'Ready to optimize your Quote-to-Cash process?'
              : 'Ready to see your recommended engagement?'}
          </h3>
          <p className="cta-subtitle">
            View prioritized projects and timeline based on your diagnostic results.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {!isDemo && diagnosticResultId ? (
              <>
                <a href={customerPath('/sow')} className="nav-cta" style={{ textDecoration: 'none' }}>
                  View Statement of Work
                </a>
                <a
                  href={customerPath('/try-leanscale/engagement')}
                  className="nav-cta"
                  style={{
                    textDecoration: 'none',
                    background: 'transparent',
                    border: '2px solid var(--primary)',
                    color: 'var(--primary)',
                  }}
                >
                  View Engagement Overview
                </a>
              </>
            ) : (
              <a href={customerPath('/try-leanscale/start')} className="nav-cta" style={{ textDecoration: 'none' }}>
                Start Your Diagnostic
              </a>
            )}
          </div>
        </div>

        {/* Sync Toast */}
        <AnimatePresence>
          {syncToast && (
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="show"
              exit="exit"
              style={{
                position: 'fixed',
                bottom: '1.5rem',
                right: '1.5rem',
                zIndex: 100,
                background: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                maxWidth: '340px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e', marginBottom: '0.25rem' }}>
                    Diagnostic saved
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                    {syncToast.count} linked SOW{syncToast.count !== 1 ? 's' : ''} may need updating
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {syncToast.sows.slice(0, 3).map(s => (
                      <a
                        key={s.id}
                        href={customerPath(`/sow/${s.id}`)}
                        style={{
                          fontSize: '0.75rem',
                          color: '#6C5CE7',
                          textDecoration: 'none',
                          padding: '0.15rem 0.5rem',
                          background: '#F3F0FF',
                          borderRadius: '0.25rem',
                        }}
                      >
                        {s.title || 'View SOW'}
                      </a>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSyncToast(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#A0AEC0',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  x
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Diagnostic Item Detail Modal */}
        <DiagnosticItemModal
          item={modalItem}
          open={!!modalItem}
          onClose={() => setModalItem(null)}
          editMode={editMode}
          onStatusChange={(name, status) => {
            handleStatusChange(name, status);
            // Update modalItem in place so the modal reflects the change
            setModalItem(prev => prev && prev.name === name ? { ...prev, status } : prev);
          }}
          onPriorityToggle={(name) => {
            handlePriorityToggle(name);
            setModalItem(prev => prev && prev.name === name ? { ...prev, addToEngagement: !prev.addToEngagement } : prev);
          }}
          notes={notes}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
        />
      </div>
    </Layout>
  );
}
