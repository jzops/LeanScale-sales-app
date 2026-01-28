import Link from 'next/link';
import Layout from '../../components/Layout';

const perks = [
  {
    title: 'GTM Diagnostic',
    value: '$5,000',
    valueType: 'One-time',
    description: 'End-to-end inspection of Go-to-Market engine (systems, funnel, reporting, performance to goal) that returns a green/yellow/red scorecard and an execution-ready roadmap.',
    features: ['GTM Metrics Audit', 'GTM Scorecard', 'Inspection Report', 'Execution Roadmap'],
  },
  {
    title: 'GTM Planning Package',
    value: '$5,000',
    valueType: '/ month',
    description: 'Quarterly growth modeling and a GTM reporting-to-goal platform (installed, administered, and paid for by LeanScale) included free of charge for portfolio companies working with us.',
    features: ['Growth Model', 'Performance-to-Goal', 'Reporting Platform', 'Operator Support'],
  },
];

const stats = [
  { value: '$5.45B+', label: 'Capital raised by our clients' },
  { value: '395K+', label: 'YouTube subscribers' },
  { value: '200+', label: 'B2B projects executed' },
];

const steps = [
  {
    number: '01',
    title: 'Connect With Anthony',
    description: 'Schedule a quick 15-minute chat with Anthony - 3x VP through $500M exit, Founder of LeanScale - to explore how we can support your portfolio.',
    bullets: ['Share investor insights', 'Get field benchmarks', 'Collaborate + connect'],
  },
  {
    number: '02',
    title: 'Give Portcos What They Need - For Free',
    description: 'Complimentary GTM Diagnostic + Planning Package to assess, model, and install the systems your portfolio companies need to scale.',
    bullets: ['Audit GTM engine', 'Scorecard + roadmap', 'Complimentary growth modeling platform'],
  },
];

export default function InvestorPerks() {
  return (
    <Layout title="Investor Perks">
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', color: 'white', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ color: '#a5b4fc', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>
            For Investors in B2B Tech
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            Helping Your Portcos Scale Faster
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: 700, margin: '0 auto 2rem' }}>
            Complimentary Support for Your Portcos from the GTM Ops team behind some of the fastest growing names in B2B tech
          </p>

          <div style={{ 
            maxWidth: 700, 
            margin: '0 auto 2rem', 
            borderRadius: '12px', 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src="https://fast.wistia.net/embed/iframe/9k2foyun1f?seo=true&videoFoam=false"
                title="LeanScale Investor VSL"
                allow="autoplay; fullscreen"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>

          <a 
            href="https://go.leanscale.team/investor#investor-calendar" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-lg"
            style={{ 
              background: '#a3e635', 
              color: '#1a1a2e', 
              textDecoration: 'none',
            }}
          >
            Let&apos;s Connect
          </a>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
            Let&apos;s chat portfolios, trends, and intros
          </p>
        </div>
      </div>

      <div className="container">
        <section style={{ padding: '3rem 0' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.75rem' }}>
            Give Your Portcos What They Need - For Free
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>
            For investors who connect with LeanScale, we provide the following complimentary GTM support to your portfolio companies.
          </p>

          <div className="perks-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {perks.map((perk) => (
              <div key={perk.title} style={{
                background: 'white',
                border: '2px solid var(--ls-purple)',
                borderRadius: '12px',
                padding: '2rem',
              }}>
                <h3 style={{ color: 'var(--ls-purple)', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                  {perk.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem', lineHeight: 1.6 }}>
                  {perk.description}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0' }}>
                  {perk.features.map((feature) => (
                    <li key={feature} style={{ 
                      padding: '0.35rem 0', 
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      <span style={{ color: 'var(--ls-purple)' }}>✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <div style={{ 
                  background: 'var(--ls-lime-green)', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '8px',
                  textAlign: 'center',
                }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ls-purple)' }}>
                    {perk.value}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '0.9rem' }}> {perk.valueType}</span>
                  <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, marginTop: '0.25rem' }}>
                    FREE for Portcos
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ 
          background: 'linear-gradient(135deg, var(--ls-purple) 0%, #501a6b 100%)', 
          borderRadius: '16px', 
          padding: '3rem',
          color: 'white',
          marginBottom: '3rem',
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>
            We&apos;ve scaled the fastest-growing Startups in B2B Tech
          </h2>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stat.value}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>The Simple Process</h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem', maxWidth: 700, margin: '0 auto 2rem' }}>
            A proven GTM partner that equips your portfolio companies with diagnostics, growth modeling, and reporting systems – all handled for you at no cost.
          </p>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
            {steps.map((step) => (
              <div key={step.number} style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '2rem',
              }}>
                <div style={{ 
                  display: 'inline-block',
                  background: 'var(--ls-purple)', 
                  color: 'white', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}>
                  Step {step.number}
                </div>
                <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>{step.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {step.description}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {step.bullets.map((bullet) => (
                    <li key={bullet} style={{ 
                      padding: '0.25rem 0', 
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      <span style={{ color: 'var(--ls-purple)' }}>→</span> {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section style={{ 
          background: '#f9fafb', 
          borderRadius: '16px', 
          padding: '3rem',
          marginBottom: '3rem',
        }}>
          <div className="founder-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <img 
                src="https://leanscale.team/wp-content/uploads/2024/03/Anthony2_de13c4ccc0.jpg" 
                alt="Anthony Enrico"
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid var(--ls-purple)',
                  marginBottom: '1rem',
                }}
              />
              <h3 style={{ marginBottom: '0.25rem' }}>Anthony Enrico</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>CEO & Founder</p>
            </div>
            <div>
              <p style={{ color: '#a5b4fc', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                LeanScale Founder
              </p>
              <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Meet Anthony, CEO of LeanScale</h2>
              <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '1rem' }}>
                Anthony Enrico is a 3-time VP of Revenue Operations across startups, scaleups, and Fortune 1000 companies. He led RevOps for Emailage through a $500M exit, started the #1 YouTube channel for RevOps, and has been an operator with expertise across Marketing, Sales, CS and partnerships.
              </p>
              <p style={{ color: '#4b5563', lineHeight: 1.7 }}>
                Today, he leads LeanScale as the embedded GTM team behind high-growth SaaS leaders. Anthony lives in Phoenix, AZ with his wife and three kids.
              </p>
            </div>
          </div>
        </section>

        <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Ready to support your portfolio?</h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Use the calendar below to schedule time with Anthony - swap notes on what&apos;s working across portfolios, share what we&apos;re seeing in the field, or just make a few introductions.
          </p>
          <a 
            href="https://go.leanscale.team/investor#investor-calendar" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg"
            style={{ textDecoration: 'none' }}
          >
            Schedule a Call
          </a>
        </section>
      </div>
    </Layout>
  );
}
