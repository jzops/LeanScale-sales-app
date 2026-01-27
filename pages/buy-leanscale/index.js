import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import customerConfig from '../../data/customer-config';

const hourTiers = [
  { hours: 50, price: 15000, label: 'Starter', description: 'Best for early-stage startups' },
  { hours: 100, price: 25000, label: 'Growth', description: 'Most popular for scaling teams' },
  { hours: 225, price: 50000, label: 'Scale', description: 'Full GTM operations support' },
];

const cancellationOptions = [
  { id: 'monthly', label: 'Month-to-Month', modifier: 0.07, days: 30 },
  { id: 'quarterly', label: 'Quarterly', modifier: 0, days: 90, default: true },
  { id: 'annual', label: 'Annual', modifier: -0.07, days: 365 },
];

const paymentOptions = [
  { id: 'monthly', label: 'Monthly', modifier: 0.07 },
  { id: 'quarterly', label: 'Quarterly', modifier: 0, default: true },
  { id: 'annually', label: 'Annually', modifier: -0.07 },
];

export default function BuyLeanScale() {
  const [step, setStep] = useState(1);
  const [selectedHours, setSelectedHours] = useState(hourTiers[1]);
  const [cancellation, setCancellation] = useState(cancellationOptions[1]);
  const [payment, setPayment] = useState(paymentOptions[1]);
  const [total, setTotal] = useState(0);
  const [diagnosticRecommendation, setDiagnosticRecommendation] = useState(null);
  
  const [formData, setFormData] = useState({
    yourName: '',
    companyName: '',
    billingEmail: '',
    signerName: '',
    signerTitle: '',
    signerEmail: '',
    startDate: '',
  });

  useEffect(() => {
    const storedResults = typeof window !== 'undefined' ? localStorage.getItem('diagnosticResults') : null;
    if (storedResults) {
      try {
        const results = JSON.parse(storedResults);
        if (results.score) {
          if (results.score <= 40) {
            setDiagnosticRecommendation({ tier: hourTiers[2], reason: 'Based on your diagnostic, you need comprehensive GTM support' });
          } else if (results.score <= 70) {
            setDiagnosticRecommendation({ tier: hourTiers[1], reason: 'Based on your diagnostic, you need focused GTM improvements' });
          } else {
            setDiagnosticRecommendation({ tier: hourTiers[0], reason: 'Based on your diagnostic, you need targeted optimization' });
          }
        }
      } catch (e) {
        console.log('No diagnostic results found');
      }
    }
  }, []);

  useEffect(() => {
    const basePrice = selectedHours.price;
    const cancellationAdjustment = basePrice * cancellation.modifier;
    const paymentAdjustment = basePrice * payment.modifier;
    setTotal(basePrice + cancellationAdjustment + paymentAdjustment);
  }, [selectedHours, cancellation, payment]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submission = {
      ...formData,
      plan: selectedHours.label,
      monthlyHours: selectedHours.hours,
      monthlyPrice: total,
      cancellationTerms: cancellation.label,
      paymentTerms: payment.label,
    };
    console.log('Engagement submitted:', submission);
    alert('Your engagement request has been submitted! Our team will be in touch within 24 hours.');
  };

  return (
    <Layout title="Buy LeanScale">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="page-header">
          <h1 className="page-title">
            <span>🚀</span> Start Your LeanScale Engagement
          </h1>
          <p style={{ color: '#666', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Configure your GTM operations engagement and get started in minutes.
          </p>
        </div>

        {diagnosticRecommendation && (
          <div className="card" style={{ 
            marginBottom: '2rem', 
            padding: '1rem 1.5rem',
            background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
            border: '1px solid #c4b5fd',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>💡</span>
              <div>
                <div style={{ fontWeight: 600, color: '#7c3aed' }}>Recommended: {diagnosticRecommendation.tier.label} Plan</div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{diagnosticRecommendation.reason}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '2rem',
          justifyContent: 'center',
        }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                background: step >= s ? '#7c3aed' : '#e5e7eb',
                color: step >= s ? 'white' : '#9ca3af',
                cursor: step > s ? 'pointer' : 'default',
              }}
              onClick={() => step > s && setStep(s)}
            >
              {s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              Step 1: Choose Your Plan
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {hourTiers.map((tier) => (
                <div
                  key={tier.hours}
                  onClick={() => setSelectedHours(tier)}
                  style={{
                    padding: '1.5rem',
                    border: selectedHours.hours === tier.hours ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: selectedHours.hours === tier.hours ? '#f5f3ff' : 'white',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', color: '#7c3aed', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {tier.label}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {tier.hours}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                    hours/month
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#374151' }}>
                    ${tier.price.toLocaleString()}/mo
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                    {tier.description}
                  </div>
                  {diagnosticRecommendation?.tier.hours === tier.hours && (
                    <div style={{ 
                      marginTop: '0.75rem', 
                      padding: '0.25rem 0.5rem', 
                      background: '#7c3aed', 
                      color: 'white', 
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      Recommended
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Cancellation Terms</h3>
                {cancellationOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setCancellation(option)}
                    style={{
                      padding: '0.75rem 1rem',
                      border: cancellation.id === option.id ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      background: cancellation.id === option.id ? '#f5f3ff' : 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{option.label}</span>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: option.modifier > 0 ? '#ef4444' : option.modifier < 0 ? '#10b981' : '#6b7280',
                      fontWeight: 600,
                    }}>
                      {option.modifier > 0 ? '+' : ''}{(option.modifier * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Payment Terms</h3>
                {paymentOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setPayment(option)}
                    style={{
                      padding: '0.75rem 1rem',
                      border: payment.id === option.id ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      background: payment.id === option.id ? '#f5f3ff' : 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{option.label}</span>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: option.modifier > 0 ? '#ef4444' : option.modifier < 0 ? '#10b981' : '#6b7280',
                      fontWeight: 600,
                    }}>
                      {option.modifier > 0 ? '+' : ''}{(option.modifier * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ 
              marginTop: '2rem', 
              padding: '1.5rem', 
              background: '#f9fafb', 
              borderRadius: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.25rem' }}>Your Monthly Investment</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#7c3aed' }}>
                ${total.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                {selectedHours.hours} hours/month
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}
                onClick={() => setStep(2)}
              >
                Continue to Start Date →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              Step 2: Select Your Start Date
            </h2>
            
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {customerConfig.startDates.map((dateOption) => (
                  <div
                    key={dateOption.date}
                    onClick={() => dateOption.status !== 'waitlist' && setFormData({ ...formData, startDate: dateOption.date })}
                    style={{
                      padding: '1rem 1.25rem',
                      border: formData.startDate === dateOption.date ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: dateOption.status === 'waitlist' ? 'not-allowed' : 'pointer',
                      background: formData.startDate === dateOption.date ? '#f5f3ff' : 'white',
                      opacity: dateOption.status === 'waitlist' ? 0.6 : 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {new Date(dateOption.date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: dateOption.status === 'waitlist' ? '#fef3c7' : '#d1fae5',
                      color: dateOption.status === 'waitlist' ? '#92400e' : '#065f46',
                    }}>
                      {dateOption.status === 'waitlist' ? 'Waitlist' : `${dateOption.spotsLeft} Spots Left`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button 
                className="btn" 
                style={{ background: 'white', border: '1px solid #e5e7eb', color: '#374151' }}
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button 
                className="btn btn-primary" 
                style={{ padding: '0.875rem 2rem' }}
                onClick={() => setStep(3)}
                disabled={!formData.startDate}
              >
                Continue to Details →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                Step 3: Your Details
              </h2>

              <div style={{ 
                padding: '1rem 1.25rem', 
                background: '#f5f3ff', 
                borderRadius: '8px', 
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Your Plan</div>
                  <div style={{ fontWeight: 600 }}>{selectedHours.label} - {selectedHours.hours} hours/month</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Monthly Investment</div>
                  <div style={{ fontWeight: 700, color: '#7c3aed', fontSize: '1.25rem' }}>${total.toLocaleString()}</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Your Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    name="yourName"
                    className="form-input"
                    value={formData.yourName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    name="companyName"
                    className="form-input"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Billing Email <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="email"
                    name="billingEmail"
                    className="form-input"
                    value={formData.billingEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Signer Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    name="signerName"
                    className="form-input"
                    value={formData.signerName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Signer Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    name="signerTitle"
                    className="form-input"
                    value={formData.signerTitle}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Signer Email <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="email"
                    name="signerEmail"
                    className="form-input"
                    value={formData.signerEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                <button 
                  type="button"
                  className="btn" 
                  style={{ background: 'white', border: '1px solid #e5e7eb', color: '#374151' }}
                  onClick={() => setStep(2)}
                >
                  ← Back
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary" 
                  style={{ padding: '0.875rem 2rem' }}
                >
                  Submit Engagement Request
                </button>
              </div>
            </div>
          </form>
        )}

        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          background: '#f9fafb', 
          borderRadius: '12px',
        }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>Learn More</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {[
              { href: '/buy-leanscale/investor-perks', label: 'Investor Perks' },
              { href: '/buy-leanscale/security', label: 'Security' },
              { href: '/buy-leanscale/team', label: 'Your Team' },
              { href: '/buy-leanscale/clay', label: 'Clay x LeanScale' },
              { href: '/try-leanscale', label: 'Take Diagnostic' },
            ].map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#374151',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
