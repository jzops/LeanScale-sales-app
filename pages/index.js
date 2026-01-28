import Link from 'next/link';
import Layout from '../components/Layout';
import customerConfig from '../data/customer-config';

export default function Home() {
  return (
    <Layout title="LeanScale">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 800,
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem',
          }}>
            LeanScale
          </h1>
          <p className="hero-tagline">
            Accelerate Your Go-To-Market with Top-Tier GTM Operations
          </p>
        </div>
      </div>

      <div className="container">
        {/* TL;DR Section */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>tl;dr</h2>
          <ul style={{ lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li>Founded in 2021</li>
            <li>GTM Ops firm for B2B companies</li>
            <li>Work w/ lean, hypergrowth teams—Mistral, Clio, Anrok, Portnox, etc</li>
            <li>25+ full-time team members</li>
            <li>Premier partner for Salesforce, Hubspot, Clay and hundreds of other GTM Systems</li>
          </ul>
        </section>

        {/* Quick Links */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {/* Why LeanScale? */}
            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--ls-purple)' }}>Why LeanScale?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/why-leanscale/about" className="button-pill">About Us</Link>
                <Link href="/why-leanscale/resources" className="button-pill">Key Resources</Link>
                <Link href="/why-leanscale/references" className="button-pill">Customer References</Link>
              </div>
            </div>

            {/* Try LeanScale */}
            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--ls-purple)' }}>Try LeanScale</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/why-leanscale/services" className="button-pill">Services Catalog</Link>
                <Link href="/try-leanscale/start" className="button-pill">Start Diagnostic</Link>
                <Link href="/try-leanscale/diagnostic" className="button-pill">GTM Diagnostic Demo</Link>
              </div>
            </div>

            {/* Buy LeanScale */}
            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--ls-purple)' }}>Buy LeanScale</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/buy-leanscale" className="button-pill">Getting Started</Link>
                <Link href="/buy-leanscale/investor-perks" className="button-pill">Investor Perks</Link>
                <Link href="/buy-leanscale/clay" className="button-pill">Clay x LeanScale</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Video Section */}
        {customerConfig.youtubeVideoId && !customerConfig.youtubeVideoId.includes('YOUR_') && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>LeanScale Overview</h2>
            <div className="video-container">
              <iframe
                src={`https://www.youtube.com/embed/${customerConfig.youtubeVideoId}`}
                title="LeanScale Overview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Google Slides Embed */}
        {customerConfig.googleSlidesEmbedUrl && !customerConfig.googleSlidesEmbedUrl.includes('YOUR_') && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>LeanScale Deck</h2>
            <div className="video-container">
              <iframe
                src={customerConfig.googleSlidesEmbedUrl}
                title="LeanScale Deck"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Testimonial */}
        <section style={{ marginBottom: '3rem' }}>
          <div className="card" style={{ maxWidth: 600 }}>
            <p style={{ fontStyle: 'italic', marginBottom: '1rem', lineHeight: 1.6 }}>
              &quot;LeanScale is constantly improving and bringing new ideas to our team. They become part of your team, trustworthy partners.&quot;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div 
                style={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--ls-purple) 0%, #8B5CF6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1.25rem'
                }}
              >
                RL
              </div>
              <p style={{ fontWeight: 600, margin: 0 }}>
                — <a href="https://www.linkedin.com/in/rafaelloureiro/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ls-purple)', textDecoration: 'none' }}>Rafael</a>, Wealth CEO
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
