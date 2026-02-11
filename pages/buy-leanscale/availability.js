import Layout from '../../components/Layout';
import AvailabilityCalendar from '../../components/AvailabilityCalendar';
import Link from 'next/link';
import { useCustomer } from '../../context/CustomerContext';

export default function Availability() {
  const { customerPath } = useCustomer();
  return (
    <Layout title="Cohort Availability">
      <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title" style={{ justifyContent: 'center' }}>
            <span>📅</span> Cohort Availability
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            New cohorts start every 2 weeks. See real-time availability and reserve your spot.
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <AvailabilityCalendar compact={false} />
        </div>

        <div style={{ 
          marginTop: '2rem', 
          padding: '2rem', 
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          borderRadius: '16px',
          textAlign: 'center',
          color: 'white',
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Ready to get started?</h2>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
            Configure your engagement and secure your cohort spot today.
          </p>
          <Link href={customerPath('/buy-leanscale')} style={{ textDecoration: 'none' }}>
            <button className="btn" style={{ 
              background: 'white', 
              color: '#7c3aed', 
              fontWeight: 600,
              padding: '0.875rem 2rem',
            }}>
              Start Your Engagement →
            </button>
          </Link>
        </div>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          background: '#f9fafb',
          borderRadius: '12px',
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>How Cohorts Work</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🚀</div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Kickoff</div>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
                Meet your team and align on priorities within the first week.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚙️</div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Execution</div>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
                Your dedicated team works on GTM operations throughout the engagement.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Reviews</div>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
                Weekly syncs to review progress, adjust priorities, and plan ahead.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
