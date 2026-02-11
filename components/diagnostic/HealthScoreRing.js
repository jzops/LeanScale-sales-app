import { motion } from 'framer-motion';

const RING_SIZE = 160;
const STROKE_WIDTH = 12;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Animated circular score gauge.
 *
 * @param {number} score - 0 to 100
 * @param {string} rating - 'critical' | 'warning' | 'moderate' | 'healthy'
 * @param {number} size - SVG size in pixels (default 160)
 */
export default function HealthScoreRing({ score = 0, rating = 'moderate', size = RING_SIZE }) {
  const radius = (size - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const ratingColors = {
    critical: '#ef4444',
    warning: '#f59e0b',
    moderate: '#3b82f6',
    healthy: '#22c55e',
  };

  const color = ratingColors[rating] || ratingColors.moderate;

  return (
    <div className="score-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Health score: ${score} out of 100, rated ${rating}`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={STROKE_WIDTH}
        />
        {/* Animated score arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="score-ring-text">
        <motion.div
          className="score-ring-value"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {score}
        </motion.div>
        <div className="score-ring-label">health</div>
      </div>
    </div>
  );
}
