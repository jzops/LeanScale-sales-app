import { useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useCustomer } from '../../context/CustomerContext';

const claybooks = [
  { id: 1, name: 'Market Map', price: 45000, prereqs: 'None', description: 'Builds your complete ICP/TAM database in Clay, enriches every account, scores for fit, assigns tiers, and pushes to CRM.', complexity: 'High', scope: 'Up to 50,000 accounts' },
  { id: 2, name: 'Persona Mapping', price: 6250, prereqs: 'Market Map', description: 'Adds contact-level enrichment to your Market Map. Identifies key personas, enriches contacts, scores for relevance.', complexity: 'Medium', scope: 'Up to 100,000 contacts' },
  { id: 3, name: 'Automated Inbound Enrichment', price: 6875, prereqs: 'Market Map recommended', description: 'Enriches inbound leads in real-time. Filters junk, deduplicates, scores, tiers, and routes.', complexity: 'Medium', scope: 'Unlimited inbound volume' },
  { id: 4, name: 'Automated Outbound', price: 7500, prereqs: 'Market Map', description: 'Builds targeted outbound lists, enriches contacts, personalizes at scale, pushes to sales engagement platform.', complexity: 'Medium-High', scope: 'Up to 10,000 contacts/month' },
  { id: 5, name: 'Lead Scoring', price: 5000, prereqs: 'ICP definition', description: 'ICP-driven lead scoring combining firmographic fit with enriched data signals, syncs to CRM/MAP.', complexity: 'Medium', scope: 'Inbound and existing database' },
  { id: 6, name: 'ABM Target Account Enrichment', price: 7500, prereqs: 'Named account list', description: 'Deep enrichment for named accounts, buying committee mapping, intent signals, ABM-ready segments.', complexity: 'Medium-High', scope: 'Up to 500 named accounts' },
  { id: 7, name: 'CRM Data Cleanup', price: 4375, prereqs: 'CRM access', description: 'Enriches and standardizes existing CRM data. Fills gaps, corrects errors, normalizes fields.', complexity: 'Low-Medium', scope: 'Up to 25,000 records' },
  { id: 8, name: 'Customer Segmentation', price: 6250, prereqs: 'Customer list', description: 'Enriches customer base for CS coverage models, expansion targeting, and retention analysis.', complexity: 'Medium', scope: 'Up to 10,000 customers' },
  { id: 9, name: 'Event Lead Enrichment', price: 3125, prereqs: 'ICP definition', description: 'Enriches event leads, scores against ICP, deduplicates, routes hot leads for follow-up.', complexity: 'Low-Medium', scope: 'Up to 5,000 leads per event' },
  { id: 10, name: 'Signal-Based Prospecting', price: 8750, prereqs: 'Market Map', description: 'Monitors intent signals across your TAM and surfaces accounts showing buying signals.', complexity: 'High', scope: 'Up to 25,000 accounts' },
];

const bundles = [
  { name: 'GTM Foundation Bundle', price: 23000, savings: 2625, includes: ['Market Map', 'Persona Mapping', 'Automated Inbound Enrichment'] },
  { name: 'Full Outbound Stack Bundle', price: 30000, savings: 5000, includes: ['Market Map', 'Persona Mapping', 'Automated Outbound', 'Signal-Based Prospecting'] },
  { name: 'Complete GTM Infrastructure', price: 55000, savings: 13125, includes: ['All 10 Claybooks', 'Unified architecture', 'Cross-table deduplication', 'Priority 8-week delivery'] },
];

const stats = [
  { value: '$5.45B+', label: 'Capital Raised by Clients' },
  { value: '395K+', label: 'YouTube Subscribers' },
  { value: '200+', label: 'B2B Projects Executed' },
];

