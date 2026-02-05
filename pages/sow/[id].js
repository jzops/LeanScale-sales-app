import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import SowPreview from '../../components/SowPreview';
import { useCustomer } from '../../context/CustomerContext';

const STATUS_OPTIONS = ['draft', 'generated', 'review', 'approved', 'sent', 'accepted', 'declined'];

const STATUS_COLORS = {
  draft: { bg: '#EDF2F7', color: '#4A5568' },
  generated: { bg: '#EBF8FF', color: '#2B6CB0' },
  review: { bg: '#FEFCBF', color: '#975A16' },
  approved: { bg: '#C6F6D5', color: '#276749' },
  sent: { bg: '#E9D8FD', color: '#553C9A' },
  accepted: { bg: '#C6F6D5', color: '#276749' },
  declined: { bg: '#FED7D7', color: '#9B2C2C' },
};

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.draft;
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.8rem',
      fontWeight: 600,
      background: colors.bg,
      color: colors.color,
    }}>
      {status}
    </span>
  );
}

export default function SowDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { customer } = useCustomer();

  const [sow, setSow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchSow() {
      try {
        const res = await fetch(`/api/sow/${id}`);
        if (!res.ok) {
          setError('Failed to load SOW.');
          setLoading(false);
          return;
        }
        const json = await res.json();
        setSow(json.data);
        setSelectedStatus(json.data?.status || 'draft');
      } catch (err) {
        console.error('Error fetching SOW:', err);
        setError('An error occurred while loading the SOW.');
      } finally {
        setLoading(false);
      }
    }

    fetchSow();
  }, [id]);

  async function handleStatusUpdate() {
    if (!selectedStatus || selectedStatus === sow.status) return;
    setStatusUpdating(true);

    try {
      const res = await fetch(`/api/sow/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus }),
      });

      if (res.ok) {
        const json = await res.json();
        setSow(json.data);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setStatusUpdating(false);
    }
  }

  return (
    <Layout title={sow ? sow.title : 'SOW Detail'}>
      <div className="container" style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/sow" style={{
            fontSize: '0.875rem',
            color: '#6C5CE7',
            textDecoration: 'none',
          }}>
            Back to Statements of Work
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#718096' }}>
            <p>Loading SOW...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: '#FFF5F5',
            border: '1px solid #FED7D7',
            borderRadius: '0.75rem',
            color: '#9B2C2C',
          }}>
            <p>Error: {error}</p>
          </div>
        )}

        {/* SOW Content */}
        {sow && !loading && !error && (
          <>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <h1 style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#1a1a2e',
                  marginBottom: '0.5rem',
                }}>
                  {sow.title}
                </h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <StatusBadge status={sow.status} />
                  <span style={{ fontSize: '0.8rem', color: '#718096' }}>
                    Type: {sow.sow_type}
                  </span>
                  {sow.created_by && (
                    <span style={{ fontSize: '0.8rem', color: '#718096' }}>
                      Created by: {sow.created_by}
                    </span>
                  )}
                  {sow.created_at && (
                    <span style={{ fontSize: '0.8rem', color: '#A0AEC0' }}>
                      {new Date(sow.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={() => setEditing(!editing)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: editing ? '#E2E8F0' : 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#4A5568',
                    cursor: 'pointer',
                  }}
                >
                  {editing ? 'Cancel Edit' : 'Edit'}
                </button>
              </div>
            </div>

            {/* Status Update */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              marginBottom: '2rem',
              padding: '1rem',
              background: '#F7FAFC',
              borderRadius: '0.5rem',
              border: '1px solid #E2E8F0',
            }}>
              <label htmlFor="status-select" style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#4A5568',
              }}>
                Status:
              </label>
              <select
                id="status-select"
                role="combobox"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  background: 'white',
                  color: '#4A5568',
                }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={statusUpdating || selectedStatus === sow.status}
                style={{
                  padding: '0.4rem 1rem',
                  background: '#6C5CE7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: statusUpdating ? 'wait' : 'pointer',
                  opacity: statusUpdating ? 0.7 : 1,
                }}
              >
                {statusUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>

            {/* SOW Content Preview */}
            <div style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '0.75rem',
              padding: '2rem',
            }}>
              <SowPreview content={sow.content} />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
