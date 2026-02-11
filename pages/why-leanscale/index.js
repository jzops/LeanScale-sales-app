import Link from 'next/link';
import Layout from '../../components/Layout';
import ImageZoom from '../../components/ImageZoom';
import { useCustomer } from '../../context/CustomerContext';

const navLinks = [
  { href: '#capital-clock', label: 'The "Capital Clock"' },
  { href: '#what-is-gtm-ops', label: 'What is GTM Operations?' },
  { href: '#in-house-vs-partner', label: 'In-House vs Partner' },
  { href: '#pod-structure', label: 'LeanScale GTM Pod Structure' },
  { href: '#working-with-leanscale', label: 'Working with LeanScale' },
];


export default function WhyLeanScale() {
  const { customerPath } = useCustomer();
  return (
    <Layout title="Why LeanScale?">
      <div className="container">
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title" style={{ justifyContent: 'center' }}>
            <span>🚀</span> Go-to-Market Operations
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 700, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Accelerate Your Go-To-Market with Top-Tier GTM Operations. LeanScale provides fractional GTM Operations teams
            for B2B tech startups, delivering enterprise-grade revenue operations without the enterprise price tag.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
            <Link href={customerPath('/buy-leanscale')} className="btn btn-primary">
              Get Started
            </Link>
            <Link href={customerPath('/try-leanscale')} className="btn" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
              Start GTM Diagnostic
            </Link>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '1rem 1.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} style={{ padding: '0.5rem 1rem', color: '#7c3aed', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', borderRadius: '20px', background: '#f3f4f6' }}>
              {link.label}
            </a>
          ))}
        </div>

        <section id="capital-clock" style={{ marginBottom: '4rem', scrollMarginTop: '100px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⏰</span> The "Capital Clock"
          </h2>
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: '#7c3aed', marginBottom: '1rem' }}>Time is Your Scarcest Resource</h3>
                <p style={{ marginBottom: '1rem', lineHeight: 1.7 }}>
                  For every B2B startup, the clock starts ticking the moment you raise capital. You have 18-24 months to prove 
                  product-market fit, build repeatable revenue, and set up for your next milestone. Every day without proper 
                  GTM infrastructure is a day of lost potential.
                </p>
                <p style={{ marginBottom: '1rem', lineHeight: 1.7 }}>
                  <strong>The challenge:</strong> Building an in-house RevOps team takes 6-12 months of hiring, training, and 
                  iteration. By then, you've burned through precious runway without the systems to show for it.
                </p>
                <p style={{ lineHeight: 1.7 }}>
                  <strong>The solution:</strong> LeanScale gives you a battle-tested GTM operations team from day one. 
                  We've built these systems dozens of times — we know what works, what doesn't, and how to get you 
                  operational in weeks, not months.
                </p>
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px', borderLeft: '4px solid #7c3aed' }}>
                  <strong style={{ color: '#7c3aed' }}>Key Insight:</strong> Companies that invest in GTM operations early 
                  see 40% faster pipeline velocity and 30% higher conversion rates within the first year.
                </div>
              </div>
              <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '0.5rem', overflow: 'hidden' }}>
                <ImageZoom
                  src="/images/capital-clock-screenshot.png"
                  alt="The Capital Clock - GTM Operations Roadmap from Seed to Series D+"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="what-is-gtm-ops" style={{ marginBottom: '4rem', scrollMarginTop: '100px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚙️</span> What is GTM Operations?
          </h2>
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
              <div>
                <h3 style={{ color: '#7c3aed', marginBottom: '1rem' }}>The Engine Behind Revenue Growth</h3>
                <p style={{ marginBottom: '1rem', lineHeight: 1.7 }}>
                  GTM Operations (also known as Revenue Operations or RevOps) is the operational backbone that connects 
                  your Marketing, Sales, and Customer Success teams. It's the systems, processes, and data infrastructure 
                  that turns strategy into execution.
                </p>
                
                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontWeight: 600 }}>Everything Data</h4>
                <p style={{ marginBottom: '1rem', lineHeight: 1.7 }}>
                  From lead enrichment to customer health scores, GTM Ops ensures your data is clean, connected, and actionable. 
                  We build the pipelines that turn raw data into revenue intelligence.
                </p>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontWeight: 600 }}>Processes & Workflows</h4>
                <p style={{ marginBottom: '1rem', lineHeight: 1.7 }}>
                  Lead routing, opportunity management, renewal tracking, and more. We design and implement the workflows 
                  that keep your revenue engine running smoothly.
                </p>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontWeight: 600 }}>Technology Stack</h4>
                <p style={{ lineHeight: 1.7 }}>
                  CRM, Marketing Automation, Sales Engagement, Customer Success platforms — we implement, integrate, 
                  and optimize your entire GTM tech stack.
                </p>
              </div>
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#f3f4f6', padding: '1.25rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#7c3aed' }}>148</div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>Services Available</div>
                  </div>
                  <div style={{ background: '#f3f4f6', padding: '1.25rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#7c3aed' }}>68</div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>Detailed Playbooks</div>
                  </div>
                </div>
                <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '0.5rem', overflow: 'hidden' }}>
                  <ImageZoom
                    src="/images/gtm-ops-screenshot.png"
                    alt="GTM Ops Matrix - The Full Stack View"
                  />
                </div>
              </div>
            </div>
            <div style={{ marginTop: '2rem', borderRadius: '12px', overflow: 'hidden' }}>
              <ImageZoom
                src="/images/gtm-ops-projects-screenshot.png"
                alt="LeanScale GTM Ops Projects by Function"
              />
            </div>
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link href={customerPath('/why-leanscale/services')}>
                <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                  View Full Services Catalog →
                </button>
              </Link>
            </div>
          </div>
        </section>

        <section id="in-house-vs-partner" style={{ marginBottom: '4rem', scrollMarginTop: '100px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚖️</span> In-House vs Partner
          </h2>
          <div className="card" style={{ padding: '2rem' }}>
            <p style={{ marginBottom: '2rem', lineHeight: 1.7, maxWidth: '800px' }}>
              The build vs. buy decision is critical for startups. Here's why partnering with LeanScale gives you 
              the best of both worlds — expertise, speed, and cost efficiency.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1.5rem', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                <h4 style={{ color: '#dc2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🏠</span> Building In-House
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0 }}>❌</span>
                    6-12 months to hire and ramp
                  </li>
                  <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0 }}>❌</span>
                    $200-400K+ annual fully-loaded cost
                  </li>
                  <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0 }}>❌</span>
                    Single point of failure risk
                  </li>
                  <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0 }}>❌</span>
                    Limited cross-company experience
                  </li>
                  <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0 }}>❌</span>
                    Scaling requires more hiring
                  </li>
                </ul>
              </div>
              <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #86efac' }}>
                <h4 style={{ color: '#16a34a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🤝</span> Partnering with LeanScale
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0 }}>✅</span>
                    Operational in 2-4 weeks
                  </li>
                  <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0 }}>✅</span>
                    Predictable monthly investment
                  </li>
                  <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0 }}>✅</span>
                    Full team with built-in redundancy
                  </li>
                  <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0 }}>✅</span>
                    100+ company implementations
                  </li>
                  <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0 }}>✅</span>
                    Flex capacity up or down instantly
                  </li>
                </ul>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#e9d8f4', borderRadius: '12px', padding: '0.5rem', overflow: 'hidden' }}>
                <ImageZoom
                  src="/images/in-house-vs-partner-screenshot.png"
                  alt="In-House vs LeanScale Comparison"
                />
              </div>
              <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '0.5rem', overflow: 'hidden' }}>
                <ImageZoom
                  src="/images/grow-efficiently-screenshot.png"
                  alt="Grow quickly and efficiently through each stage"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="pod-structure" style={{ marginBottom: '4rem', scrollMarginTop: '100px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>👥</span> LeanScale GTM Pod Structure
          </h2>
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h3 style={{ color: '#7c3aed', marginBottom: '0.5rem' }}>Build The Best B2B GTM Ops Org</h3>
              <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                Every LeanScale engagement includes a dedicated pod of specialists, not generalists.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f3f4f6', borderRadius: '12px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
                <h4 style={{ marginBottom: '0.5rem', color: '#7c3aed' }}>GTM Architect</h4>
                <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                  Strategic leadership, roadmap planning, and executive alignment
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f3f4f6', borderRadius: '12px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚙️</div>
                <h4 style={{ marginBottom: '0.5rem', color: '#7c3aed' }}>GTM Engineer</h4>
                <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                  System implementation, integrations, and technical execution
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f3f4f6', borderRadius: '12px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
                <h4 style={{ marginBottom: '0.5rem', color: '#7c3aed' }}>Data Analyst</h4>
                <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                  Reporting, analytics, and data quality management
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f3f4f6', borderRadius: '12px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛠️</div>
                <h4 style={{ marginBottom: '0.5rem', color: '#7c3aed' }}>Ops Specialist</h4>
                <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                  Day-to-day operations, admin, and process optimization
                </p>
              </div>
            </div>

            <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '0.5rem', overflow: 'hidden' }}>
              <ImageZoom
                src="/images/pod-structure-screenshot.png"
                alt="Build The Best 0 FTE GTM Ops Org"
              />
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link href={customerPath('/buy-leanscale/team')}>
                <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                  Meet Your Team →
                </button>
              </Link>
            </div>
          </div>
        </section>

        <section id="working-with-leanscale" style={{ marginBottom: '4rem', scrollMarginTop: '100px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🤝</span> Working with LeanScale
          </h2>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ color: '#7c3aed', marginBottom: '1.5rem', textAlign: 'center' }}>
              A Week in the Life with your LeanScale Team
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1.25rem', borderLeft: '4px solid #7c3aed', background: '#faf5ff' }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#7c3aed' }}>📅 Monday: Kickoff & Planning</h4>
                <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                  Weekly sync with your GTM Architect to review priorities, blockers, and align on the week's goals.
                </p>
              </div>
              <div style={{ padding: '1.25rem', borderLeft: '4px solid #22c55e', background: '#f0fdf4' }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#16a34a' }}>🔧 Tues-Thurs: Execution</h4>
                <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                  Engineers and specialists execute on projects, with async updates via Slack and your project board.
                </p>
              </div>
              <div style={{ padding: '1.25rem', borderLeft: '4px solid #eab308', background: '#fefce8' }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#ca8a04' }}>📊 Friday: Review & Report</h4>
                <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                  End-of-week summary with completed work, metrics updates, and next week's preview.
                </p>
              </div>
            </div>

            <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '0.5rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <ImageZoom
                src="/images/working-with-leanscale-screenshot.png"
                alt="A Week in the Life with your LeanScale Team"
              />
            </div>

            <div style={{ background: '#f3f4f6', borderRadius: '12px', padding: '0.5rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <ImageZoom
                src="/images/highest-value-projects-screenshot.png"
                alt="Quickly Address Poor Performance With The Highest Value Projects"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Response Time</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed' }}>&lt; 4 hours</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Weekly Syncs</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed' }}>1-2 calls</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Communication</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed' }}>Slack + Loom</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Project Tracking</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed' }}>Shared Board</div>
              </div>
            </div>
          </div>
        </section>

        <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', color: 'white', textAlign: 'center', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>Ready to Accelerate Your GTM?</h3>
          <p style={{ margin: '0 0 1.5rem 0', opacity: 0.9 }}>Start with a GTM Diagnostic or schedule time to discuss your needs.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={customerPath('/try-leanscale')}>
              <button className="btn" style={{ background: 'white', color: '#7c3aed', border: 'none', padding: '0.75rem 1.5rem', fontWeight: 600 }}>
                Start GTM Diagnostic
              </button>
            </Link>
            <Link href={customerPath('/buy-leanscale')}>
              <button className="btn" style={{ background: 'transparent', color: 'white', border: '2px solid white', padding: '0.75rem 1.5rem' }}>
                Start Engagement
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
