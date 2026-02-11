/**
 * SowTimeline - Visual horizontal timeline of SOW sections
 *
 * Renders section dates as a horizontal bar chart showing relative
 * positioning and duration of each section.
 *
 * Props:
 *   sections - Array of sow_sections with start_date, end_date, title
 */

export default function SowTimeline({ sections = [] }) {
  // Filter sections with dates
  const dated = sections.filter(s => s.start_date && s.end_date);

  if (dated.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#A0AEC0',
        fontSize: '0.875rem',
        border: '1px solid #E2E8F0',
        borderRadius: '0.75rem',
        background: 'white',
      }}>
        No timeline data — add dates to sections in the builder.
      </div>
    );
  }

  // Calculate range
  const allDates = dated.flatMap(s => [new Date(s.start_date), new Date(s.end_date)]);
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const totalDays = Math.max((maxDate - minDate) / (1000 * 60 * 60 * 24), 1);

  // Color palette for sections
  const colors = ['#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#0984E3', '#A29BFE'];

  // Generate month markers
  const months = [];
  const cursor = new Date(minDate);
  cursor.setDate(1);
  while (cursor <= maxDate) {
    const dayOffset = (cursor - minDate) / (1000 * 60 * 60 * 24);
    const pct = (dayOffset / totalDays) * 100;
    if (pct >= 0 && pct <= 100) {
      months.push({
        label: cursor.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        pct,
      });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '0.75rem',
      padding: '1.25rem',
    }}>
      {/* Month markers */}
      <div style={{ position: 'relative', height: '1.5rem', marginBottom: '0.5rem' }}>
        {months.map((m, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${m.pct}%`,
              fontSize: '0.65rem',
              color: '#A0AEC0',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
            }}
          >
            {m.label}
          </div>
        ))}
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {dated.map((section, idx) => {
          const startOffset = (new Date(section.start_date) - minDate) / (1000 * 60 * 60 * 24);
          const endOffset = (new Date(section.end_date) - minDate) / (1000 * 60 * 60 * 24);
          const leftPct = (startOffset / totalDays) * 100;
          const widthPct = Math.max(((endOffset - startOffset) / totalDays) * 100, 2);
          const color = colors[idx % colors.length];

          const startStr = new Date(section.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const endStr = new Date(section.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <div key={section.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Label */}
              <div style={{
                width: '140px',
                flexShrink: 0,
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#4A5568',
                textAlign: 'right',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {section.title}
              </div>

              {/* Bar container */}
              <div style={{
                flex: 1,
                position: 'relative',
                height: '28px',
                background: '#F7FAFC',
                borderRadius: '0.25rem',
                overflow: 'hidden',
              }}>
                {/* Month grid lines */}
                {months.map((m, mIdx) => (
                  <div
                    key={mIdx}
                    style={{
                      position: 'absolute',
                      left: `${m.pct}%`,
                      top: 0,
                      bottom: 0,
                      width: '1px',
                      background: '#EDF2F7',
                    }}
                  />
                ))}

                {/* Section bar */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    top: '3px',
                    bottom: '3px',
                    background: color,
                    borderRadius: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                  title={`${section.title}: ${startStr} - ${endStr}`}
                >
                  {widthPct > 15 && (
                    <span style={{
                      fontSize: '0.6rem',
                      color: 'white',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      padding: '0 0.25rem',
                    }}>
                      {startStr} - {endStr}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Date range footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '0.75rem',
        fontSize: '0.7rem',
        color: '#A0AEC0',
      }}>
        <span>{minDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        <span>{maxDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
      </div>
    </div>
  );
}
