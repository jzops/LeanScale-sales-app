import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { playbooks } from '../../data/services-catalog';
import { playbookContent } from '../../data/playbook-content';

export default function PlaybookDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const playbook = id ? playbooks.find(p => p.id === id) : null;
  const content = id ? playbookContent[id] : null;

  if (!router.isReady) {
    return (
      <Layout title="Loading...">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <p style={{ color: '#666' }}>Loading playbook...</p>
        </div>
      </Layout>
    );
  }

  if (!playbook) {
    return (
      <Layout title="Playbook Not Found">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h1>Playbook Not Found</h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            The playbook you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/why-leanscale/services" className="btn btn-primary">
            Browse All Services
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${playbook.name} Playbook`}>
      <div className="container" style={{ maxWidth: 900 }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link 
            href="/why-leanscale/services" 
            style={{ 
              color: '#7c3aed', 
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.9rem',
            }}
          >
            ← Back to Services Catalog
          </Link>
        </div>

        <div className="page-header" style={{ textAlign: 'left' }}>
          <div style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            background: '#ede9fe',
            color: '#7c3aed',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
          }}>
            ONE-TIME PROJECT
          </div>
          <h1 className="page-title" style={{ textAlign: 'left' }}>
            {playbook.name}
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: 1.6 }}>
            {playbook.description}
          </p>
        </div>

        {content ? (
          <div className="playbook-content">
            {content.definition && (
              <section className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <h2 style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <span style={{ fontSize: '1.25rem' }}>📋</span> Definition
                </h2>
                <div style={{ color: '#374151', lineHeight: 1.7 }}>
                  <p><strong>What it is:</strong> {content.definition.whatItIs}</p>
                  {content.definition.whatItIsNot && (
                    <p><strong>What it is NOT:</strong> {content.definition.whatItIsNot}</p>
                  )}
                </div>
              </section>
            )}

            {content.valueProp && (
              <section className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <h2 style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <span style={{ fontSize: '1.25rem' }}>💎</span> ICP Value Proposition
                </h2>
                <div style={{ color: '#374151', lineHeight: 1.7 }}>
                  <p><strong>Pain it solves:</strong> {content.valueProp.pain}</p>
                  <p><strong>Outcome delivered:</strong> {content.valueProp.outcome}</p>
                  <p><strong>Who owns it:</strong> {content.valueProp.owner}</p>
                </div>
              </section>
            )}

            {content.implementation && content.implementation.length > 0 && (
              <section className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <h2 style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <span style={{ fontSize: '1.25rem' }}>⚙️</span> Implementation Procedure
                </h2>
                <div style={{ color: '#374151' }}>
                  {content.implementation.map((phase, idx) => (
                    <div key={idx} style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ 
                        fontSize: '1rem', 
                        fontWeight: 600, 
                        marginBottom: '0.75rem',
                        color: '#7c3aed',
                      }}>
                        {phase.title}
                      </h3>
                      <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
                        {phase.steps.map((step, stepIdx) => (
                          <li key={stepIdx} style={{ marginBottom: '0.5rem', lineHeight: 1.6 }}>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {content.dependencies && (
              <section className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <h2 style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <span style={{ fontSize: '1.25rem' }}>🔗</span> Dependencies & Inputs
                </h2>
                <div style={{ color: '#374151', lineHeight: 1.7 }}>
                  {content.dependencies.before && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>What must exist before starting:</strong>
                      <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                        {content.dependencies.before.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {content.dependencies.clientProvides && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>What client must provide:</strong>
                      <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                        {content.dependencies.clientProvides.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {content.dependencies.leanscaleBrings && (
                    <div>
                      <strong>What LeanScale brings:</strong>
                      <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                        {content.dependencies.leanscaleBrings.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {content.pitfalls && content.pitfalls.length > 0 && (
              <section className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <h2 style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <span style={{ fontSize: '1.25rem' }}>⚠️</span> Common Pitfalls
                </h2>
                <div style={{ color: '#374151' }}>
                  {content.pitfalls.map((pitfall, idx) => (
                    <div key={idx} style={{ 
                      marginBottom: '1rem',
                      padding: '1rem',
                      background: '#fef3c7',
                      borderRadius: '8px',
                      borderLeft: '4px solid #f59e0b',
                    }}>
                      <strong style={{ color: '#92400e' }}>{pitfall.issue}</strong>
                      <p style={{ margin: '0.5rem 0 0 0', color: '#78350f' }}>
                        <strong>Mitigation:</strong> {pitfall.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Detailed playbook content is being prepared for this service.
            </p>
            <p style={{ color: '#666' }}>
              Contact us to learn more about how we implement {playbook.name}.
            </p>
          </div>
        )}

        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'white',
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
            Ready to implement {playbook.name}?
          </h3>
          <p style={{ margin: '0 0 1rem 0', opacity: 0.9 }}>
            Start with our diagnostic to see how this fits into your GTM operations strategy.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              href="/try-leanscale/start"
              className="btn btn-primary"
              style={{
                background: 'white',
                color: '#7c3aed',
              }}
            >
              Get Started
            </Link>
            <Link 
              href="/try-leanscale/diagnostic"
              className="btn btn-secondary"
              style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
              }}
            >
              Take Diagnostic
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
