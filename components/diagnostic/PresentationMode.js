import { useState, useEffect, useCallback, useMemo } from 'react';
import PresentationControls from './PresentationControls';
import { countStatuses, groupBy } from '../../data/diagnostic-data';
import { getStatusColor } from './StatusLegend';

/* ──────────── helper: simple donut via SVG ──────────── */
function PresentationDonut({ stats, size = 220, label }) {
  const total = stats.healthy + stats.careful + stats.warning + stats.unable + (stats.na || 0);
  if (total === 0) return null;
  const scorable = total - (stats.na || 0);
  const healthPct = scorable > 0 ? Math.round((stats.healthy / scorable) * 100) : 0;

  const segments = [
    { value: stats.healthy, color: '#22c55e' },
    { value: stats.careful, color: '#eab308' },
    { value: stats.warning, color: '#ef4444' },
    { value: stats.unable, color: '#6b7280' },
  ].filter(s => s.value > 0);

  const r = 42;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circ;
          const o = offset;
          offset += dash;
          return (
            <circle
              key={i}
              cx="50" cy="50" r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-o}
              style={{ transition: 'stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease' }}
            />
          );
        })}
        <text x="50" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">
          {healthPct}%
        </text>
        <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7">
          Health Score
        </text>
      </svg>
      {label && <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{label}</div>}
    </div>
  );
}

/* ──────────── health bar ──────────── */
function HealthBar({ stats, height = 12 }) {
  const total = stats.healthy + stats.careful + stats.warning + stats.unable;
  if (total === 0) return null;
  const segs = [
    { value: stats.healthy, color: '#22c55e' },
    { value: stats.careful, color: '#eab308' },
    { value: stats.warning, color: '#ef4444' },
    { value: stats.unable, color: '#6b7280' },
  ];
  return (
    <div style={{ display: 'flex', height, borderRadius: 6, overflow: 'hidden', width: '100%' }}>
      {segs.map((s, i) => s.value > 0 ? (
        <div key={i} style={{ width: `${(s.value / total) * 100}%`, background: s.color, transition: 'width 0.6s ease' }} />
      ) : null)}
    </div>
  );
}

/* ──────────── status dot ──────────── */
function Dot({ status, size = 10 }) {
  const colors = { healthy: '#22c55e', careful: '#eab308', warning: '#ef4444', unable: '#6b7280', na: '#9ca3af' };
  return <span style={{ width: size, height: size, borderRadius: '50%', background: colors[status] || '#9ca3af', display: 'inline-block', flexShrink: 0 }} />;
}

/* ──────────── SLIDE COMPONENTS ──────────── */

