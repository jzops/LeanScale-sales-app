import { motion } from 'framer-motion';
import HealthScoreRing from './HealthScoreRing';
import { fadeUpItem, staggerContainer } from '../../lib/animations';

/**
 * Compute a 0-100 health score from process status counts.
 */
export function computeHealthScore(stats) {
  const total = stats.healthy + stats.careful + stats.warning + stats.unable;
  if (total === 0) return 0;
  const weighted = stats.healthy * 100 + stats.careful * 50 + stats.warning * 25 + stats.unable * 0;
  return Math.round(weighted / total);
}

/**
 * Determine overall rating from health score.
 */
export function getOverallRating(score) {
  if (score >= 75) return 'healthy';
  if (score >= 50) return 'moderate';
  if (score >= 25) return 'warning';
  return 'critical';
}

/**
 * Full-width hero section showing animated health score,
 * distribution bar, and summary stats.
 */
export default function PriorityHero({ stats, priorityCount, diagnosticType, title }) {
  const total = stats.healthy + stats.careful + stats.warning + stats.unable;
  const score = computeHealthScore(stats);
  const rating = getOverallRating(score);

  const typeLabel = {
    gtm: 'GTM Operations',
    clay: 'Clay Enrichment',
    cpq: 'Quote-to-Cash',
  }[diagnosticType] || 'Operations';

  const pct = (n) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <motion.div
      className="priority-hero"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="priority-hero-content">
        {/* Animated Score Ring */}
        <div className="priority-hero-score">
          <HealthScoreRing score={score} rating={rating} size={160} />
        </div>

        {/* Details */}
        <motion.div
          className="priority-hero-details"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUpItem}>
            <h2 className="priority-hero-title">
              {title || `${typeLabel} Health`}
            </h2>
            <p className="priority-hero-subtitle">
              {total} processes analyzed &middot; {stats.warning + stats.unable} need attention
              {priorityCount > 0 && ` \u00b7 ${priorityCount} flagged as priority`}
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div variants={fadeUpItem}>
            <div className="health-progress-bar">
              {stats.healthy > 0 && (
                <motion.div
                  className="health-progress-segment"
                  style={{ background: 'var(--status-healthy)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct(stats.healthy)}%` }}
                  transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                />
              )}
              {stats.careful > 0 && (
                <motion.div
                  className="health-progress-segment"
                  style={{ background: 'var(--status-careful)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct(stats.careful)}%` }}
                  transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                />
              )}
              {stats.warning > 0 && (
                <motion.div
                  className="health-progress-segment"
                  style={{ background: 'var(--status-warning)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct(stats.warning)}%` }}
                  transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
                />
              )}
              {stats.unable > 0 && (
                <motion.div
                  className="health-progress-segment"
                  style={{ background: 'var(--status-unable)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct(stats.unable)}%` }}
                  transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
                />
              )}
            </div>
          </motion.div>

          {/* Legend */}
          <motion.div className="health-progress-legend" variants={fadeUpItem}>
            {stats.healthy > 0 && (
              <span className="health-progress-legend-item">
                <span className="health-progress-legend-dot" style={{ background: 'var(--status-healthy)' }} />
                Healthy <span className="health-progress-legend-count">{stats.healthy}</span>
              </span>
            )}
            {stats.careful > 0 && (
              <span className="health-progress-legend-item">
                <span className="health-progress-legend-dot" style={{ background: 'var(--status-careful)' }} />
                Careful <span className="health-progress-legend-count">{stats.careful}</span>
              </span>
            )}
            {stats.warning > 0 && (
              <span className="health-progress-legend-item">
                <span className="health-progress-legend-dot" style={{ background: 'var(--status-warning)' }} />
                Warning <span className="health-progress-legend-count">{stats.warning}</span>
              </span>
            )}
            {stats.unable > 0 && (
              <span className="health-progress-legend-item">
                <span className="health-progress-legend-dot" style={{ background: 'var(--status-unable)' }} />
                Unable <span className="health-progress-legend-count">{stats.unable}</span>
              </span>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
