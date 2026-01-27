import Layout from '../../components/Layout';

const testimonials = [
  {
    name: 'Michael Dzik',
    role: 'Growth Partner',
    company: 'Radian Capital',
    segment: 'VC / Portfolio Partner',
    quote: "LeanScale does an incredible job with our portcos, jumping in as soon as we invest and giving founders a strong shot at winning.",
    url: 'https://leanscale.team/portfolio/',
  },
  {
    name: 'Thomas Miller',
    role: 'CRO',
    company: 'Human',
    segment: 'Mid-Market SaaS',
    quote: "The most competent team I've worked with; they know what to do and how to tailor everything to our business.",
    url: 'https://leanscale.team/portfolio/',
  },
  {
    name: 'Donal Tobin',
    role: 'CEO',
    company: 'Integrate.io',
    segment: 'Mid-Market SaaS',
    quote: "LeanScale gave us the playbook and technical expertise to get up and running in 60 days with a smooth, thorough implementation.",
    url: 'https://leanscale.team/portfolio/',
  },
  {
    name: 'Amy De Salvatore',
    role: 'Partner',
    company: 'NightDragon',
    segment: 'VC / Growth Stage',
    quote: "LeanScale's holistic revenue-ops approach has clearly boosted our portfolio's growth and made them a trusted partner for complex GTM challenges.",
    url: 'https://leanscale.team/growth-stage-investments/',
  },
  {
    name: 'Tim White',
    role: 'Chief Growth Officer',
    company: 'Wealth.com',
    segment: 'Seed / Fintech',
    quote: "As with every project, LeanScale did an incredible job designing and fully streamlining our proposal and contracting process with DealHub CPQ.",
    url: 'https://leanscale.team/wealth-com/',
  },
  {
    name: 'Justin W.',
    role: 'Reviewer',
    company: 'Mid-Market',
    segment: 'Mid-Market SaaS',
    quote: "I appreciate their professional, pragmatic, straight-forward communication and the deep SaaS experience they bring from seeing what actually works.",
    url: 'https://leanscale.team/',
  },
  {
    name: 'Rafael L.',
    role: 'Reviewer',
    company: 'Small-Business',
    segment: 'SMB SaaS',
    quote: "Instead of hiring in-house RevOps, we got LeanScale's experience, tools, and team for roughly the same cost—making the decision an easy one.",
    url: 'https://leanscale.team/',
  },
  {
    name: 'Cheryl Y.',
    role: 'Reviewer',
    company: 'Mid-Market',
    segment: 'Mid-Market SaaS',
    quote: "Don't hesitate—get LeanScale involved quickly; they feel like internal resources, stay on top of everything, and are a rare find in the SalesOps world.",
    url: 'https://leanscale.team/',
  },
];

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function getSegmentColor(segment) {
  if (segment.includes('VC') || segment.includes('Growth Stage')) return '#dbeafe';
  if (segment.includes('SMB')) return '#fef3c7';
  if (segment.includes('Fintech') || segment.includes('Seed')) return '#fce7f3';
  return '#dcfce7';
}

export default function CustomerReferences() {
  return (
    <Layout title="Customer References">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <span>⭐</span> Customer References
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#666', marginTop: '0.5rem' }}>
            Hear from the teams we&apos;ve helped scale their GTM operations
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {testimonials.map((testimonial, i) => (
            <div 
              key={i} 
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #eee',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ 
                fontSize: '2rem', 
                color: 'var(--ls-purple)', 
                marginBottom: '0.75rem',
                lineHeight: 1
              }}>
                &ldquo;
              </div>
              <p style={{ 
                fontStyle: 'italic', 
                lineHeight: 1.6, 
                flex: 1,
                marginBottom: '1.5rem',
                fontSize: '0.95rem'
              }}>
                {testimonial.quote}
              </p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                borderTop: '1px solid #eee',
                paddingTop: '1rem'
              }}>
                <div 
                  style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, var(--ls-purple) 0%, #8B5CF6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    flexShrink: 0
                  }}
                >
                  {getInitials(testimonial.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <a 
                    href={testimonial.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      fontWeight: 600, 
                      color: 'var(--ls-purple)',
                      textDecoration: 'none'
                    }}
                  >
                    {testimonial.name}
                  </a>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  background: getSegmentColor(testimonial.segment),
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  whiteSpace: 'nowrap'
                }}>
                  {testimonial.segment}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
