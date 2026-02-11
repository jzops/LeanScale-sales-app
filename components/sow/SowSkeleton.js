/**
 * SowSkeleton — Pulse-animated loading placeholder
 * for the SOW detail page.
 */
export default function SowSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header skeleton */}
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div className="skeleton" style={{ height: 28, width: '50%', borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton" style={{ height: 14, width: '30%', borderRadius: 'var(--radius-md)' }} />
          </div>
          <div className="skeleton" style={{ height: 32, width: 80, borderRadius: 'var(--radius-full)' }} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 48, flex: 1, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      </div>

      {/* Executive summary skeleton */}
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        padding: 'var(--space-6)',
      }}>
        <div className="skeleton" style={{ height: 20, width: 180, marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton" style={{ height: 14, width: '100%', marginBottom: 'var(--space-2)', borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton" style={{ height: 14, width: '85%', marginBottom: 'var(--space-2)', borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton" style={{ height: 14, width: '70%', borderRadius: 'var(--radius-md)' }} />
      </div>

      {/* Scope sections skeleton */}
      {[1, 2].map(section => (
        <div key={section} style={{
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          borderLeft: '4px solid var(--gray-200)',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}>
          <div className="skeleton" style={{ height: 22, width: '45%', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: 14, width: '100%', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: 14, width: '80%', borderRadius: 'var(--radius-md)' }} />
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <div className="skeleton" style={{ height: 36, width: 100, borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton" style={{ height: 36, width: 100, borderRadius: 'var(--radius-md)' }} />
          </div>
        </div>
      ))}

      {/* Investment table skeleton */}
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        padding: 'var(--space-6)',
      }}>
        <div className="skeleton" style={{ height: 20, width: 200, marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-md)' }} />
        {[1, 2, 3, 4].map(row => (
          <div key={row} className="skeleton" style={{ height: 36, width: '100%', marginBottom: 'var(--space-2)', borderRadius: 'var(--radius-md)' }} />
        ))}
      </div>
    </div>
  );
}
