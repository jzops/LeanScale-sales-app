import Link from 'next/link';
import Layout from '../components/Layout';
import { useCustomer } from '../context/CustomerContext';

// Diagnostic type → dashboard card config
const diagnosticConfig = {
  gtm: { href: '/try-leanscale/diagnostic', label: 'GTM Diagnostic', description: 'Full GTM operations assessment' },
  clay: { href: '/try-leanscale/clay-diagnostic', label: 'Clay Diagnostic', description: 'Clay implementation health check' },
  cpq: { href: '/try-leanscale/cpq-diagnostic', label: 'Q2C Diagnostic', description: 'Quote-to-cash process review' },
};

// Diagnostic type → intake form config
const intakeConfig = {
  gtm: { href: '/try-leanscale/start', label: 'Diagnostic Intake', description: 'Start your GTM diagnostic' },
  clay: { href: '/buy-leanscale/clay-intake', label: 'Clay Project Intake', description: 'Start a new Clay project' },
  cpq: { href: '/buy-leanscale/q2c-intake', label: 'Q2C Assessment', description: 'Quote-to-cash assessment intake' },
};

export default function Dashboard() {
  const { customer, displayName, customerType, isDemo, customerPath } = useCustomer();
  const isActive = customerType === 'active';
  const diagnosticType = customer.diagnosticType || 'gtm';
  const diagCard = diagnosticConfig[diagnosticType] || diagnosticConfig.gtm;
  const intakeCard = intakeConfig[diagnosticType] || intakeConfig.gtm;

  return (
    <Layout title="Dashboard">
      <div className="container" style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}>
            {isActive && displayName
              ? `Welcome back, ${displayName}`
              : 'Dashboard'}
          </h1>
          {!isActive && (
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              lineHeight: 1.6,
            }}>
              The customer dashboard is available for active customers.
              <Link href={customerPath('/buy-leanscale')} style={{
                color: 'var(--ls-purple)',
                marginLeft: '0.5rem',
                textDecoration: 'underline',
              }}>
                Get started with LeanScale
              </Link>
            </p>
          )}
        </div>

        {isActive && (
          <>
            {/* Diagnostic Section — shows only the customer's configured type */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--ls-purple)',
              }}>
                Your Diagnostic
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
              }}>
                <Link href={customerPath(diagCard.href)} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--bg-white)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                  }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--ls-purple)',
                      marginBottom: '0.375rem',
                    }}>
                      {diagCard.label}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: 1.5,
                    }}>
                      {diagCard.description}
                    </p>
                  </div>
                </Link>
                <Link href={customerPath('/try-leanscale/engagement')} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--bg-white)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                  }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--ls-purple)',
                      marginBottom: '0.375rem',
                    }}>
                      Engagement Overview
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: 1.5,
                    }}>
                      View your engagement plan and timeline
                    </p>
                  </div>
                </Link>
              </div>
            </section>

            {/* Projects Section — intake form + SOWs */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--ls-purple)',
              }}>
                Projects
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
              }}>
                <Link href={customerPath(intakeCard.href)} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--bg-white)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                  }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--ls-purple)',
                      marginBottom: '0.375rem',
                    }}>
                      {intakeCard.label}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: 1.5,
                    }}>
                      {intakeCard.description}
                    </p>
                  </div>
                </Link>
                <Link href={customerPath('/sow')} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--bg-white)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                  }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--ls-purple)',
                      marginBottom: '0.375rem',
                    }}>
                      Statements of Work
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: 1.5,
                    }}>
                      View and manage SOWs
                    </p>
                  </div>
                </Link>
              </div>
            </section>

            {/* Recent Activity */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--ls-purple)',
              }}>
                Recent Activity
              </h2>
              <div style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.75rem',
                padding: '2rem',
                textAlign: 'center',
              }}>
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                  margin: 0,
                }}>
                  No recent activity
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
