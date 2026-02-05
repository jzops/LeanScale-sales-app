import { useState, useMemo } from 'react';

/**
 * IntakeForm - Reusable multi-step intake form component
 *
 * Takes a config object that defines:
 *   - projectSelection: multi-select options with followUpSections
 *   - sections: conditional question groups keyed by section ID
 *
 * Props:
 *   - config: intake config object (required)
 *   - customerSlug: string customer identifier (optional)
 */
export default function IntakeForm({ config, customerSlug }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const totalSteps = 3;

  // Compute which sections to show based on selected projects
  const activeSections = useMemo(() => {
    const sectionSet = new Set();
    selectedProjects.forEach((projectId) => {
      const project = config.projectSelection.options.find((o) => o.id === projectId);
      if (project) {
        project.followUpSections.forEach((s) => sectionSet.add(s));
      }
    });
    // Maintain order based on config.sections keys
    return Object.keys(config.sections).filter((key) => sectionSet.has(key));
  }, [selectedProjects, config]);

  // Toggle project selection
  function toggleProject(projectId) {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  }

  // Update an answer value
  function setAnswer(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  // Toggle a value in a multi-select answer
  function toggleMultiSelectAnswer(questionId, value) {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [questionId]: next };
    });
  }

  // Navigate steps
  function goNext() {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  }

  function goBack() {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  }

  // Submit the form
  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      configId: config.id,
      customerSlug: customerSlug || 'unknown',
      data: {
        selectedProjects,
        ...answers,
      },
    };

    try {
      const res = await fetch('/api/intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Submission failed');
      }

      const result = await res.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        setSubmitError(result.error || 'Submission failed. Please try again.');
      }
    } catch (err) {
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ============================================
  // SUCCESS STATE
  // ============================================
  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>&#10003;</div>
            <h2 style={{ color: 'var(--ls-purple)', marginBottom: '0.5rem' }}>
              Thank You!
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Your intake form has been submitted successfully. Our team will review your responses and be in touch shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {config.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
          {config.description}
        </p>
      </div>

      {/* Step Indicator */}
      <div style={styles.stepIndicator}>
        {[1, 2, 3].map((step) => (
          <div key={step} style={styles.stepRow}>
            <div
              style={{
                ...styles.stepCircle,
                background: currentStep >= step ? 'var(--ls-purple)' : 'var(--gray-200)',
                color: currentStep >= step ? 'white' : 'var(--gray-500)',
              }}
            >
              {step}
            </div>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: currentStep === step ? 600 : 400,
                color: currentStep === step ? 'var(--ls-purple)' : 'var(--text-secondary)',
              }}
            >
              {step === 1 ? 'Select Projects' : step === 2 ? 'Details' : 'Review'}
            </span>
            {step < 3 && (
              <div
                style={{
                  width: 40,
                  height: 2,
                  background: currentStep > step ? 'var(--ls-purple)' : 'var(--gray-200)',
                  margin: '0 0.5rem',
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem' }}>
        Step {currentStep} of {totalSteps}
      </div>

      {/* Step Content */}
      <div style={styles.card}>
        {currentStep === 1 && (
          <StepProjectSelection
            config={config}
            selectedProjects={selectedProjects}
            onToggle={toggleProject}
          />
        )}

        {currentStep === 2 && (
          <StepDetails
            config={config}
            activeSections={activeSections}
            answers={answers}
            onSetAnswer={setAnswer}
            onToggleMultiSelect={toggleMultiSelectAnswer}
          />
        )}

        {currentStep === 3 && (
          <StepReview
            config={config}
            selectedProjects={selectedProjects}
            activeSections={activeSections}
            answers={answers}
          />
        )}
      </div>

      {/* Error Message */}
      {submitError && (
        <div style={styles.errorMessage}>
          {submitError}
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={styles.navButtons}>
        {currentStep > 1 && (
          <button
            onClick={goBack}
            style={styles.secondaryButton}
          >
            Back
          </button>
        )}
        <div style={{ flex: 1 }} />
        {currentStep < totalSteps && (
          <button
            onClick={goNext}
            disabled={currentStep === 1 && selectedProjects.length === 0}
            style={{
              ...styles.primaryButton,
              opacity: currentStep === 1 && selectedProjects.length === 0 ? 0.5 : 1,
              cursor: currentStep === 1 && selectedProjects.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        )}
        {currentStep === totalSteps && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              ...styles.primaryButton,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StepProjectSelection({ config, selectedProjects, onToggle }) {
  return (
    <div>
      <h2 style={styles.sectionTitle}>{config.projectSelection.label}</h2>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {config.projectSelection.options.map((option) => {
          const isSelected = selectedProjects.includes(option.id);
          return (
            <label
              key={option.id}
              style={{
                ...styles.checkboxCard,
                borderColor: isSelected ? 'var(--ls-purple)' : 'var(--border-color)',
                background: isSelected ? 'var(--ls-lime-green)' : 'white',
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(option.id)}
                style={{ marginRight: '0.75rem', accentColor: 'var(--ls-purple)' }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600 }}>{option.name}</span>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--ls-purple)', fontSize: '0.95rem' }}>
                ${option.price.toLocaleString()}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function StepDetails({ config, activeSections, answers, onSetAnswer, onToggleMultiSelect }) {
  return (
    <div>
      {activeSections.map((sectionKey) => {
        const section = config.sections[sectionKey];
        return (
          <div key={sectionKey} style={{ marginBottom: '2rem' }}>
            <h2 style={styles.sectionTitle}>{section.label}</h2>
            {section.questions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={(val) => onSetAnswer(question.id, val)}
                onToggleMultiSelect={(val) => onToggleMultiSelect(question.id, val)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function StepReview({ config, selectedProjects, activeSections, answers }) {
  const selectedProjectObjects = config.projectSelection.options.filter(
    (o) => selectedProjects.includes(o.id)
  );

  return (
    <div>
      <h2 style={styles.sectionTitle}>Review Your Selections</h2>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Selected Projects
        </h3>
        {selectedProjectObjects.map((p) => (
          <div key={p.id} style={styles.reviewItem}>
            <span>{p.name}</span>
            <span style={{ fontWeight: 600, color: 'var(--ls-purple)' }}>
              ${p.price.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {activeSections.map((sectionKey) => {
        const section = config.sections[sectionKey];
        const answeredQuestions = section.questions.filter((q) => {
          const val = answers[q.id];
          if (val === undefined || val === '' || val === null) return false;
          if (Array.isArray(val) && val.length === 0) return false;
          return true;
        });

        if (answeredQuestions.length === 0) return null;

        return (
          <div key={sectionKey} style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {section.label}
            </h3>
            {answeredQuestions.map((q) => (
              <div key={q.id} style={styles.reviewItem}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{q.label}</span>
                <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                  {Array.isArray(answers[q.id]) ? answers[q.id].join(', ') : String(answers[q.id])}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function QuestionField({ question, value, onChange, onToggleMultiSelect }) {
  const { id, type, label, options, required } = question;

  switch (type) {
    case 'select':
      return (
        <div style={styles.fieldGroup}>
          <label htmlFor={id} style={styles.label}>
            {label} {required && <span style={{ color: 'red' }}>*</span>}
          </label>
          <select
            id={id}
            aria-label={label}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={styles.select}
          >
            <option value="">Select...</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );

    case 'multi-select':
      return (
        <div style={styles.fieldGroup}>
          <div style={styles.label}>
            {label} {required && <span style={{ color: 'red' }}>*</span>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {options.map((opt) => {
              const checked = Array.isArray(value) && value.includes(opt);
              return (
                <label key={opt} style={styles.multiSelectOption}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleMultiSelect(opt)}
                    style={{ marginRight: '0.4rem', accentColor: 'var(--ls-purple)' }}
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </div>
      );

    case 'text':
      return (
        <div style={styles.fieldGroup}>
          <label htmlFor={id} style={styles.label}>
            {label} {required && <span style={{ color: 'red' }}>*</span>}
          </label>
          <input
            id={id}
            aria-label={label}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={styles.input}
          />
        </div>
      );

    case 'textarea':
      return (
        <div style={styles.fieldGroup}>
          <label htmlFor={id} style={styles.label}>
            {label} {required && <span style={{ color: 'red' }}>*</span>}
          </label>
          <textarea
            id={id}
            aria-label={label}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            style={{ ...styles.input, resize: 'vertical', minHeight: 80 }}
          />
        </div>
      );

    case 'boolean':
      return (
        <div style={styles.fieldGroup}>
          <div style={styles.label}>
            {label} {required && <span style={{ color: 'red' }}>*</span>}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {['Yes', 'No'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                style={{
                  ...styles.toggleButton,
                  background: value === opt ? 'var(--ls-purple)' : 'white',
                  color: value === opt ? 'white' : 'var(--text-primary)',
                  borderColor: value === opt ? 'var(--ls-purple)' : 'var(--border-color)',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );

    case 'file':
      return (
        <div style={styles.fieldGroup}>
          <label htmlFor={id} style={styles.label}>
            {label} {required && <span style={{ color: 'red' }}>*</span>}
          </label>
          <input
            id={id}
            aria-label={label}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              onChange(file ? file.name : '');
            }}
            style={styles.input}
          />
        </div>
      );

    default:
      return null;
  }
}

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  card: {
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.5rem',
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: 'var(--text-primary)',
  },
  checkboxCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
  },
  fieldGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: 500,
    marginBottom: '0.4rem',
    color: 'var(--text-primary)',
  },
  input: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    background: 'white',
    outline: 'none',
  },
  multiSelectOption: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.35rem 0.75rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-full, 9999px)',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  toggleButton: {
    padding: '0.5rem 1.25rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  reviewItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid var(--gray-100, #f5f5f5)',
  },
  navButtons: {
    display: 'flex',
    gap: '1rem',
  },
  primaryButton: {
    background: 'var(--ls-purple)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: 'var(--radius-lg)',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  secondaryButton: {
    background: 'white',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    padding: '0.75rem 2rem',
    borderRadius: 'var(--radius-lg)',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  errorMessage: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-lg)',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
};
