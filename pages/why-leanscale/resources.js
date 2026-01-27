import Layout from '../../components/Layout';

const resources = [
  { 
    title: 'LeanScale Home', 
    type: 'Website', 
    url: 'https://leanscale.team', 
    icon: '🏠',
    description: 'Quick overview of who LeanScale is and what we do.'
  },
  { 
    title: 'LeanScale YouTube Channel', 
    type: 'YouTube', 
    url: 'https://www.youtube.com/@leanscale', 
    icon: '📺',
    description: 'All our RevOps, GTM Ops, and growth videos in one place.'
  },
  { 
    title: 'Services Overview', 
    type: 'Website', 
    url: 'https://leanscale.team/services/', 
    icon: '🛠️',
    description: 'Simple breakdown of our main services and how we help GTM teams.'
  },
  { 
    title: 'Intro to LeanScale', 
    type: 'Article', 
    url: 'https://leanscale.team/introducing-leanscale-for-b2b-startups/', 
    icon: '📄',
    description: 'High-level intro to our approach for B2B startups.'
  },
  { 
    title: 'Growth Modeling & Capacity Planning', 
    type: 'Video', 
    url: 'https://www.youtube.com/watch?v=aCcS8tFl2zY', 
    icon: '📈',
    description: 'Popular walkthrough on how to plan headcount and growth realistically.'
  },
  { 
    title: 'Lean Startups Guide', 
    type: 'Article', 
    url: 'https://leanscale.team/lean-startups/', 
    icon: '📖',
    description: 'Our point of view on how modern startups should operate and scale.'
  },
  { 
    title: 'Ecosystem-Led Growth', 
    type: 'Article', 
    url: 'https://leanscale.team/eco-led-startups/', 
    icon: '🌱',
    description: 'Short read on building through partnerships and ecosystems.'
  },
  { 
    title: 'GTM Lifecycle Guide', 
    type: 'Docs', 
    url: 'https://docs.leanscale.team/go-to-market-lifecycle/go-to-market-lifecycle', 
    icon: '🔄',
    description: 'Full walkthrough of the GTM process from lead to renewal.'
  },
  { 
    title: 'CRM Setup Basics', 
    type: 'Docs', 
    url: 'https://docs.leanscale.team/gtm-tech-stack/crm-considerations', 
    icon: '💾',
    description: 'What a solid CRM setup should look like and how to keep it clean.'
  },
  { 
    title: 'Lead Source Playbook', 
    type: 'Docs', 
    url: 'https://docs.leanscale.team/lead-attribution/lead-source-taxonomy', 
    icon: '🎯',
    description: 'How to organize and track lead sources the right way.'
  },
  { 
    title: 'Sales Territories Guide', 
    type: 'Docs', 
    url: 'https://docs.leanscale.team/strategic-walkthroughs/building-sales-territories', 
    icon: '🗺️',
    description: 'How to design fair, logical sales territories as you scale.'
  },
  { 
    title: 'Marketing Dashboards Guide', 
    type: 'Docs', 
    url: 'https://docs.leanscale.team/strategic-walkthroughs/building-dashboards/marketing-dashboards', 
    icon: '📊',
    description: 'Key dashboards every GTM team should have and how to build them.'
  },
];

export default function KeyResources() {
  return (
    <Layout title="Key Resources">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <span>📚</span> Key Resources
          </h1>
        </div>

        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {resources.map((resource) => (
            <a
              key={resource.title}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{resource.icon}</div>
              <h3 className="card-title">{resource.title}</h3>
              <p style={{ 
                fontSize: '0.9rem', 
                color: '#666', 
                marginTop: '0.5rem',
                marginBottom: '0.75rem',
                lineHeight: 1.5
              }}>
                {resource.description}
              </p>
              <span style={{
                display: 'inline-block',
                padding: '0.25rem 0.5rem',
                background: 'var(--ls-light-gray)',
                borderRadius: '4px',
                fontSize: '0.75rem',
              }}>
                {resource.type}
              </span>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}