function SlideOverview({ companyName, date, stats, totalProcesses }) {
  return (
    <div className="pres-slide-content pres-slide-center">
      <div style={{ opacity: 0.5, fontSize: '1rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
        GTM Diagnostic Assessment
      </div>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        {companyName || 'Company'}
      </h1>
      <div style={{ fontSize: '1.1rem', opacity: 0.6, marginBottom: '2.5rem' }}>{date}</div>
      <PresentationDonut stats={stats} size={240} label={`${totalProcesses} processes assessed`} />
    </div>
  );
}

function SlideFunctionSummary({ functionGroups, categories }) {
  return (
    <div className="pres-slide-content">
      <h2 className="pres-slide-title">Function Summary</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {categories.map((cat) => {
          const items = functionGroups[cat] || [];
          if (items.length === 0) return null;
          const stats = countStatuses(items);
          const priority = items.filter(i => i.addToEngagement).length;
          const warnings = stats.warning + stats.unable;
          return (
            <div key={cat} className="pres-func-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{cat}</h3>
                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{items.length} items</span>
              </div>
              <HealthBar stats={stats} />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', opacity: 0.8 }}>
                <span style={{ color: '#22c55e' }}>✓ {stats.healthy} healthy</span>
                {warnings > 0 && <span style={{ color: '#ef4444' }}>⚠ {warnings} need attention</span>}
                {priority > 0 && <span style={{ color: '#facc15' }}>★ {priority} priority</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlideFunctionDeepDive({ functionName, items }) {
  if (!items || items.length === 0) {
    return (
      <div className="pres-slide-content pres-slide-center">
        <h2 className="pres-slide-title">{functionName}</h2>
        <p style={{ opacity: 0.5 }}>No processes in this function</p>
      </div>
    );
  }
  return (
    <div className="pres-slide-content">
      <h2 className="pres-slide-title">{functionName}</h2>
      <div className="pres-items-grid">
        {items.map((item) => (
          <div key={item.name} className="pres-item-row">
            <Dot status={item.status} />
            <span style={{ flex: 1 }}>{item.name}</span>
            {item.addToEngagement && <span className="pres-priority-badge">Priority</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SlidePriorityItems({ processes }) {
  const priority = processes
    .filter(p => p.addToEngagement || p.status === 'warning' || p.status === 'unable')
    .sort((a, b) => {
      const order = { unable: 0, warning: 1, careful: 2, healthy: 3, na: 4 };
      if (a.addToEngagement && !b.addToEngagement) return -1;
      if (!a.addToEngagement && b.addToEngagement) return 1;
      return (order[a.status] || 4) - (order[b.status] || 4);
    })
    .slice(0, 10);

  return (
    <div className="pres-slide-content">
      <h2 className="pres-slide-title">Priority Items</h2>
      <p style={{ opacity: 0.6, marginBottom: '1.5rem' }}>Top items requiring immediate attention</p>
      <div className="pres-items-grid">
        {priority.map((item, i) => (
          <div key={item.name} className="pres-item-row">
            <span style={{ fontSize: '1.2rem', fontWeight: 700, opacity: 0.4, width: 28, textAlign: 'center' }}>{i + 1}</span>
            <Dot status={item.status} />
            <span style={{ flex: 1 }}>{item.name}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{item.function}</span>
            {item.addToEngagement && <span className="pres-priority-badge">Priority</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideRecommendations({ processes, companyName }) {
  const priorityCount = processes.filter(p => p.addToEngagement).length;
  const warningCount = processes.filter(p => p.status === 'warning' || p.status === 'unable').length;

  let tier, investment;
  if (priorityCount >= 10) {
    tier = 'Full GTM Transformation';
    investment = '$15,000 – $25,000/mo';
  } else if (priorityCount >= 5) {
    tier = 'Strategic RevOps Engagement';
    investment = '$8,000 – $15,000/mo';
  } else {
    tier = 'Targeted Project Sprint';
    investment = '$5,000 – $10,000/mo';
  }

  return (
    <div className="pres-slide-content pres-slide-center">
      <h2 className="pres-slide-title">Recommended Engagement</h2>
      <div className="pres-rec-card" style={{ marginTop: '2rem' }}>
        <div style={{ fontSize: '0.85rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          Suggested Tier
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>{tier}</div>
        <div style={{ fontSize: '1.3rem', color: '#a78bfa', fontWeight: 600, marginBottom: '2rem' }}>{investment}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', fontSize: '0.9rem' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{priorityCount}</div>
            <div style={{ opacity: 0.6 }}>Priority Items</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{warningCount}</div>
            <div style={{ opacity: 0.6 }}>Items at Risk</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{processes.length}</div>
            <div style={{ opacity: 0.6 }}>Total Assessed</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '2.5rem', fontSize: '1.1rem', opacity: 0.7 }}>
        Next Steps: Discovery deep-dive → SOW build → Kick-off within 2 weeks
      </div>
    </div>
  );
}

/* ──────────── PRESENTER NOTES ──────────── */
const SLIDE_NOTES = [
  'Welcome the client. Set expectations: 15-min walkthrough of their GTM health. Mention this is based on their specific data.',
  'Walk through each function at a high level. Highlight which areas are strongest and which need the most work.',
  'Deep dive: Cross Functional processes. These are foundational — if these are broken, everything downstream suffers.',
  'Deep dive: Marketing. Focus on lead flow, attribution, and automation maturity.',
  'Deep dive: Sales. Focus on pipeline management, forecasting, and sales process consistency.',
  'Deep dive: Customer Success. Focus on retention, health scoring, and onboarding.',
  'Deep dive: Partnerships. Often overlooked but critical for PLG and channel motions.',
  'Priority items — these are the "quick wins" and "must fixes". Tie each to a business outcome.',
  'Close with recommendation. Ask: "Does this align with where you feel the gaps are?" Transition to next steps.',
];

/* ──────────── MAIN COMPONENT ──────────── */
export default function PresentationMode({
  processes,
  companyName,
  categories,
  notes = [],
  onExit,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [direction, setDirection] = useState(0); // -1 left, 1 right, 0 initial

  const functionGroups = useMemo(() => groupBy(processes, 'function'), [processes]);
  const allStats = useMemo(() => countStatuses(processes), [processes]);
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Build slide list: overview, summary, one per category, priority, recommendations
  const slides = useMemo(() => {
    const s = [
      { type: 'overview' },
      { type: 'summary' },
    ];
    (categories || []).forEach(cat => {
      s.push({ type: 'deepdive', functionName: cat });
    });
    s.push({ type: 'priority' });
    s.push({ type: 'recommendations' });
    return s;
  }, [categories]);

  const totalSlides = slides.length;

  const slideLabels = useMemo(() =>
    slides.map((s, i) => {
      if (s.type === 'overview') return 'Overview';
      if (s.type === 'summary') return 'Function Summary';
      if (s.type === 'deepdive') return s.functionName;
      if (s.type === 'priority') return 'Priority Items';
      return 'Recommendations';
    }),
  [slides]);

  const goTo = useCallback((idx) => {
    setDirection(idx > currentSlide ? 1 : -1);
    setCurrentSlide(Math.max(0, Math.min(idx, totalSlides - 1)));
  }, [currentSlide, totalSlides]);

  const next = useCallback(() => { if (currentSlide < totalSlides - 1) goTo(currentSlide + 1); }, [currentSlide, totalSlides, goTo]);
  const prev = useCallback(() => { if (currentSlide > 0) goTo(currentSlide - 1); }, [currentSlide, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === 'Escape') { e.preventDefault(); onExit(); }
      else if (e.key === 'n' || e.key === 'N') { setShowNotes(v => !v); }
      else if (e.key === 'd' || e.key === 'D') { setDarkMode(v => !v); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev, onExit]);

  const slide = slides[currentSlide];
  const noteText = SLIDE_NOTES[currentSlide] || '';
  const relevantNotes = slide?.type === 'deepdive'
    ? notes.filter(n => {
        const proc = processes.find(p => p.name === n.process_name);
        return proc && proc.function === slide.functionName;
      })
    : [];

  function renderSlide() {
    switch (slide.type) {
      case 'overview':
        return <SlideOverview companyName={companyName} date={dateStr} stats={allStats} totalProcesses={processes.length} />;
      case 'summary':
        return <SlideFunctionSummary functionGroups={functionGroups} categories={categories || []} />;
      case 'deepdive':
        return <SlideFunctionDeepDive functionName={slide.functionName} items={functionGroups[slide.functionName] || []} />;
      case 'priority':
        return <SlidePriorityItems processes={processes} />;
      case 'recommendations':
        return <SlideRecommendations processes={processes} companyName={companyName} />;
      default:
        return null;
    }
  }

  return (
    <div className={`pres-overlay ${darkMode ? 'pres-dark' : 'pres-light'}`}>
      {/* Dark mode toggle */}
      <button
        className="pres-mode-toggle"
        onClick={() => setDarkMode(!darkMode)}
        title="Toggle dark/light mode (D)"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* Notes toggle */}
      <button
        className="pres-notes-toggle"
        onClick={() => setShowNotes(!showNotes)}
        title="Toggle presenter notes (N)"
      >
        📝
      </button>

      {/* Slide area */}
      <div className="pres-stage" key={currentSlide} onClick={next}>
        {renderSlide()}
      </div>

      {/* Presenter notes panel */}
      {showNotes && (
        <div className="pres-notes-panel">
          <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Presenter Notes
          </div>
          <div style={{ fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.9 }}>{noteText}</div>
          {relevantNotes.length > 0 && (
            <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>Diagnostic Notes:</div>
              {relevantNotes.map((n, i) => (
                <div key={i} style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                  • <strong>{n.process_name}:</strong> {n.note}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <PresentationControls
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        onPrev={prev}
        onNext={next}
        onGoTo={goTo}
        onExit={onExit}
        slideLabels={slideLabels}
      />
    </div>
  );
}
