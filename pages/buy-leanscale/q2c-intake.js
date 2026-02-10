import Layout from '../../components/Layout';
import IntakeForm from '../../components/IntakeForm';
import { q2cIntakeConfig } from '../../data/intake-configs/q2c-intake';
import { useCustomer } from '../../context/CustomerContext';

export default function Q2CIntakePage() {
  const { customer } = useCustomer();
  const customerSlug = customer?.slug || 'demo';

  return (
    <Layout title="Quote-to-Cash Project Intake">
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
        padding: '3rem 0 2rem',
        textAlign: 'center',
      }}>
        <div className="container">
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Quote-to-Cash Project Intake
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: 500, margin: '0 auto' }}>
            Help us understand your current quote-to-cash process so we can identify gaps and build the right solution.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        <IntakeForm config={q2cIntakeConfig} customerSlug={customerSlug} />
      </div>
    </Layout>
  );
}
