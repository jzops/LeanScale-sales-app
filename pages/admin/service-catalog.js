/**
 * Admin Service Catalog Management
 *
 * Full CRUD for the service catalog — browse, search, add, edit, delete services.
 * Uses ServiceCatalogTable for display and ServiceEditor for create/edit.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import ServiceCatalogTable from '../../components/admin/ServiceCatalogTable';
import ServiceEditor from '../../components/admin/ServiceEditor';

const CATEGORIES = [
  'Power10',
  'Strategic',
  'Managed Services',
  'Custom Diagnostic',
  'Tool Diagnostic',
  'Tool Project',
];

export default function AdminServiceCatalog() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | service object
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadServices();
    }
  }, [isAuthenticated]);

  async function loadServices() {
    setLoading(true);
    try {
      const res = await fetch('/api/service-catalog');
      if (res.ok) {
        const json = await res.json();
        setServices(json.data || []);
      }
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data) {
    setSaving(true);
    try {
      const isNew = editing === 'new';
      const url = isNew
        ? '/api/service-catalog'
        : `/api/service-catalog/${editing.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setEditing(null);
        await loadServices();
      } else {
        const json = await res.json();
        alert(json.error || 'Failed to save service');
      }
    } catch (err) {
      console.error('Error saving service:', err);
      alert('Failed to save service');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`/api/service-catalog/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadServices();
      } else {
        const json = await res.json();
        alert(json.error || 'Failed to delete service');
      }
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Service Catalog | LeanScale Admin</title>
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
          <span style={{ fontSize: '0.875rem', color: '#666' }}>{user?.email}</span>
        </header>

        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Navigation */}
          <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
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
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              color: '#333',
            }}>
              Diagnostics
            </Link>
            <Link href="/admin/service-catalog" style={{
              padding: '0.5rem 1rem',
              background: '#7c3aed',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}>
              Service Catalog
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

          {/* Page title + Add button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                Service Catalog
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#718096', marginTop: '0.25rem' }}>
                Manage the services available for SOW sections. {services.length} services total.
              </p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing('new')}
                style={{
                  padding: '0.5rem 1.25rem',
                  background: '#6C5CE7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Add Service
              </button>
            )}
          </div>

          {/* Editor (shown when adding or editing) */}
          {editing && (
            <div style={{ marginBottom: '1.5rem' }}>
              <ServiceEditor
                service={editing === 'new' ? null : editing}
                onSave={handleSave}
                onCancel={() => setEditing(null)}
                saving={saving}
              />
            </div>
          )}

          {/* Table */}
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <ServiceCatalogTable
              services={services}
              categories={CATEGORIES}
              onEdit={(service) => setEditing(service)}
              onDelete={handleDelete}
              loading={loading}
            />
          </div>
        </main>
      </div>
    </>
  );
}
