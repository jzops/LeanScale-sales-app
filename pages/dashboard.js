import Link from 'next/link';
import Layout from '../components/Layout';
import { useCustomer } from '../context/CustomerContext';

const diagnosticLinks = [
  { href: '/try-leanscale/diagnostic', label: 'GTM Diagnostic', description: 'Full GTM operations assessment' },
  { href: '/try-leanscale/clay-diagnostic', label: 'Clay Diagnostic', description: 'Clay implementation health check' },
  { href: '/try-leanscale/cpq-diagnostic', label: 'Q2C Diagnostic', description: 'Quote-to-cash process review' },
];

const projectLinks = [
  { href: '/buy-leanscale/clay-intake', label: 'Clay Project Intake', description: 'Start a new Clay project' },
  { href: '/buy-leanscale/q2c-intake', label: 'Q2C Assessment', description: 'Quote-to-cash assessment intake' },
];

const documentLinks = [
  { href: '/sow', label: 'Statements of Work', description: 'View and manage SOWs' },
];

export default function Dashboard() {
  const { customer, displayName, customerType, isDemo } = useCustomer();
  const isActive = customerType === 'active';

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
              <Link href="/buy-leanscale" style={{
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
            {/* Diagnostics Section */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--ls-purple)',
              }}>
                Diagnostics
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
              }}>
                {diagnosticLinks.map((item) => (
                  <Link href={item.href} key={item.href} style={{ textDecoration: 'none' }}>
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
                        {item.label}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        lineHeight: 1.5,
                      }}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Projects Section */}
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
                {projectLinks.map((item) => (
                  <Link href={item.href} key={item.href} style={{ textDecoration: 'none' }}>
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
                        {item.label}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        lineHeight: 1.5,
                      }}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Documents Section */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--ls-purple)',
              }}>
                Documents
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
              }}>
                {documentLinks.map((item) => (
                  <Link href={item.href} key={item.href} style={{ textDecoration: 'none' }}>
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
                        {item.label}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        lineHeight: 1.5,
                      }}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                ))}
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
