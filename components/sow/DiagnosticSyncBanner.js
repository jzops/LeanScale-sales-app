/**
 * DiagnosticSyncBanner - Shows when diagnostic results have changed since the SOW was created
 *
 * Fetches /api/sow/[id]/diagnostic-sync on mount to check for deltas.
 * If changes exist, shows a banner with added/removed/changed items.
 * User can "Update SOW" (re-sync snapshot) or "Dismiss" (hide banner).
 *
 * Props:
 *   sowId - The SOW UUID
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_COLORS = {
  healthy: '#38A169',
  careful: '#D69E2E',
  warning: '#DD6B20',
  unable: '#E53E3E',
};

export default function DiagnosticSyncBanner({ sowId }) {
  const [syncData, setSyncData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [resyncing, setResyncing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dismissedItems, setDismissedItems] = useState(new Set());

  useEffect(() => {
    if (!sowId) return;

    async function checkSync() {
      try {
        const res = await fetch(`/api/sow/${sowId}/diagnostic-sync`);
        if (res.ok) {
          const json = await res.json();
          setSyncData(json.data);
        }
      } catch (err) {
        console.error('Error checking diagnostic sync:', err);
      } finally {
        setLoading(false);
      }
    }

    checkSync();
  }, [sowId]);

  async function handleResync() {
    setResyncing(true);
    try {
      const res = await fetch(`/api/sow/${sowId}/diagnostic-resync`, {
        method: 'POST',
      });
      if (res.ok) {
        setSyncData({ hasChanges: false });
      }
    } catch (err) {
      console.error('Error re-syncing:', err);
    } finally {
      setResyncing(false);
    }
  }

  // Don't render if loading, dismissed, no changes, or no snapshot
  if (loading || dismissed) return null;
  if (!syncData?.hasChanges) return null;

  const { changes, snapshotAt, totalChanges } = syncData;
  const { added = [], removed = [], statusChanged = [] } = changes || {};

  return (
    <div style={{
      marginBottom: '1.5rem',
      border: '1px solid #FBBF24',
      borderRadius: '0.75rem',
      background: '#FFFBEB',
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1.25rem',
        background: '#FEF3C7',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>!</span>
          <div>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#92400E' }}>
              Diagnostic Updated
            </span>
            <span style={{ fontSize: '0.8rem', color: '#B45309', marginLeft: '0.5rem' }}>
              {totalChanges} change{totalChanges !== 1 ? 's' : ''} since this SOW was created
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: '0.35rem 0.75rem',
              background: 'transparent',
              border: '1px solid #D97706',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              color: '#92400E',
              cursor: 'pointer',
            }}
          >
            {expanded ? 'Hide Details' : 'Show Details'}
          </button>
          <button
            onClick={handleResync}
            disabled={resyncing}
            style={{
              padding: '0.35rem 0.75rem',
              background: '#6C5CE7',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: resyncing ? 'wait' : 'pointer',
              opacity: resyncing ? 0.7 : 1,
            }}
          >
            {resyncing ? 'Updating...' : 'Update SOW'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            style={{
              padding: '0.35rem 0.5rem',
              background: 'transparent',
              border: 'none',
              fontSize: '1rem',
              color: '#D97706',
              cursor: 'pointer',
            }}
          >
            x
          </button>
        </div>
      </div>

      {/* Expanded details with per-item actions */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '1rem 1.25rem' }}>
              {snapshotAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <p style={{ fontSize: '0.75rem', color: '#B45309', margin: 0 }}>
                    Snapshot taken: {new Date(snapshotAt).toLocaleString()}
                  </p>
                  {dismissedItems.size > 0 && (
                    <button
                      onClick={() => setDismissedItems(new Set())}
                      style={{
                        fontSize: '0.7rem',
                        color: '#B45309',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Reset dismissed
                    </button>
                  )}
                </div>
              )}

              {/* Status changes */}
              {statusChanged.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#92400E', marginBottom: '0.4rem' }}>
                    Status Changed ({statusChanged.filter(i => !dismissedItems.has(i.name)).length}/{statusChanged.length})
                  </h4>
                  {statusChanged.map(item => dismissedItems.has(item.name) ? null : (
                    <div key={item.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.8rem',
                      borderRadius: '0.25rem',
                      background: '#FFF',
                      marginBottom: '0.25rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#4A5568' }}>{item.name}</span>
                        <StatusDot status={item.previousStatus} />
                        <span style={{ color: '#A0AEC0' }}>{'→'}</span>
                        <StatusDot status={item.currentStatus} />
                      </div>
                      <button
                        onClick={() => setDismissedItems(prev => new Set(prev).add(item.name))}
                        style={{
                          fontSize: '0.7rem',
                          color: '#A0AEC0',
                          background: 'none',
                          border: '1px solid #E2E8F0',
                          borderRadius: '0.25rem',
                          padding: '0.15rem 0.5rem',
                          cursor: 'pointer',
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Added items */}
              {added.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#059669', marginBottom: '0.4rem' }}>
                    New Priority Items ({added.filter(i => !dismissedItems.has(i.name)).length}/{added.length})
                  </h4>
                  {added.map(item => dismissedItems.has(item.name) ? null : (
                    <div key={item.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.8rem',
                      borderRadius: '0.25rem',
                      background: '#FFF',
                      marginBottom: '0.25rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#059669' }}>+</span>
                        <span style={{ color: '#4A5568' }}>{item.name}</span>
                        <StatusDot status={item.status} />
                      </div>
                      <button
                        onClick={() => setDismissedItems(prev => new Set(prev).add(item.name))}
                        style={{
                          fontSize: '0.7rem',
                          color: '#A0AEC0',
                          background: 'none',
                          border: '1px solid #E2E8F0',
                          borderRadius: '0.25rem',
                          padding: '0.15rem 0.5rem',
                          cursor: 'pointer',
                        }}
                      >
                        Skip
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Removed items */}
              {removed.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#E53E3E', marginBottom: '0.4rem' }}>
                    Removed Items ({removed.length})
                  </h4>
                  {removed.map(item => (
                    <div key={item.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                    }}>
                      <span style={{ color: '#E53E3E' }}>-</span>
                      <span style={{ color: '#A0AEC0', textDecoration: 'line-through' }}>{item.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Dismiss All button */}
              {(statusChanged.length > 0 || added.length > 0) && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      const all = new Set(dismissedItems);
                      statusChanged.forEach(i => all.add(i.name));
                      added.forEach(i => all.add(i.name));
                      setDismissedItems(all);
                    }}
                    style={{
                      fontSize: '0.75rem',
                      color: '#92400E',
                      background: 'transparent',
                      border: '1px solid #D97706',
                      borderRadius: '0.25rem',
                      padding: '0.25rem 0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    Dismiss All
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusDot({ status }) {
  const color = STATUS_COLORS[status] || '#A0AEC0';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      fontSize: '0.7rem',
      color,
      fontWeight: 500,
    }}>
      <span style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        display: 'inline-block',
      }} />
      {status}
    </span>
  );
}
