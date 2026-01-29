import Layout from '../../components/Layout';
import { useCustomer } from '../../context/CustomerContext';

export default function StartDiagnostic() {
  const { customer } = useCustomer();

  // Default NDA link if not configured for customer
  const ndaLink = customer.ndaLink || 'https://powerforms.docusign.net/0758efed-0a42-4275-b5d9-f26875d64ae6?env=na4&acct=9287b4d2-50a6-4309-b7e8-7f0b785470c0&accountId=9287b4d2-50a6-4309-b7e8-7f0b785470c0';
  const intakeFormLink = customer.intakeFormLink || 'https://forms.fillout.com/t/nqEbrHoL5Eus';

  return (
    <Layout title="Start Diagnostic">
      <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title" style={{ justifyContent: 'center' }}>
            <span>🚀</span> Start Diagnostic
          </h1>
        </div>

        {/* NDA Section */}
        <section className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Step 1: Sign NDA</h2>
          <p style={{ marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Before we begin the diagnostic process, please sign our mutual NDA to protect both parties.
          </p>

          {/* Embedded DocuSign PowerForm */}
          <div style={{
            width: '100%',
            minHeight: '600px',
            border: '1px solid #eee',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <iframe
              src={ndaLink}
              style={{
                width: '100%',
                height: '600px',
                border: 'none'
              }}
              title="Sign NDA via DocuSign"
            />
          </div>

          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
            Having trouble? <a href={ndaLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ls-purple)' }}>Open in new tab</a>
          </p>
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
              src={intakeFormLink}
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
