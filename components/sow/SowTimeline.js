/**
 * SowTimeline - Weekly Gantt chart of SOW sections
 *
 * Renders sections as a CSS Grid Gantt chart with weekly columns,
 * function-based color coding, and date labels.
 *
 * Props:
 *   sections - Array of sow_sections with start_date, end_date, title
 */

const functionColors = {
  'Cross Functional': { bg: '#e0e7ff', border: '#818cf8' },
  'Marketing': { bg: '#dcfce7', border: '#4ade80' },
  'Sales': { bg: '#fef3c7', border: '#fbbf24' },
  'Customer Success': { bg: '#fce7f3', border: '#f472b6' },
  'Partnerships': { bg: '#dbeafe', border: '#60a5fa' },
  'General': { bg: '#f3f4f6', border: '#9ca3af' },
};

export default function SowTimeline({ sections = [] }) {
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

  // Calculate date range
  const allDates = dated.flatMap(s => [new Date(s.start_date), new Date(s.end_date)]);
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));

  // Snap minDate to start of its week (Monday)
  const dayOfWeek = minDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(minDate);
  weekStart.setDate(weekStart.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);

  // Calculate total weeks
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const totalWeeks = Math.max(Math.ceil((maxDate - weekStart) / msPerWeek) + 1, 1);
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  // Week label helper
  const getWeekDate = (weekNum) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + (weekNum - 1) * 7);
    return d;
  };

  const getWeekLabel = (weekNum) => {
    const d = getWeekDate(weekNum);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Map section to week range
  const getSectionWeeks = (section) => {
    const start = new Date(section.start_date);
    const end = new Date(section.end_date);
    const startWeek = Math.floor((start - weekStart) / msPerWeek) + 1;
    const endWeek = Math.ceil((end - weekStart) / msPerWeek) + 1;
    return { startWeek: Math.max(startWeek, 1), endWeek: Math.min(endWeek, totalWeeks) };
  };

  // Determine which functions are present (for legend)
  const presentFunctions = [...new Set(dated.map(s => s.title))].filter(f => functionColors[f]);

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '0.75rem',
      padding: '1.25rem',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: `${280 + totalWeeks * 40}px` }}>
          {/* Header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `280px repeat(${totalWeeks}, 1fr)`,
            gap: '2px',
            marginBottom: '0.5rem',
          }}>
            <div style={{ fontWeight: 600, fontSize: '0.75rem', padding: '0.5rem', color: '#4A5568' }}>
              Section
            </div>
            {weeks.map(week => (
              <div key={week} style={{
                fontSize: '0.6rem',
                textAlign: 'center',
                padding: '0.25rem',
                background: week % 2 === 0 ? '#f9fafb' : '#fff',
                borderRadius: '2px',
                color: '#718096',
              }}>
                {week % 4 === 1 ? getWeekLabel(week) : ''}
              </div>
            ))}
          </div>

          {/* Section rows */}
          {dated.map((section, idx) => {
            const { startWeek, endWeek } = getSectionWeeks(section);
            const colors = functionColors[section.title] || functionColors['General'];
            const durationWeeks = endWeek - startWeek + 1;

            return (
              <div key={section.id || idx} style={{
                display: 'grid',
                gridTemplateColumns: `280px repeat(${totalWeeks}, 1fr)`,
                gap: '2px',
                marginBottom: '4px',
              }}>
                {/* Section title */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#4A5568',
                }}>
                  <div style={{
                    width: 4,
                    height: 20,
                    background: colors.border,
                    borderRadius: '2px',
                    flexShrink: 0,
                  }} />
                  <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 500,
                  }}>
                    {section.title}
                  </span>
                  {section.hours && (
                    <span style={{ fontSize: '0.65rem', color: '#A0AEC0', flexShrink: 0 }}>
                      {parseFloat(section.hours)}h
                    </span>
                  )}
                </div>

                {/* Week cells */}
                {weeks.map(week => {
                  const isActive = week >= startWeek && week <= endWeek;
                  const isStart = week === startWeek;
                  const isEnd = week === endWeek;

                  return (
                    <div
                      key={week}
                      style={{
                        height: '28px',
                        background: isActive
                          ? colors.bg
                          : week % 2 === 0 ? '#f9fafb' : '#fff',
                        borderLeft: isStart ? `3px solid ${colors.border}` : 'none',
                        borderRight: isEnd ? `3px solid ${colors.border}` : 'none',
                        borderRadius: isStart && isEnd
                          ? '4px'
                          : isStart
                            ? '4px 0 0 4px'
                            : isEnd
                              ? '0 4px 4px 0'
                              : '0',
                      }}
                      title={isActive ? `${section.title}: Week ${week - startWeek + 1} of ${durationWeeks}` : ''}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Color legend */}
      {presentFunctions.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #EDF2F7',
          flexWrap: 'wrap',
        }}>
          {presentFunctions.map(func => {
            const colors = functionColors[func];
            return (
              <div key={func} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#4A5568' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  background: colors.bg,
                  border: `2px solid ${colors.border}`,
                  borderRadius: '3px',
                }} />
                <span>{func}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Date range footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '0.5rem',
        fontSize: '0.7rem',
        color: '#A0AEC0',
      }}>
        <span>{minDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        <span>{maxDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
      </div>
    </div>
  );
}
