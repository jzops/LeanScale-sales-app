import Link from 'next/link';
import Layout from '../../components/Layout';
import { useCustomer } from '../../context/CustomerContext';

const diagnosticFeatures = [
  { icon: '⚙️', label: '63 Process Inspection Points', desc: 'Marketing, Sales, CS, Partnerships' },
  { icon: '📈', label: 'Power10 Metrics', desc: 'The 10 metrics that matter most' },
  { icon: '🔧', label: '17 Tool Categories', desc: 'GTM tech stack health assessment' },
];

export default function TryLeanScale() {
  const { customerPath } = useCustomer();
  return (
    <Layout title="Try LeanScale">
      <div className="container">
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title" style={{ justifyContent: 'center' }}>
            <span>🧪</span> Try LeanScale
          </h1>
          <p className="page-subtitle" style={{ maxWidth: 500, margin: '0.5rem auto 0' }}>
            Get clarity on your GTM engine with our diagnostic assessment
          </p>
        </div>

        {/* CTA Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <Link href={customerPath('/try-leanscale/start')} style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, var(--ls-lime-green) 0%, #d9f99d 100%)',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🚀</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Start Diagnostic
                </h2>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                Begin your GTM health assessment questionnaire
              </p>
            </div>
          </Link>

          <Link href={customerPath('/try-leanscale/diagnostic')} style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              padding: '2rem',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📊</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  View Demo Results
                </h2>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                See a sample diagnostic results dashboard
              </p>
            </div>
          </Link>
        </div>

        {/* Video */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span>📺</span> What is the GTM Diagnostic?
          </h3>
          <div className="video-container">
            <iframe
              src="https://fast.wistia.net/embed/iframe/38bjmcwsau"
              title="GTM VSL"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            What We Assess
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
            {diagnosticFeatures.map((feature) => (
              <div key={feature.label} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  fontSize: '1.5rem',
                }}>
                  {feature.icon}
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {feature.label}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}>
          {[
            { href: '/try-leanscale/power10', label: 'Power10 Metrics', icon: '📈' },
            { href: '/try-leanscale/gtm-tool-health', label: 'GTM Tool Health', icon: '🔧' },
            { href: '/try-leanscale/process-health', label: 'Process Health', icon: '⚙️' },
            { href: '/try-leanscale/engagement', label: 'Engagement Overview', icon: '📋' },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="quick-link" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem',
              background: 'var(--bg-white)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="cta-banner">
          <h3 className="cta-title">Ready to get started?</h3>
          <p className="cta-subtitle">
            Take the diagnostic to identify your highest-impact GTM improvements.
          </p>
          <div className="cta-buttons">
            <Link href={customerPath('/try-leanscale/start')} className="btn cta-btn-primary">
              Start Diagnostic
            </Link>
            <Link href={customerPath('/why-leanscale/services')} className="btn cta-btn-secondary">
              Browse Services
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
