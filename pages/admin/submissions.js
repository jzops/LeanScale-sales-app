import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function AdminSubmissions() {
  const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSubmissions();
    }
  }, [isAuthenticated]);

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .select(`
          *,
          customers (name, slug)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error loading submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (filter === 'all') return true;
    return s.form_type === filter;
  });

  const getFormTypeBadge = (type) => {
    const colors = {
      getting_started: { bg: '#dbeafe', color: '#1e40af' },
      diagnostic_intake: { bg: '#dcfce7', color: '#166534' },
      contact: { bg: '#fef3c7', color: '#92400e' },
    };
    const labels = {
      getting_started: 'Getting Started',
      diagnostic_intake: 'Diagnostic Intake',
      contact: 'Contact',
    };
    const style = colors[type] || { bg: '#f3f4f6', color: '#374151' };
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
      }}>
        {labels[type] || type}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
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
        <title>Submissions | LeanScale Admin</title>
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
              background: '#7c3aed',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}>
              Submissions
            </Link>
          </nav>

          {/* Header with Filter */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Form Submissions</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: 'white',
              }}
            >
              <option value="all">All Types</option>
              <option value="getting_started">Getting Started</option>
              <option value="diagnostic_intake">Diagnostic Intake</option>
              <option value="contact">Contact</option>
            </select>
          </div>

          {/* Submissions Table */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500, fontSize: '0.875rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500, fontSize: '0.875rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500, fontSize: '0.875rem' }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500, fontSize: '0.875rem' }}>Preview</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500, fontSize: '0.875rem' }}>Notified</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 500, fontSize: '0.875rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                      Loading...
                    </td>
                  </tr>
                ) : filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                      No submissions found.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <tr key={submission.id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                        {formatDate(submission.submitted_at)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {submission.customers ? (
                          <span style={{ fontWeight: 500 }}>{submission.customers.name}</span>
                        ) : (
                          <span style={{ color: '#999' }}>Unknown</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {getFormTypeBadge(submission.form_type)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#666', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {submission.data?.email || submission.data?.name || submission.data?.company || JSON.stringify(submission.data).substring(0, 50) + '...'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {submission.slack_notified ? (
                          <span style={{ color: '#16a34a' }}>Yes</span>
                        ) : (
                          <span style={{ color: '#dc2626' }}>No</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          View Details
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

      {/* Detail Modal */}
      {selectedSubmission && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Submission Details
                </h2>
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  {formatDate(selectedSubmission.submitted_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {getFormTypeBadge(selectedSubmission.form_type)}
                {selectedSubmission.customers && (
                  <span style={{
                    background: '#f3f4f6',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}>
                    {selectedSubmission.customers.name}
                  </span>
                )}
              </div>
            </div>

            <div style={{
              background: '#f9fafb',
              borderRadius: '8px',
              padding: '1rem',
            }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
                Form Data
              </h3>
              <dl style={{ margin: 0 }}>
                {Object.entries(selectedSubmission.data || {}).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '0.75rem' }}>
                    <dt style={{
                      fontSize: '0.75rem',
                      color: '#666',
                      textTransform: 'uppercase',
                      marginBottom: '0.25rem',
                    }}>
                      {key.replace(/_/g, ' ')}
                    </dt>
                    <dd style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      wordBreak: 'break-word',
                    }}>
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedSubmission(null)}
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
