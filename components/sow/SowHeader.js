import { motion } from 'framer-motion';
import Link from 'next/link';
import EditableField from './EditableField';
import { fadeUpItem, staggerContainer } from '../../lib/animations';

const STATUS_OPTIONS = ['draft', 'review', 'sent', 'accepted', 'declined'];

const STATUS_COLORS = {
  draft: { bg: '#EDF2F7', color: '#4A5568' },
  review: { bg: '#FEFCBF', color: '#975A16' },
  sent: { bg: '#E9D8FD', color: '#553C9A' },
  accepted: { bg: '#C6F6D5', color: '#276749' },
  declined: { bg: '#FED7D7', color: '#9B2C2C' },
};

/**
 * SowHeader — Editable SOW header with title, status, metadata, and actions.
 *
 * @param {object} sow - SOW data object
 * @param {boolean} readOnly - If true, no editing or action buttons
 * @param {function} onFieldChange - Called with (fieldPath, newValue) for inline edits
 * @param {function} onStatusUpdate - Called with new status string
 * @param {string} customerSlug - For builder link
 * @param {function} onPushToTeamwork - Called when push to teamwork is clicked
 * @param {boolean} teamworkLoading - Whether teamwork push is in progress
 */
export default function SowHeader({
  sow,
  readOnly = false,
  onFieldChange,
  onStatusUpdate,
  customerSlug,
  onPushToTeamwork,
  teamworkLoading = false,
}) {
  const statusColors = STATUS_COLORS[sow.status] || STATUS_COLORS.draft;
  const canPushToTeamwork = !readOnly && ['review', 'sent', 'accepted'].includes(sow.status) && !sow.teamwork_project_id;

  async function handleStatusClick(newStatus) {
    if (newStatus === sow.status) return;
    await onStatusUpdate?.(newStatus);
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      style={{ marginBottom: '2rem' }}
    >
      {/* Title */}
      <motion.div variants={fadeUpItem}>
        <EditableField
          value={sow.title}
          onCommit={(val) => onFieldChange?.('title', val)}
          readOnly={readOnly}
          placeholder="Untitled SOW"
          as="h1"
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#1a1a2e',
            marginBottom: '0.75rem',
          }}
        />
      </motion.div>

      {/* Meta row */}
      <motion.div
        variants={fadeUpItem}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Left: status + metadata */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Status badge / selector */}
          {!readOnly ? (
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {STATUS_OPTIONS.map((s) => {
                const sc = STATUS_COLORS[s] || STATUS_COLORS.draft;
                const isActive = s === sow.status;
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusClick(s)}
                    style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 700 : 500,
                      background: isActive ? sc.bg : 'transparent',
                      color: isActive ? sc.color : '#A0AEC0',
                      border: isActive ? `1px solid ${sc.color}30` : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          ) : (
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: statusColors.bg,
              color: statusColors.color,
            }}>
              {sow.status}
            </span>
          )}

          <span style={{ fontSize: '0.8rem', color: '#718096' }}>
            {sow.sow_type}
          </span>
          {sow.created_by && (
            <span style={{ fontSize: '0.8rem', color: '#718096' }}>
              by {sow.created_by}
            </span>
          )}
          {sow.created_at && (
            <span style={{ fontSize: '0.8rem', color: '#A0AEC0' }}>
              {new Date(sow.created_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Right: totals + actions */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {sow.total_hours > 0 && (
            <span style={{
              fontSize: '0.9rem',
              color: '#6C5CE7',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {parseFloat(sow.total_hours)}h
            </span>
          )}
          {sow.total_investment > 0 && (
            <span style={{
              fontSize: '0.9rem',
              color: '#276749',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}>
              ${parseFloat(sow.total_investment).toLocaleString()}
            </span>
          )}

          {!readOnly && (
            <>
              <Link
                href={customerSlug && customerSlug !== 'demo'
                  ? `/c/${customerSlug}/sow/${sow.id}/build`
                  : `/sow/${sow.id}/build`}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#6C5CE7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Builder
              </Link>
              {canPushToTeamwork && (
                <button
                  onClick={onPushToTeamwork}
                  disabled={teamworkLoading}
                  style={{
                    padding: '0.5rem 1rem',
                    background: teamworkLoading ? '#9CA3AF' : '#0F766E',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: teamworkLoading ? 'wait' : 'pointer',
                  }}
                >
                  {teamworkLoading ? 'Loading...' : 'Push to Teamwork'}
                </button>
              )}
              {sow.teamwork_project_url && (
                <a
                  href={sow.teamwork_project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#F0FDF4',
                    color: '#16A34A',
                    border: '1px solid #BBF7D0',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  View in Teamwork
                </a>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
