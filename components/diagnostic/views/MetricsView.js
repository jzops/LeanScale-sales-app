import { motion } from 'framer-motion';
import DonutChart from '../../charts/DonutChart';
import BarChart from '../../charts/BarChart';
import { StatusDot } from '../StatusLegend';
import { countStatuses } from '../../../data/diagnostic-registry';
import { fadeUpItem, staggerContainer } from '../../../lib/animations';

/**
 * Combined Power10 metrics + GTM Tools view.
 * Shows gauge cards and charts with animated entrance.
 */
export default function MetricsView({
  power10Data,
  toolsData,
  processStats,
  toolStats,
  power10Stats,
  processes,
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}
    >
      {/* Power10 Metrics Section */}
      {power10Data && power10Data.length > 0 && (
        <motion.div variants={fadeUpItem}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-4)' }}>
            Power10 Metrics
          </h3>

          <div className="diagnostic-charts-row" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <DonutChart data={power10Stats} title="Power10 Health" size={140} />
            </div>
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <BarChart
                data={power10Data.map(m => ({ name: m.name, status: m.ableToReport || 'unable' }))}
                title="Power10 Status"
              />
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-3)',
            }}>
              {power10Data.map((metric) => (
                <div
                  key={metric.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                    {metric.name}
                  </span>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Report</div>
                      <StatusDot status={metric.ableToReport || 'unable'} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Plan</div>
                      <StatusDot status={metric.statusAgainstPlan || 'unable'} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* GTM Tools Section */}
      {toolsData && toolsData.length > 0 && (
        <motion.div variants={fadeUpItem}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-4)' }}>
            GTM Tools
          </h3>

          <div className="diagnostic-charts-row" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <DonutChart data={toolStats} title="Tools Health" size={140} />
            </div>
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <BarChart data={toolsData} title="GTM Tools Status" />
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-3)',
            }}>
              {toolsData.map((tool) => (
                <div
                  key={tool.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <div>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                      {tool.name}
                    </span>
                    {tool.function && (
                      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
                        {tool.function}
                      </div>
                    )}
                  </div>
                  <StatusDot status={tool.status} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Process Overview (always shown) */}
      <motion.div variants={fadeUpItem}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-4)' }}>
          Process Health Overview
        </h3>
        <div className="diagnostic-charts-row">
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <DonutChart data={processStats} title="Process Health" size={140} />
          </div>
          <div className="card" style={{ padding: 'var(--space-4)', overflow: 'auto' }}>
            <BarChart data={processes} title="Process Status" maxItems={Math.min(processes.length, 31)} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
