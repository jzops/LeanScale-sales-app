import Layout from '../../components/Layout';

const values = ['Integrity', 'Humility', 'Taking action', 'Challenging yourself and others'];

const differentiators = [
  {
    title: 'Startup Operator Experience',
    description: 'Our team has built and scaled GTM operations at startups from Series A to IPO.',
  },
  {
    title: 'Proactive Approach',
    description: "We don't wait for problems—we anticipate them and build solutions before they become blockers.",
  },
  {
    title: 'Assigned Team Members',
    description: "Because business context matters. Your team gets better and better as they spend more time with you and your business. We don't switch consultants from project to project, we know business context matters and you don't need to waste your time getting someone new up to speed.",
  },
  {
    title: 'Broad Scope and Capabilities',
    description: "We have a dynamic team and access to experts in every area of revenue operations. Give us a problem, and we can solve it. When it comes to new tools, new ways to measure your GTM engine, or novel operational approaches, we're always testing the limits of what's possible and helps our customers.",
  },
  {
    title: 'Long Term Partnerships',
    description: "We get more efficient and effective the longer the partnership continues. We use business context to help provide the best operational solutions possible.",
  },
  {
    title: "'Lean on Us' Mentality",
    description: "Don't worry about what's \"in scope\" and focus on growing your revenue machine. Unload the operational burden of RevOps to your LeanScale team. With our broad scope and capabilities we welcome leaning on our team to achieve your goals.",
  },
];

const topTalent = [
  '3-10+ Years Startup Experience',
  'Quick Ramp Abilities',
  'Fast Pace Work Style',
  'Rapid Re-Prioritization Skills',
  'Iterative Approach',
  'B2B SaaS and AIaaS Expertise',
];

const deepCapabilities = [
  'LeanScale Academy™ Certified',
  'CRM + GTM Tech Stack Administration',
  'AI Best Practices + Playbooks',
  'Strategic & Technical Support',
  'Holistic View of Business & GTM Ops',
];

export default function AboutUs() {
  return (
    <Layout title="About Us">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <span>👋</span> About Us
          </h1>
        </div>

        {/* Mission */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Our Mission</h2>
          <p style={{ fontSize: '1.25rem', lineHeight: 1.7, maxWidth: 800 }}>
            To attract and develop the world&apos;s best startup operators and help startups,
            their people, and their investors succeed.
          </p>
        </section>

        {/* Values */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Our Values</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {values.map((value) => (
              <div
                key={value}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--ls-lime-green)',
                  borderRadius: '8px',
                  fontWeight: 500,
                }}
              >
                {value}
              </div>
            ))}
          </div>
        </section>

        {/* What Sets Us Apart */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>What Sets Us Apart</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem' 
          }}>
            {differentiators.map((item) => (
              <div 
                key={item.title} 
                style={{
                  padding: '1.5rem',
                  border: '2px solid var(--ls-purple)',
                  borderRadius: '8px',
                  background: 'white',
                }}
              >
                <h3 style={{ 
                  color: 'var(--ls-purple)', 
                  marginBottom: '0.75rem',
                  fontSize: '1.25rem'
                }}>
                  {item.title}
                </h3>
                <p style={{ lineHeight: 1.6, margin: 0 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who We Hire */}
        <section>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>Who We Hire</h2>
          <div style={{ 
            background: 'var(--ls-lime-green)', 
            borderRadius: '12px', 
            padding: '2rem',
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '3rem' 
            }}>
              {/* Top Talent Column */}
              <div>
                <h3 style={{ 
                  textAlign: 'center', 
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--ls-purple)'
                }}>
                  Top Talent
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {topTalent.map((item) => (
                    <li 
                      key={item} 
                      style={{ 
                        padding: '0.5rem 0',
                        borderBottom: '1px solid rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        background: 'var(--ls-purple)',
                        flexShrink: 0
                      }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deep Capabilities Column */}
              <div>
                <h3 style={{ 
                  textAlign: 'center', 
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--ls-purple)'
                }}>
                  Deep Capabilities
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {deepCapabilities.map((item) => (
                    <li 
                      key={item} 
                      style={{ 
                        padding: '0.5rem 0',
                        borderBottom: '1px solid rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        background: 'var(--ls-purple)',
                        flexShrink: 0
                      }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
