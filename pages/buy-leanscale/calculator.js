import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useCustomer } from '../../context/CustomerContext';

const hourTiers = [
  { hours: 50, price: 15000 },
  { hours: 100, price: 25000 },
  { hours: 225, price: 50000 },
];

const cancellationOptions = [
  { id: 'monthly', label: 'Month-to-Month', modifier: 0.07 },
  { id: 'quarterly', label: 'Quarterly (Default)', modifier: 0 },
  { id: 'annual', label: 'Annual', modifier: -0.07 },
];

const paymentOptions = [
  { id: 'monthly', label: 'Monthly', modifier: 0.07 },
  { id: 'quarterly', label: 'Quarterly (Default)', modifier: 0 },
  { id: 'annually', label: 'Annually', modifier: -0.07 },
];

export default function EngagementCalculator() {
  const { customerPath } = useCustomer();
  const [selectedHours, setSelectedHours] = useState(hourTiers[0]);
  const [cancellation, setCancellation] = useState(cancellationOptions[1]);
  const [payment, setPayment] = useState(paymentOptions[1]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const basePrice = selectedHours.price;
    const cancellationAdjustment = basePrice * cancellation.modifier;
    const paymentAdjustment = basePrice * payment.modifier;
    setTotal(basePrice + cancellationAdjustment + paymentAdjustment);
  }, [selectedHours, cancellation, payment]);

  return (
    <Layout title="Engagement Calculator">
      <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title" style={{ justifyContent: 'center' }}>
            <span>🧮</span> Engagement Calculator
          </h1>
        </div>

        {/* Monthly Hours */}
        <div className="calculator-section">
          <h3 className="calculator-title">Monthly Hours</h3>
          <div className="calculator-options">
            {hourTiers.map((tier) => (
              <div
                key={tier.hours}
                className={`calculator-option ${selectedHours.hours === tier.hours ? 'selected' : ''}`}
                onClick={() => setSelectedHours(tier)}
              >
                <div className="calculator-option-value">{tier.hours}</div>
                <div className="calculator-option-label">Monthly Price</div>
                <div className="calculator-option-price">
                  ${tier.price.toLocaleString()}.00
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedHours.hours === tier.hours}
                    onChange={() => setSelectedHours(tier)}
                  />
                  <label style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>Select</label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cancellation & Payment Terms */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Cancellation Notice */}
          <div className="calculator-section">
            <h3 className="calculator-title">Cancellation Notice</h3>
            {cancellationOptions.map((option) => (
              <div
                key={option.id}
                style={{
                  padding: '1rem',
                  border: '1px solid var(--ls-light-gray)',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  background: cancellation.id === option.id ? '#f5f3ff' : 'white',
                  cursor: 'pointer',
                }}
                onClick={() => setCancellation(option)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{option.label}</div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      {option.modifier > 0 ? '+' : ''}{(option.modifier * 100).toFixed(0)}%
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={cancellation.id === option.id}
                    onChange={() => setCancellation(option)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Payment Terms */}
          <div className="calculator-section">
            <h3 className="calculator-title">Payment Terms</h3>
            {paymentOptions.map((option) => (
              <div
                key={option.id}
                style={{
                  padding: '1rem',
                  border: '1px solid var(--ls-light-gray)',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  background: payment.id === option.id ? '#f5f3ff' : 'white',
                  cursor: 'pointer',
                }}
                onClick={() => setPayment(option)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{option.label}</div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      {option.modifier > 0 ? '+' : ''}{(option.modifier * 100).toFixed(0)}%
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={payment.id === option.id}
                    onChange={() => setPayment(option)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="calculator-total">
          <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>Monthly Total</div>
          <div style={{ fontSize: '2.5rem', color: 'var(--ls-purple)' }}>
            ${total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '1rem', color: '#666', marginTop: '0.5rem' }}>
            Monthly Hours: {selectedHours.hours}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href={customerPath('/buy-leanscale/start')}>
            <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
              Continue to Getting Started →
            </button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
