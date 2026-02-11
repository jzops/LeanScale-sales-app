/**
 * VersionHistory - List of exported SOW versions with download links
 *
 * Props:
 *   versions       - Array of sow_versions objects
 *   currentVersion - Current version number on the SOW
 *   sowId          - SOW id (for building download URLs)
 *   onExport()     - Callback to trigger a new export
 *   readOnly       - If true, hide export button (customer view)
 */

export default function VersionHistory({
  versions = [],
  currentVersion = 0,
  sowId,
  onExport,
  readOnly = false,
}) {
  if (versions.length === 0 && readOnly) {
    return null; // Don't show empty version history to customers
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '0.75rem',
      padding: '1.25rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: versions.length > 0 ? '1rem' : 0,
      }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
          Version History
        </h3>
        {!readOnly && (
          <button
            onClick={onExport}
            style={{
              padding: '0.35rem 0.75rem',
              background: '#6C5CE7',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Export PDF
          </button>
        )}
      </div>

      {versions.length === 0 ? (
        <p style={{ fontSize: '0.8rem', color: '#A0AEC0', margin: 0 }}>
          No exports yet. Export a PDF to create the first version.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {versions.map((v) => (
            <div key={v.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.625rem 0.75rem',
              background: '#F7FAFC',
              borderRadius: '0.375rem',
              border: '1px solid #EDF2F7',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#6C5CE7',
                  background: '#EDE9FE',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '0.25rem',
                }}>
                  v{v.version_number}
                </span>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#4A5568' }}>
                    {new Date(v.exported_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  {v.exported_by && (
                    <div style={{ fontSize: '0.7rem', color: '#A0AEC0' }}>
                      by {v.exported_by}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {sowId && (
                  <a
                    href={`/api/sow/${sowId}/versions/${v.id}?pdf=true`}
                    style={{
                      fontSize: '0.75rem',
                      color: '#6C5CE7',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
