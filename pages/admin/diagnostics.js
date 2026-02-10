import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { StatusBadge } from '../../components/diagnostic/StatusLegend';
import MarkdownImport from '../../components/diagnostic/MarkdownImport';
import { diagnosticRegistry, countStatuses } from '../../data/diagnostic-registry';

const DIAGNOSTIC_TYPES = [
  { id: 'gtm', label: 'GTM Diagnostic' },
  { id: 'clay', label: 'Clay Diagnostic' },
  { id: 'cpq', label: 'Q2C Diagnostic' },
];

export default function AdminDiagnostics() {
  const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedType, setSelectedType] = useState('gtm');
  const [diagnosticData, setDiagnosticData] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCustomers();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedCustomerId && selectedType) {
      loadDiagnosticData();
    } else {
      setDiagnosticData(null);
      setNotes([]);
    }
  }, [selectedCustomerId, selectedType]);

  async function loadCustomers() {
    try {
      const { data } = await supabase
        .from('customers')
        .select('id, slug, name, is_demo')
        .order('name');
      setCustomers(data || []);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  }

  async function loadDiagnosticData() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/diagnostics/${selectedType}?customerId=${selectedCustomerId}`);
      if (res.ok) {
        const json = await res.json();
        setDiagnosticData(json.data);
        setNotes(json.notes || []);
      }
    } catch (err) {
      console.error('Error loading diagnostic data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleImport({ processes, tools }) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/diagnostics/${selectedType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          processes,
          tools: tools || [],
          createdBy: user?.email || 'admin',
        }),
      });
      if (res.ok) {
        setShowImport(false);
        setMessage({ type: 'success', text: `Imported ${processes.length} processes successfully.` });
        await loadDiagnosticData();
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Import failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleInitializeFromDemo() {
    const config = diagnosticRegistry[selectedType];
    if (!config) return;

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/diagnostics/${selectedType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          processes: config.processes,
          tools: config.tools || [],
          createdBy: user?.email || 'admin',
        }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: `Initialized ${selectedType.toUpperCase()} with ${config.processes.length} demo processes.` });
        await loadDiagnosticData();
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Initialize failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(processName, newStatus) {
    if (!diagnosticData) return;
    const updated = diagnosticData.processes.map(p =>
      p.name === processName ? { ...p, status: newStatus } : p
    );
    setDiagnosticData({ ...diagnosticData, processes: updated });

    try {
      await fetch(`/api/diagnostics/${selectedType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          processes: updated,
          tools: diagnosticData.tools || [],
          createdBy: user?.email || 'admin',
        }),
      });
    } catch (err) {
      console.error('Error saving status change:', err);
    }
  }

  async function handlePriorityToggle(processName) {
    if (!diagnosticData) return;
    const updated = diagnosticData.processes.map(p =>
      p.name === processName ? { ...p, addToEngagement: !p.addToEngagement } : p
    );
    setDiagnosticData({ ...diagnosticData, processes: updated });

    try {
      await fetch(`/api/diagnostics/${selectedType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          processes: updated,
          tools: diagnosticData.tools || [],
          createdBy: user?.email || 'admin',
        }),
      });
    } catch (err) {
      console.error('Error saving priority toggle:', err);
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        Loading...
      </div>
    );
  }

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const STATUS_CYCLE = ['healthy', 'careful', 'warning', 'unable'];

  return (
    <>
      <Head>
        <title>Diagnostics Management | LeanScale Admin</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        {/* Header */}
        <header style={{
          background: 'white',
          padding: '1rem 2rem',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>LeanScale Admin</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#666' }}>{user?.email}</span>
            <button
              onClick={async () => { await signOut(); router.push('/admin/login'); }}
              style={{
                padding: '0.5rem 1rem',
                background: '#eee',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Navigation */}
          <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <Link href="/admin" style={{
              padding: '0.5rem 1rem',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              color: '#333',
            }}>
              Dashboard
            </Link>
            <Link href="/admin/customers" style={{
              padding: '0.5rem 1rem',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              color: '#333',
            }}>
              Customers
            </Link>
            <Link href="/admin/diagnostics" style={{
              padding: '0.5rem 1rem',
              background: '#7c3aed',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}>
              Diagnostics
            </Link>
            <Link href="/admin/availability" style={{
              padding: '0.5rem 1rem',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              color: '#333',
            }}>
              Availability
            </Link>
            <Link href="/admin/submissions" style={{
              padding: '0.5rem 1rem',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              color: '#333',
            }}>
              Submissions
            </Link>
          </nav>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            Diagnostic Management
          </h2>

          {/* Selectors Row */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}>
            {/* Customer Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                Customer
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  background: 'white',
                  minWidth: '200px',
                }}
              >
                <option value="">Select a customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.is_demo ? '(demo)' : ''} — {c.slug}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                Diagnostic Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  background: 'white',
                }}
              >
                {DIAGNOSTIC_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            {selectedCustomerId && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setShowImport(!showImport)}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    background: '#7c3aed',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Import Markdown
                </button>
                {!diagnosticData && (
                  <button
                    onClick={handleInitializeFromDemo}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      background: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.6 : 1,
                    }}
                  >
                    Initialize from Demo
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Message */}
          {message && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              background: message.type === 'success' ? '#d1fae5' : '#fef2f2',
              border: `1px solid ${message.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
              color: message.type === 'success' ? '#065f46' : '#991b1b',
              fontSize: '0.875rem',
            }}>
              {message.text}
            </div>
          )}

          {/* Import Panel */}
          {showImport && selectedCustomerId && (
            <div style={{ marginBottom: '1.5rem' }}>
              <MarkdownImport
                diagnosticType={selectedType}
                onImport={handleImport}
                onCancel={() => setShowImport(false)}
              />
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              Loading diagnostic data...
            </div>
          )}

          {/* No Customer Selected */}
          {!selectedCustomerId && !loading && (
            <div style={{
              background: 'white',
              padding: '3rem',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#666',
            }}>
              Select a customer to manage their diagnostic data.
            </div>
          )}

          {/* No Data Yet */}
          {selectedCustomerId && !loading && !diagnosticData && (
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
            }}>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                No {selectedType.toUpperCase()} diagnostic data for {selectedCustomer?.name || 'this customer'}.
              </p>
              <p style={{ fontSize: '0.85rem', color: '#999' }}>
                Use &ldquo;Import Markdown&rdquo; or &ldquo;Initialize from Demo&rdquo; to get started.
              </p>
            </div>
          )}

          {/* Diagnostic Data Table */}
          {selectedCustomerId && !loading && diagnosticData && diagnosticData.processes && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              {/* Summary */}
              <div style={{
                padding: '1rem 1.5rem',
                background: '#f9fafb',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}>
                <div>
                  <strong>{selectedCustomer?.name}</strong> — {selectedType.toUpperCase()} Diagnostic
                  <span style={{ color: '#666', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                    ({diagnosticData.processes.length} processes)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                  {(() => {
                    const stats = countStatuses(diagnosticData.processes);
                    return (
                      <>
                        <span style={{ color: '#22c55e' }}>Healthy: {stats.healthy}</span>
                        <span style={{ color: '#eab308' }}>Careful: {stats.careful}</span>
                        <span style={{ color: '#ef4444' }}>Warning: {stats.warning}</span>
                        <span style={{ color: '#6b7280' }}>Unable: {stats.unable}</span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Process Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #eee' }}>Process</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #eee', width: '120px' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #eee', width: '80px' }}>Priority</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                      {selectedType === 'gtm' ? 'Function' : 'Category'}
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #eee', width: '60px' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnosticData.processes.map((p, i) => {
                    const noteCount = notes.filter(n => n.process_name === p.name).length;
                    return (
                      <tr key={p.name} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                        <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #eee' }}>{p.name}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                          <button
                            onClick={() => {
                              const idx = STATUS_CYCLE.indexOf(p.status);
                              const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
                              handleStatusChange(p.name, next);
                            }}
                            style={{
                              background: 'none',
                              border: '1px dashed #ddd',
                              borderRadius: '4px',
                              padding: '0.15rem 0.3rem',
                              cursor: 'pointer',
                            }}
                            title="Click to cycle status"
                          >
                            <StatusBadge status={p.status} />
                          </button>
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                          <button
                            onClick={() => handlePriorityToggle(p.name)}
                            style={{
                              background: p.addToEngagement ? '#d9f99d' : '#f3f4f6',
                              color: p.addToEngagement ? '#4c1d95' : '#9ca3af',
                              border: '1px dashed #ddd',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {p.addToEngagement ? 'Yes' : '-'}
                          </button>
                        </td>
                        <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #eee', color: '#666' }}>
                          {p.function || '-'}
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #eee', color: noteCount > 0 ? '#7c3aed' : '#ccc' }}>
                          {noteCount > 0 ? noteCount : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Last updated */}
              {diagnosticData.updated_at && (
                <div style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#999', borderTop: '1px solid #eee' }}>
                  Last updated: {new Date(diagnosticData.updated_at).toLocaleString()}
                  {diagnosticData.created_by && ` by ${diagnosticData.created_by}`}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
