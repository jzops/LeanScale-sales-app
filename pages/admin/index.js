import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    customers: 0,
    submissions: 0,
    availableDates: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      // Get counts
      const [customersRes, submissionsRes, datesRes] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('form_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('availability_dates').select('id', { count: 'exact', head: true }).gte('date', new Date().toISOString().split('T')[0]),
      ]);

      setStats({
        customers: customersRes.count || 0,
        submissions: submissionsRes.count || 0,
        availableDates: datesRes.count || 0,
      });

      // Get recent submissions
      const { data: submissions } = await supabase
        .from('form_submissions')
        .select(`
          id,
          form_type,
          data,
          submitted_at,
          customers (name, slug)
        `)
        .order('submitted_at', { ascending: false })
        .limit(5);

      setRecentSubmissions(submissions || []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
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
        <title>Admin Dashboard | LeanScale</title>
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
              background: '#7c3aed',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
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

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#7c3aed' }}>
                {loading ? '...' : stats.customers}
              </div>
              <div style={{ color: '#666', fontSize: '0.875rem' }}>Customers</div>
            </div>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                {loading ? '...' : stats.submissions}
              </div>
              <div style={{ color: '#666', fontSize: '0.875rem' }}>Form Submissions</div>
            </div>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
                {loading ? '...' : stats.availableDates}
              </div>
              <div style={{ color: '#666', fontSize: '0.875rem' }}>Upcoming Dates</div>
            </div>
          </div>

          {/* Recent Submissions */}
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
              Recent Submissions
            </h2>
            {loading ? (
              <p style={{ color: '#666' }}>Loading...</p>
            ) : recentSubmissions.length === 0 ? (
              <p style={{ color: '#666' }}>No submissions yet</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Customer</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        {sub.customers?.name || 'Unknown'}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          background: '#f3f4f6',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                        }}>
                          {sub.form_type}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        {sub.data?.yourName || sub.data?.name || '-'}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ marginTop: '1rem' }}>
              <Link href="/admin/submissions" style={{ color: '#7c3aed', fontSize: '0.875rem' }}>
                View all submissions →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