const useCases = [
  {
    number: '01',
    tag: 'THE FOUNDATION',
    title: 'Market Map',
    description: 'The foundation every other Clay use case is built on. Preload and enrich your CRM with every account from your TAM, all contacts, their propensity to buy, and potential revenue.',
    benefits: ['Better territory design', 'Higher marketing conversion rates', 'Smarter credit management', 'Cleaner lead routing'],
  },
  {
    number: '02',
    tag: 'THE ACTIVATION',
    title: 'Automated Outbound',
    description: "Clay's AI agent monitors for buying signals and enriches target accounts. High-precision, signal-based outbound focused on highest probability opportunities.",
    benefits: ['Job changes monitoring', 'Funding rounds detection', 'Product launches tracking', 'News events signals'],
  },
  {
    number: '03',
    tag: 'THE ACCELERATION',
    title: 'Real-Time Inbound Enrichment',
    description: 'For every web form submission, seconds later, Clay runs enrichment evaluation against your market map. If it\'s a good fit, Clay adds, enriches, scores, and guides routing automatically.',
    benefits: ['Demo requests', 'Trial signups', 'Instant scoring', 'Automated routing'],
  },
  {
    number: '04',
    tag: 'THE EVOLUTION',
    title: 'Custom Use-Cases',
    description: 'The custom automations, scoring models, partner workflows, or territory rules we build once the core systems are dialed in.',
    benefits: ['Custom automations', 'Scoring models', 'Partner workflows', 'Territory rules'],
  },
];

const whatClayIs = [
  'Your enrichment brain built to enrich, scrape, and automate across 150+ data sources',
  'Smarter spend via waterfall enrichment with full transparency over sources',
  'AI firepower with built-in agents like Claygent for running prompts and scoring leads',
  'Automated data enrichment at scale - pull firmographics, scrape job posts, score leads',
  'The intelligence layer that supercharges your existing tools and workflows',
];

const whatClayIsNot = [
  'Built for reps to click around and manually prospect like Apollo or ZoomInfo',
  'A replacement for your CRM, Gong, Outreach, or other core GTM tools',
  'A plug-and-play solution that works without strategic implementation',
  'Designed to operate in isolation without connecting to your GTM stack',
  'A simple data provider that just gives you more of the same information',
];

