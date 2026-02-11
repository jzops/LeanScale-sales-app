/**
 * DiagnosticSkeleton — Pulse-animated loading placeholder
 * for the diagnostic results page.
 */
export default function DiagnosticSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Hero skeleton */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-6)',
        padding: 'var(--space-8)',
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
      }}>
        {/* Score ring placeholder */}
        <div className="skeleton" style={{ width: 120, height: 120, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="skeleton" style={{ height: 24, width: '60%', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: 14, width: '40%', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: 10, width: '100%', borderRadius: 'var(--radius-full)' }} />
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: 28, width: 64, borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Nav skeleton */}
      <div className="skeleton" style={{ height: 44, borderRadius: 'var(--radius-lg)' }} />

      {/* Section skeletons */}
      {[1, 2, 3].map(section => (
        <div key={section} style={{
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="skeleton" style={{ height: 20, width: 140, borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton" style={{ height: 14, width: 60, borderRadius: 'var(--radius-md)' }} />
          </div>
          <div className="priority-section-grid">
            {[1, 2, 3].map(card => (
              <div key={card} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
