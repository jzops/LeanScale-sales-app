import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function AdminCustomers() {
  const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    logo_url: '',
    password: '',
    nda_link: '',
    intake_form_link: '',
    youtube_video_id: '',
    google_slides_embed_url: '',
    assigned_team: '',
    is_demo: false,
    diagnostic_type: 'gtm',
    customer_type: 'prospect',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormData({
      slug: '',
      name: '',
      logo_url: '',
      password: '',
      nda_link: 'https://powerforms.docusign.net/0758efed-0a42-4275-b5d9-f26875d64ae6?env=na4&acct=9287b4d2-50a6-4309-b7e8-7f0b785470c0&accountId=9287b4d2-50a6-4309-b7e8-7f0b785470c0',
      intake_form_link: 'https://forms.fillout.com/t/nqEbrHoL5Eus',
      youtube_video_id: 'M7oECb8xsy0',
      google_slides_embed_url: 'https://docs.google.com/presentation/d/e/2PACX-1vSGSLvHvPn9Cus6N3BpGnK6AkZsUiEdh8cARVVBiZ4w54uUCjHHJ-lHfymW8wfPPraAXMfgXtePxIwf/pubembed?start=true&loop=true&delayms=3000',
      assigned_team: 'izzy, brian, dave, kavean',
      is_demo: false,
      diagnostic_type: 'gtm',
      customer_type: 'prospect',
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      slug: customer.slug,
      name: customer.name,
      logo_url: customer.logo_url || '',
      password: customer.password,
      nda_link: customer.nda_link || '',
      intake_form_link: customer.intake_form_link || '',
      youtube_video_id: customer.youtube_video_id || '',
      google_slides_embed_url: customer.google_slides_embed_url || '',
      assigned_team: (customer.assigned_team || []).join(', '),
      is_demo: customer.is_demo || false,
      diagnostic_type: customer.diagnostic_type || 'gtm',
      customer_type: customer.customer_type || 'prospect',
    });
    setError(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        assigned_team: formData.assigned_team.split(',').map(s => s.trim()).filter(Boolean),
      };

      const res = await fetch('/api/admin/customers', {
        method: editingCustomer ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCustomer ? { id: editingCustomer.id, ...payload } : payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save customer');
      }

      setShowModal(false);
      loadCustomers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customer) => {
    if (!confirm(`Are you sure you want to delete "${customer.name}"?`)) return;

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customer.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete customer');
      }

      loadCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

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
        <title>Customers | LeanScale Admin</title>
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
              onClick={handleSignOut}
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
          <nav style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
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
              background: '#7c3aed',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
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

          {/* Header with Add Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Customers</h2>
            <button
              onClick={openCreateModal}
              style={{
                padding: '0.5rem 1rem',
                background: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              + Add Customer
            </button>
          </div>

          {/* Customer Table */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500, fontSize: '0.875rem' }}>Name</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500, fontSize: '0.875rem' }}>Slug</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500, fontSize: '0.875rem' }}>Password</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500, fontSize: '0.875rem' }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500, fontSize: '0.875rem' }}>Diagnostic</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500, fontSize: '0.875rem' }}>Portal URL</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 500, fontSize: '0.875rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                      Loading...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                      No customers yet. Click "Add Customer" to create one.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {customer.logo_url && (
                            <img
                              src={customer.logo_url}
                              alt=""
                              style={{ width: 24, height: 24, borderRadius: '4px', objectFit: 'contain' }}
                            />
                          )}
                          <span style={{ fontWeight: 500 }}>{customer.name}</span>
                          {customer.is_demo && (
                            <span style={{
                              background: '#e5e7eb',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              color: '#666',
                            }}>
                              Demo
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {customer.slug}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {customer.password}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                        <span style={{
                          padding: '0.125rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          background: customer.customer_type === 'active' ? '#dcfce7' : customer.customer_type === 'churned' ? '#fee2e2' : '#f3e8ff',
                          color: customer.customer_type === 'active' ? '#166534' : customer.customer_type === 'churned' ? '#991b1b' : '#6b21a8',
                        }}>
                          {customer.customer_type || 'prospect'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', textTransform: 'uppercase' }}>
                        {customer.diagnostic_type || 'gtm'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <a
                          href={`https://clients.leanscale.team/c/${customer.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#7c3aed', fontSize: '0.875rem' }}
                        >
                          /c/{customer.slug}
                        </a>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => openEditModal(customer)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            marginRight: '0.5rem',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(customer)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '2rem',
          }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
              {editingCustomer ? 'Edit Customer' : 'Add Customer'}
            </h2>

            {error && (
              <div style={{
                background: '#fee',
                border: '1px solid #c00',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                color: '#c00',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    required
                    disabled={editingCustomer}
                    placeholder="company-name"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      background: editingCustomer ? '#f5f5f5' : 'white',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>
                    Password *
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>
                  Assigned Team (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.assigned_team}
                  onChange={(e) => setFormData({ ...formData, assigned_team: e.target.value })}
                  placeholder="izzy, brian, dave"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                  }}
                />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>
                  NDA Link
                </label>
                <input
                  type="url"
                  value={formData.nda_link}
                  onChange={(e) => setFormData({ ...formData, nda_link: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                  }}
                />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>
                  Intake Form Link
                </label>
                <input
                  type="url"
                  value={formData.intake_form_link}
                  onChange={(e) => setFormData({ ...formData, intake_form_link: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>
                    YouTube Video ID
                  </label>
                  <input
                    type="text"
                    value={formData.youtube_video_id}
                    onChange={(e) => setFormData({ ...formData, youtube_video_id: e.target.value })}
                    placeholder="M7oECb8xsy0"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                  <input
                    type="checkbox"
                    id="is_demo"
                    checked={formData.is_demo}
                    onChange={(e) => setFormData({ ...formData, is_demo: e.target.checked })}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <label htmlFor="is_demo" style={{ fontSize: '0.875rem' }}>
                    Mark as Demo Account
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>
                    Diagnostic Type
                  </label>
                  <select
                    value={formData.diagnostic_type}
                    onChange={(e) => setFormData({ ...formData, diagnostic_type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="gtm">GTM Diagnostic</option>
                    <option value="clay">Clay Diagnostic</option>
                    <option value="cpq">Q2C Diagnostic</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>
                    Customer Type
                  </label>
                  <select
                    value={formData.customer_type}
                    onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="prospect">Prospect</option>
                    <option value="active">Active Customer</option>
                    <option value="churned">Churned</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>
                  Google Slides Embed URL
                </label>
                <input
                  type="url"
                  value={formData.google_slides_embed_url}
                  onChange={(e) => setFormData({ ...formData, google_slides_embed_url: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.5rem 1rem',
                    background: saving ? '#ccc' : '#7c3aed',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: 500,
                  }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
