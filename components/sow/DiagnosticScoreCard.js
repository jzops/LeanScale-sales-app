/**
 * DiagnosticScoreCard - Mini diagnostic health summary for SOW pages
 *
 * Shows a donut chart of status distribution from linked diagnostic items,
 * with a link to the full diagnostic page.
 *
 * Props:
 *   diagnosticItems  - Array of { name, status, ... } from diagnostic_results.processes
 *   diagnosticType   - 'gtm' | 'clay' | 'cpq' (for linking)
 *   customerSlug     - Customer slug for building diagnostic URL (optional)
 *   overallRating    - 'critical' | 'warning' | 'moderate' | 'healthy'
 */

import Link from 'next/link';

const STATUS_COLORS = {
  healthy: '#22c55e',
  careful: '#eab308',
  warning: '#ef4444',
  unable: '#1f2937',
};

const RATING_CONFIG = {
  critical: { color: '#DC2626', bg: '#FEF2F2', label: 'Critical' },
  warning: { color: '#D97706', bg: '#FFFBEB', label: 'Needs Attention' },
  moderate: { color: '#2563EB', bg: '#EFF6FF', label: 'Moderate' },
  healthy: { color: '#16A34A', bg: '#F0FDF4', label: 'Healthy' },
};

export default function DiagnosticScoreCard({
  diagnosticItems = [],
  diagnosticType = 'gtm',
  customerSlug,
  customerPath,
  overallRating = 'moderate',
}) {
  // Count statuses
  const counts = { healthy: 0, careful: 0, warning: 0, unable: 0 };
  diagnosticItems.forEach(item => {
    if (counts[item.status] !== undefined) counts[item.status]++;
  });
  const total = diagnosticItems.length;

  const rating = RATING_CONFIG[overallRating] || RATING_CONFIG.moderate;

  // Build diagnostic link
  const diagnosticTypeToPath = {
    gtm: 'diagnostic',
    clay: 'clay-diagnostic',
    cpq: 'cpq-diagnostic',
  };
  const diagPathSegment = diagnosticTypeToPath[diagnosticType] || 'diagnostic';
  const tryPath = `/try-leanscale/${diagPathSegment}`;
  const diagUrl = customerPath ? customerPath(tryPath) : tryPath;

  // Mini donut chart via SVG
  const segments = Object.entries(counts).filter(([, v]) => v > 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = segments.map(([status, count]) => {
    const pct = count / (total || 1);
    const length = pct * circumference;
    const arc = {
      status,
      count,
      pct,
      dasharray: `${length} ${circumference - length}`,
      dashoffset: -offset,
      color: STATUS_COLORS[status],
    };
    offset += length;
    return arc;
  });

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
        marginBottom: '1rem',
      }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
          Diagnostic Score
        </h3>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: rating.color,
          background: rating.bg,
          padding: '0.2rem 0.625rem',
          borderRadius: '9999px',
        }}>
          {rating.label}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        {/* Mini donut */}
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ flexShrink: 0 }}>
          {/* Background ring */}
          <circle cx="48" cy="48" r={radius} fill="none" stroke="#EDF2F7" strokeWidth="10" />
          {/* Status arcs */}
          {arcs.map((arc) => (
            <circle
              key={arc.status}
              cx="48" cy="48" r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth="10"
              strokeDasharray={arc.dasharray}
              strokeDashoffset={arc.dashoffset}
              strokeLinecap="butt"
              transform="rotate(-90 48 48)"
            />
          ))}
          {/* Center text */}
          <text x="48" y="44" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1a1a2e">
            {total}
          </text>
          <text x="48" y="58" textAnchor="middle" fontSize="9" fill="#718096">
            items
          </text>
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
          {Object.entries(counts).map(([status, count]) => (
            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: STATUS_COLORS[status],
                  display: 'inline-block',
                }} />
                <span style={{ fontSize: '0.75rem', color: '#4A5568', textTransform: 'capitalize' }}>
                  {status}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1a1a2e' }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Link to diagnostic */}
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link href={diagUrl} style={{
          fontSize: '0.75rem',
          color: '#6C5CE7',
          textDecoration: 'none',
          fontWeight: 500,
        }}>
          View Full Diagnostic →
        </Link>
      </div>
    </div>
  );
}