export default function ClayPartnership() {
  const { customerPath } = useCustomer();
  return (
    <Layout title="Clay x LeanScale">
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', color: 'white', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e' }}>LeanScale</span>
            </div>
            <span style={{ fontSize: '2rem', color: '#f59e0b' }}>×</span>
            <div style={{ background: '#E8DED1', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e' }}>Clay</span>
            </div>
          </div>
          
          <p style={{ color: '#a5b4fc', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>
            Clay Enterprise Partner
          </p>
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2 }}>
            Stop burning credits.<br />
            <span style={{ color: '#a3e635' }}>Start growing revenue.</span>
          </h1>
          
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: 600, margin: '0 auto 2rem' }}>
            See how the fastest growing B2B startups use Clay as their intelligence layer to multiply every part of their Go-to-Market engine.
          </p>

          <div style={{ 
            maxWidth: 800, 
            margin: '0 auto 2rem', 
            borderRadius: '12px', 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src="https://fast.wistia.net/embed/iframe/w4exgaxw97?seo=true&videoFoam=false"
                title="Clay x LeanScale"
                allow="autoplay; fullscreen"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>

          <a 
            href="https://go.leanscale.team/clay/start#booking-form" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-block',
              background: '#a3e635', 
              color: '#1a1a2e', 
              padding: '1rem 2rem', 
              borderRadius: '8px', 
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1.1rem',
            }}
          >
            Get Free Clay Diagnostic
          </a>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
            No Cost. No pitch. Just insights.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '4rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#7c3aed' }}>{stat.value}</div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '3rem', marginBottom: '4rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.75rem' }}>
            Understanding what Clay actually is
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>
            versus common misconceptions
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.25rem' }}>✕</span> What Clay is NOT
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {whatClayIsNot.map((item, i) => (
                  <li key={i} style={{ 
                    padding: '0.75rem 1rem', 
                    background: '#fef2f2', 
                    borderRadius: '8px', 
                    marginBottom: '0.5rem',
                    color: '#991b1b',
                    fontSize: '0.9rem',
                  }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.25rem' }}>✓</span> What Clay IS
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {whatClayIs.map((item, i) => (
                  <li key={i} style={{ 
                    padding: '0.75rem 1rem', 
                    background: '#ecfdf5', 
                    borderRadius: '8px', 
                    marginBottom: '0.5rem',
                    color: '#065f46',
                    fontSize: '0.9rem',
                  }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ color: '#7c3aed', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
            The Clay Use-Case Pyramid
          </p>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            The 4 proven use-cases that drive real business outcomes.
          </h2>
          <p style={{ color: '#6b7280', maxWidth: 600, margin: '0 auto' }}>
            These are the use-cases we implement for startups daily, turning Clay from a cool tool into a core intelligence layer.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          {useCases.map((useCase, i) => (
            <div key={i} style={{ 
              background: 'white', 
              border: '1px solid #e5e7eb', 
              borderRadius: '12px', 
              padding: '1.5rem',
              transition: 'box-shadow 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <span style={{ 
                  background: '#7c3aed', 
                  color: 'white', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600 
                }}>
                  {useCase.number}
                </span>
                <span style={{ color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {useCase.tag}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{useCase.title}</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                {useCase.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {useCase.benefits.map((benefit, j) => (
                  <span key={j} style={{ 
                    background: '#f3f4f6', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem',
                    color: '#374151',
                  }}>
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', 
          borderRadius: '16px', 
          padding: '3rem', 
          textAlign: 'center',
          color: 'white',
          marginBottom: '4rem',
        }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
            Clay is a Formula 1 engine
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: 600, margin: '0 auto 1.5rem' }}>
            But useless without the car. Clay needs the pit crew, race plan, and the rest of the car.
            Without having a strategy to implement Clay, you won&apos;t see the impact.
          </p>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            That&apos;s why we offer a free Clay diagnostic.
          </p>
          <a 
            href="https://go.leanscale.team/clay/start#booking-form" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-block',
              background: 'white', 
              color: '#7c3aed', 
              padding: '1rem 2rem', 
              borderRadius: '8px', 
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1rem',
            }}
          >
            Get Free Clay Diagnostic →
          </a>
        </div>

        {/* Claybook Pricing Section */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: '#7c3aed', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
              Claybook Pricing Menu
            </p>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
              Fixed pricing for Clay implementations
            </h2>
            <p style={{ color: '#6b7280', maxWidth: 600, margin: '0 auto' }}>
              Each Claybook is a pre-built Clay workflow including enrichment waterfall, scoring logic, CRM mapping, integration setup, documentation, and training.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {claybooks.map((book) => (
              <div key={book.id} style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.25rem',
                transition: 'box-shadow 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ 
                      background: '#f3f4f6', 
                      color: '#6b7280', 
                      padding: '0.15rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.7rem',
                      marginRight: '0.5rem',
                    }}>
                      #{book.id}
                    </span>
                    <span style={{
                      background: book.complexity === 'High' ? '#fef3c7' : book.complexity === 'Medium-High' ? '#fef3c7' : '#d1fae5',
                      color: book.complexity === 'High' ? '#92400e' : book.complexity === 'Medium-High' ? '#92400e' : '#065f46',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                    }}>
                      {book.complexity}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#7c3aed' }}>
                    ${book.price.toLocaleString()}
                  </div>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{book.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {book.description}
                </p>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  <span>{book.scope}</span>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                  <strong>Prereqs:</strong> {book.prereqs}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>Bundles (Save More)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {bundles.map((bundle, i) => (
                <div key={i} style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  color: 'white',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                    Save ${bundle.savings.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    ${bundle.price.toLocaleString()}
                  </div>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>{bundle.name}</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>
                    {bundle.includes.map((item, j) => (
                      <li key={j} style={{ marginBottom: '0.25rem' }}>✓ {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ 
          background: '#f9fafb', 
          borderRadius: '12px', 
          padding: '2rem', 
          maxWidth: 700, 
          margin: '0 auto 3rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>&ldquo;</div>
            <div>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#374151', marginBottom: '1rem', fontStyle: 'italic' }}>
                By partnering with LeanScale, we successfully automated account and contact enrichment processes using Clay. 
                The outcome was a significant reduction in manual processing time, improved data accuracy, and enhanced sales 
                intelligence capabilities. Our sales team is now able to focus on high-value activities.
              </p>
              <div style={{ fontWeight: 600 }}>Kelsey L.</div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>RevOps at Fountain</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem' }}>Ready to unlock Clay&apos;s full potential?</h3>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="https://go.leanscale.team/clay/start" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <button className="btn btn-primary">
                Visit Clay x LeanScale
              </button>
            </a>
            <a 
              href="https://www.clay.com/experts/partner/leanscale" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <button className="btn" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
                View on Clay Directory
              </button>
            </a>
            <Link href={customerPath('/buy-leanscale/one-time-projects')} style={{ textDecoration: 'none' }}>
              <button className="btn" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
                Custom Enrichment Project
              </button>
            </Link>
            <Link href={customerPath('/buy-leanscale/clay-intake')} style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary">
                Start Clay Project Intake
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
