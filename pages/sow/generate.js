import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useCustomer } from '../../context/CustomerContext';

const SOW_TYPES = [
  {
    value: 'clay',
    label: 'Clay',
    description: 'Clay implementation, automation, and data enrichment projects.',
  },
  {
    value: 'q2c',
    label: 'Quote-to-Cash',
    description: 'CPQ, billing, and quote-to-cash process optimization.',
  },
  {
    value: 'embedded',
    label: 'Embedded',
    description: 'Embedded GTM operations team for ongoing support.',
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Custom engagement tailored to your specific needs.',
  },
];

const TOTAL_STEPS = 4;

export default function SowGenerate() {
  const router = useRouter();
  const { customer, customerPath } = useCustomer();

  const [step, setStep] = useState(1);
  const [sowType, setSowType] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  const [diagnosticSnapshotId, setDiagnosticSnapshotId] = useState('');
  const [intakeSubmissionId, setIntakeSubmissionId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  function nextStep() {
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  function prevStep() {
    if (step > 1) setStep(step - 1);
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/sow/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sowType,
          customerId: customer?.id || null,
          transcriptText: transcriptText || null,
          intakeSubmissionId: intakeSubmissionId || null,
          diagnosticSnapshot: diagnosticSnapshotId || null,
          createdBy: null,
        }),
      });

      if (!res.ok) {
        setError('Generation failed. Please try again.');
        setGenerating(false);
        return;
      }

      const json = await res.json();
      if (json.success && json.data?.id) {
        router.push(customerPath(`/sow/${json.data.id}`));
      } else {
        setError('Generation failed. Please try again.');
        setGenerating(false);
      }
    } catch (err) {
      console.error('Error generating SOW:', err);
      setError('Generation failed. Please try again.');
      setGenerating(false);
    }
  }

  return (
    <Layout title="Generate SOW">
      {/* Gradient Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
        padding: '3rem 0 2rem',
        textAlign: 'center',
      }}>
        <div className="container">
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Generate Statement of Work
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: 500, margin: '0 auto' }}>
            Follow the steps below to generate a new SOW for your engagement.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Step Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '2rem',
        }}>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 600,
                background: s === step ? '#6C5CE7' : s < step ? '#A8E6CF' : '#E2E8F0',
                color: s === step ? 'white' : s < step ? '#276749' : '#A0AEC0',
              }}>
                {s}
              </div>
              {s < TOTAL_STEPS && (
                <div style={{
                  width: 40,
                  height: 2,
                  background: s < step ? '#A8E6CF' : '#E2E8F0',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginBottom: '1.5rem',
        }}>
          {/* Step 1: Select Type */}
          {step === 1 && (
            <div>
              <h2 style={stepHeadingStyle}>
                Step 1: Select SOW Type
              </h2>
              <p style={stepDescStyle}>
                Choose the type of engagement for this statement of work.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {SOW_TYPES.map((type) => (
                  <label
                    key={type.value}
                    htmlFor={`sow-type-${type.value}`}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '1rem',
                      border: sowType === type.value
                        ? '2px solid #6C5CE7'
                        : '1px solid #E2E8F0',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      background: sowType === type.value ? '#F5F3FF' : 'white',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <input
                      type="radio"
                      id={`sow-type-${type.value}`}
                      name="sowType"
                      value={type.value}
                      checked={sowType === type.value}
                      onChange={(e) => setSowType(e.target.value)}
                      style={{ marginTop: '0.2rem' }}
                    />
                    <div>
                      <div style={{
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: '#1a1a2e',
                        marginBottom: '0.25rem',
                      }}>
                        {type.label}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#718096',
                        lineHeight: 1.5,
                      }}>
                        {type.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Transcript */}
          {step === 2 && (
            <div>
              <h2 style={stepHeadingStyle}>
                Step 2: Call Transcript
              </h2>
              <p style={stepDescStyle}>
                Paste your sales call transcript below. This helps generate a more accurate SOW.
              </p>
              <textarea
                role="textbox"
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="Paste your call transcript here..."
                style={{
                  width: '100%',
                  minHeight: 200,
                  padding: '0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  resize: 'vertical',
                  color: '#4A5568',
                }}
              />
            </div>
          )}

          {/* Step 3: Optional Attachments */}
          {step === 3 && (
            <div>
              <h2 style={stepHeadingStyle}>
                Step 3: Optional Attachments
              </h2>
              <p style={stepDescStyle}>
                Optionally attach a diagnostic snapshot or intake submission to enrich the SOW.
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={fieldLabelStyle}>
                  Diagnostic Snapshot ID
                </label>
                <input
                  type="text"
                  value={diagnosticSnapshotId}
                  onChange={(e) => setDiagnosticSnapshotId(e.target.value)}
                  placeholder="Optional diagnostic snapshot ID"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={fieldLabelStyle}>
                  Intake Submission ID
                </label>
                <input
                  type="text"
                  value={intakeSubmissionId}
                  onChange={(e) => setIntakeSubmissionId(e.target.value)}
                  placeholder="Optional intake submission ID"
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div>
              <h2 style={stepHeadingStyle}>
                Step 4: Review and Generate
              </h2>
              <p style={stepDescStyle}>
                Review your selections and click Generate to create the SOW.
              </p>

              <div style={{
                background: '#F7FAFC',
                borderRadius: '0.5rem',
                padding: '1.25rem',
                border: '1px solid #E2E8F0',
                marginBottom: '1rem',
              }}>
                <div style={reviewRowStyle}>
                  <span style={reviewLabelStyle}>SOW Type:</span>
                  <span style={reviewValueStyle}>{sowType || '-'}</span>
                </div>
                <div style={reviewRowStyle}>
                  <span style={reviewLabelStyle}>Transcript:</span>
                  <span style={reviewValueStyle}>
                    {transcriptText ? `${transcriptText.substring(0, 80)}...` : 'None provided'}
                  </span>
                </div>
                <div style={reviewRowStyle}>
                  <span style={reviewLabelStyle}>Diagnostic Snapshot:</span>
                  <span style={reviewValueStyle}>{diagnosticSnapshotId || 'None'}</span>
                </div>
                <div style={reviewRowStyle}>
                  <span style={reviewLabelStyle}>Intake Submission:</span>
                  <span style={reviewValueStyle}>{intakeSubmissionId || 'None'}</span>
                </div>
              </div>

              {error && (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: '#FFF5F5',
                  border: '1px solid #FED7D7',
                  borderRadius: '0.375rem',
                  color: '#9B2C2C',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                }}>
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            {step > 1 && !generating && (
              <button onClick={prevStep} style={secondaryBtnStyle}>
                Back
              </button>
            )}
          </div>

          <div>
            {step < TOTAL_STEPS && (
              <button
                onClick={nextStep}
                disabled={step === 1 && !sowType}
                style={{
                  ...primaryBtnStyle,
                  opacity: step === 1 && !sowType ? 0.5 : 1,
                  cursor: step === 1 && !sowType ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            )}

            {step === TOTAL_STEPS && (
              <button
                onClick={handleGenerate}
                disabled={generating}
                style={{
                  ...primaryBtnStyle,
                  opacity: generating ? 0.7 : 1,
                  cursor: generating ? 'wait' : 'pointer',
                }}
              >
                {generating ? 'Generating...' : 'Generate'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// -- Shared styles --

const stepHeadingStyle = {
  fontSize: '1.25rem',
  fontWeight: 600,
  color: '#1a1a2e',
  marginBottom: '0.5rem',
};

const stepDescStyle = {
  fontSize: '0.875rem',
  color: '#718096',
  marginBottom: '1.25rem',
  lineHeight: 1.6,
};

const fieldLabelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#4A5568',
  marginBottom: '0.375rem',
};

const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  border: '1px solid #E2E8F0',
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  color: '#4A5568',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const reviewRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0.5rem 0',
  borderBottom: '1px solid #E2E8F0',
};

const reviewLabelStyle = {
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#4A5568',
};

const reviewValueStyle = {
  fontSize: '0.875rem',
  color: '#718096',
  maxWidth: '60%',
  textAlign: 'right',
};

const primaryBtnStyle = {
  padding: '0.6rem 1.5rem',
  background: '#6C5CE7',
  color: 'white',
  border: 'none',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryBtnStyle = {
  padding: '0.6rem 1.5rem',
  background: 'white',
  color: '#4A5568',
  border: '1px solid #E2E8F0',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
};
