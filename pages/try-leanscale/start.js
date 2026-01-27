import { useState } from 'react';
import Layout from '../../components/Layout';
import customerConfig from '../../data/customer-config';

export default function StartDiagnostic() {
  const [ndaSigned, setNdaSigned] = useState(false);

  return (
    <Layout title="Start Diagnostic">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <span>🚀</span> Start Diagnostic
          </h1>
        </div>

        {/* NDA Section */}
        <section className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Step 1: Sign NDA</h2>
          <p style={{ marginBottom: '1rem', lineHeight: 1.7 }}>
            Before we begin the diagnostic process, please sign our mutual NDA to protect both parties.
          </p>
          <a
            href={customerConfig.ndaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            onClick={() => setNdaSigned(true)}
          >
            Sign NDA via DocuSign
          </a>
          {ndaSigned && (
            <span style={{ marginLeft: '1rem', color: 'var(--status-healthy)' }}>
              ✓ NDA link opened
            </span>
          )}
        </section>

        {/* Intake Form */}
        <section className="card">
          <h2 style={{ marginBottom: '1rem' }}>Step 2: GTM Diagnostic Intake</h2>
          <p style={{ marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Help us prepare for your diagnostic by sharing information about your current GTM tech stack.
            This covers your CRM, marketing automation, sales engagement, revenue intelligence, and more.
          </p>

          {/* Embedded Fillout Form */}
          <div style={{ 
            width: '100%', 
            minHeight: '800px',
            border: '1px solid #eee',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <iframe
              src="https://forms.fillout.com/t/nqEbrHoL5Eus"
              style={{
                width: '100%',
                height: '800px',
                border: 'none'
              }}
              title="GTM Diagnostic Intake Form"
            />
          </div>
        </section>
      </div>
    </Layout>
  );
}
