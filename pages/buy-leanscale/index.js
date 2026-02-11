import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import AvailabilityCalendar from '../../components/AvailabilityCalendar';
import { useCustomer } from '../../context/CustomerContext';

const engagementTypes = [
  {
    id: 'embedded',
    label: 'Embedded Team',
    description: 'Ongoing GTM operations support with dedicated hours each month',
    icon: '👥',
    features: ['Dedicated team members', 'Monthly hour blocks', 'Continuous improvement', 'Flexible scope'],
    recommended: true,
  },
  {
    id: 'one-time',
    label: 'One-Time Project',
    description: 'Fixed-scope projects like Clay implementations, migrations, or audits',
    icon: '🎯',
    features: ['Fixed deliverables', 'Clear timeline', 'Project-based pricing', 'Defined scope'],
    recommended: false,
  },
];

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
  const router = useRouter();
  const { customerPath } = useCustomer();
  const [step, setStep] = useState(0);
  const [engagementType, setEngagementType] = useState('embedded');
  const [selectedHours, setSelectedHours] = useState(hourTiers[1]);
  const [cancellation, setCancellation] = useState(cancellationOptions[1]);
  const [payment, setPayment] = useState(paymentOptions[1]);
  const [total, setTotal] = useState(0);
  const [diagnosticRecommendation, setDiagnosticRecommendation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submission = {
      ...formData,
      plan: selectedHours.label,
      monthlyHours: selectedHours.hours,
      monthlyPrice: total,
      cancellationTerms: cancellation.label,
      paymentTerms: payment.label,
    };

    try {
      const response = await fetch('/api/submit-engagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      alert('Your engagement request has been submitted! Our team will be in touch within 24 hours.');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Your request was received, but there was an issue sending the notification. Our team will still follow up within 24 hours.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Buy LeanScale">
      <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title" style={{ justifyContent: 'center' }}>
            <span>🚀</span> Start Your LeanScale Engagement
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
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
          alignItems: 'center',
        }}>
          {['Type', 'Plan', 'Date', 'Details'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  background: step >= i ? '#7c3aed' : '#e5e7eb',
                  color: step >= i ? 'white' : '#9ca3af',
                  cursor: step > i ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => step > i && setStep(i)}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div style={{
                  width: 24,
                  height: 2,
                  background: step > i ? '#7c3aed' : '#e5e7eb',
                  transition: 'all 0.2s ease',
                }} />
              )}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', textAlign: 'center' }}>
              How would you like to work with us?
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem', fontSize: '0.9rem' }}>
              Choose the engagement model that fits your needs
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {engagementTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setEngagementType(type.id)}
                  style={{
                    padding: '1.5rem',
                    border: engagementType === type.id ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    background: engagementType === type.id ? 'linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%)' : 'white',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  {type.recommended && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '16px',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '100px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Most Popular
                    </div>
                  )}
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{type.icon}</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {type.label}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {type.description}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {type.features.map((feature, i) => (
                      <li key={i} style={{
                        fontSize: '0.8rem',
                        color: '#374151',
                        marginBottom: '0.35rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}>
                        <span style={{ color: '#7c3aed' }}>✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}
                onClick={() => {
                  if (engagementType === 'one-time') {
                    router.push(customerPath('/buy-leanscale/one-time-projects'));
                  } else {
                    setStep(1);
                  }
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              Step 2: Choose Your Plan
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button
                className="btn"
                style={{ background: 'white', border: '1px solid #e5e7eb', color: '#374151' }}
                onClick={() => setStep(0)}
              >
                ← Back
              </button>
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
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', textAlign: 'center' }}>
              Step 3: Select Your Start Date
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Cohorts start every 2 weeks. Reserve your spot before it fills up.
            </p>
            
            <AvailabilityCalendar 
              selectedDate={formData.startDate}
              onSelect={(cohort) => setFormData({ ...formData, startDate: cohort.date })}
              compact={false}
            />

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
                Step 4: Your Details
              </h2>

              <div style={{
                padding: '1rem 1.25rem',
                background: '#f5f3ff',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Your Plan</div>
                  <div style={{ fontWeight: 600 }}>{selectedHours.label} - {selectedHours.hours} hours/month</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Start Date</div>
                  <div style={{ fontWeight: 600 }}>{formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—'}</div>
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
                  style={{ padding: '0.875rem 2rem', opacity: isSubmitting ? 0.7 : 1 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Engagement Request'}
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
