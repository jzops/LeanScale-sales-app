import Layout from '../../components/Layout';
import IntakeForm from '../../components/IntakeForm';
import { clayIntakeConfig } from '../../data/intake-configs/clay-intake';
import { useCustomer } from '../../context/CustomerContext';

export default function ClayIntakePage() {
  const { customer } = useCustomer();
  const customerSlug = customer?.slug || 'demo';

  return (
    <Layout title="Clay Project Intake">
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
        padding: '3rem 0 2rem',
        textAlign: 'center',
      }}>
        <div className="container">
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Clay Project Intake
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: 500, margin: '0 auto' }}>
            Tell us about your Clay needs. We will review your responses and build a custom scope and timeline.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        <IntakeForm config={clayIntakeConfig} customerSlug={customerSlug} />
      </div>
    </Layout>
  );
}
