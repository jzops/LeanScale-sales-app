import Link from 'next/link';
import Layout from '../components/Layout';
import customerConfig from '../data/customer-config';

export default function Home() {
  return (
    <Layout title="LeanScale">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <img
            src="/leanscale-logo.svg"
            alt="LeanScale"
            className="hero-logo"
          />
          <h1 className="hero-tagline">
            Accelerate Your Go-To-Market with Top-Tier GTM Operations
          </h1>
        </div>
      </div>

      <div className="container">
        {/* TL;DR Section */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>tl;dr</h2>
          <ul style={{ lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li>LeanScale provides fractional GTM Operations teams for B2B tech startups</li>
            <li>We&apos;ve supported 100+ startups across Series A through IPO</li>
            <li>Our team combines startup operator experience with deep technical expertise</li>
            <li>We help you build scalable revenue infrastructure, not just fix point problems</li>
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
                <Link href="/try-leanscale/start" className="button-pill">Start Diagnostic</Link>
                <Link href="/why-leanscale/services" className="button-pill">Services Catalog</Link>
                <Link href="/try-leanscale/diagnostic" className="button-pill">GTM Diagnostic Demo</Link>
              </div>
            </div>

            {/* Buy LeanScale */}
            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--ls-purple)' }}>Buy LeanScale</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/buy-leanscale/investor-perks" className="button-pill">Investor Perks</Link>
                <Link href="/buy-leanscale/calculator" className="button-pill">Engagement Calculator</Link>
                <Link href="/buy-leanscale/start" className="button-pill">Getting Started</Link>
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
              <img 
                src="https://unavatar.io/linkedin/rafaelloureiro" 
                alt="Rafael Loureiro"
                style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }}
              />
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
