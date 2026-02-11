/**
 * ScenarioManager - Multi-scenario SOW management
 *
 * Provides tab bar for switching between scenarios, create/duplicate/delete,
 * section toggle per scenario, and comparison view.
 *
 * Props:
 *   sow          - The SOW object
 *   sections     - All SOW sections
 *   scenarios    - Array of scenario objects (from sow.content.scenarios)
 *   onUpdate     - Callback(scenarios) after any scenario change
 *   onSelectScenario - Callback(scenarioId) when active scenario changes
 *   activeScenarioId - Currently active scenario ID
 */

import { useState, useCallback } from 'react';
import ScenarioComparisonTable from './ScenarioComparisonTable';

const PRESET_NAMES = [
  'Option A: Quick Wins',
  'Option B: Full Engagement',
  'Option C: Phased Approach',
];

export default function ScenarioManager({
  sow,
  sections = [],
  scenarios = [],
  onUpdate,
  onSelectScenario,
  activeScenarioId,
}) {
  const [showComparison, setShowComparison] = useState(false);
  const [editingName, setEditingName] = useState(null);
  const [nameValue, setNameValue] = useState('');
  const [loading, setLoading] = useState(false);

  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
  const hasMultiple = scenarios.length > 1;

  // API helpers
  const apiCall = useCallback(async (method, body) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sow/${sow.id}/scenarios`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        // Refresh scenarios
        const listRes = await fetch(`/api/sow/${sow.id}/scenarios`);
        const listJson = await listRes.json();
        if (listJson.success) {
          onUpdate?.(listJson.data);
        }
        return json.data;
      }
      return null;
    } catch (err) {
      console.error('Scenario API error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [sow.id, onUpdate]);

  async function handleCreate() {
    const nextIdx = scenarios.length;
    const name = PRESET_NAMES[nextIdx] || `Option ${String.fromCharCode(65 + nextIdx)}`;
    const result = await apiCall('POST', {
      name,
      sectionIds: [],
      isDefault: false,
    });
    if (result) {
      onSelectScenario?.(result.id);
    }
  }

  async function handleDuplicate(scenarioId) {
    const source = scenarios.find(s => s.id === scenarioId);
    const result = await apiCall('POST', {
      duplicateFrom: scenarioId,
      name: `${source?.name || 'Scenario'} (Copy)`,
    });
    if (result) {
      onSelectScenario?.(result.id);
    }
  }

  async function handleDelete(scenarioId) {
    if (scenarios.length <= 1) return;
    if (!confirm('Delete this scenario?')) return;
    await apiCall('DELETE', { scenarioId });
    if (activeScenarioId === scenarioId) {
      const remaining = scenarios.filter(s => s.id !== scenarioId);
      onSelectScenario?.(remaining[0]?.id);
    }
  }

  async function handleRename(scenarioId) {
    if (!nameValue.trim()) return;
    await apiCall('PUT', { scenarioId, name: nameValue.trim() });
    setEditingName(null);
  }

  async function handleSetDefault(scenarioId) {
    await apiCall('PUT', { scenarioId, isDefault: true });
  }

  async function handleToggleSection(scenarioId, sectionId) {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    const sectionIds = scenario.sectionIds.includes(sectionId)
      ? scenario.sectionIds.filter(id => id !== sectionId)
      : [...scenario.sectionIds, sectionId];

    await apiCall('PUT', { scenarioId, sectionIds });
  }

  // Don't render anything if there are no scenarios (pre-scenario SOW)
  // Show a "Create Scenarios" button instead
  if (scenarios.length <= 1 && scenarios[0]?.id === 'default') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-4)',
        padding: 'var(--space-3) var(--space-5)',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
      }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          📋 Present multiple options to your client
        </span>
        <button
          onClick={handleCreate}
          disabled={loading}
          style={{
            padding: 'var(--space-1) var(--space-3)',
            background: 'var(--ls-purple-light)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-medium)',
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          + Create Scenarios
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        marginBottom: 'var(--space-4)',
        borderBottom: '2px solid var(--border-color)',
        paddingBottom: 0,
      }}>
        {scenarios.map(s => (
          <div
            key={s.id}
            onClick={() => onSelectScenario?.(s.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              cursor: 'pointer',
              borderBottom: s.id === activeScenarioId ? '2px solid #6C5CE7' : '2px solid transparent',
              marginBottom: '-2px',
              background: s.id === activeScenarioId ? 'var(--bg-white)' : 'transparent',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              transition: 'all 0.15s',
            }}
          >
            {editingName === s.id ? (
              <input
                autoFocus
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                onBlur={() => handleRename(s.id)}
                onKeyDown={e => e.key === 'Enter' && handleRename(s.id)}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2px 6px',
                  fontSize: 'var(--text-sm)',
                  width: 160,
                }}
              />
            ) : (
              <span
                onDoubleClick={() => { setEditingName(s.id); setNameValue(s.name); }}
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: s.id === activeScenarioId ? 'var(--font-semibold)' : 'var(--font-medium)',
                  color: s.id === activeScenarioId ? '#6C5CE7' : 'var(--text-secondary)',
                }}
              >
                {s.name}
              </span>
            )}
            {s.isDefault && (
              <span style={{
                fontSize: '10px',
                padding: '0 4px',
                borderRadius: 'var(--radius-full)',
                background: '#6C5CE7',
                color: 'white',
              }}>
                ★
              </span>
            )}
          </div>
        ))}

        {/* Add scenario button */}
        <button
          onClick={handleCreate}
          disabled={loading || scenarios.length >= 5}
          style={{
            padding: 'var(--space-1) var(--space-3)',
            background: 'none',
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            cursor: loading || scenarios.length >= 5 ? 'not-allowed' : 'pointer',
            marginLeft: 'var(--space-2)',
          }}
        >
          +
        </button>

        {/* Toggle comparison */}
        {hasMultiple && (
          <button
            onClick={() => setShowComparison(!showComparison)}
            style={{
              marginLeft: 'auto',
              padding: 'var(--space-1) var(--space-3)',
              background: showComparison ? '#6C5CE7' : 'var(--bg-subtle)',
              color: showComparison ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              cursor: 'pointer',
            }}
          >
            {showComparison ? '✕ Close' : '📊 Compare'}
          </button>
        )}
      </div>

      {/* Comparison table */}
      {showComparison && hasMultiple && (
        <ScenarioComparisonTable
          scenarios={scenarios}
          sections={sections}
          onSelect={(id) => { onSelectScenario?.(id); setShowComparison(false); }}
        />
      )}

      {/* Active scenario controls */}
      {activeScenario && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}>
          <div>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {activeScenario.description || `${activeScenario.sectionIds?.length || 0} sections selected`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={() => handleDuplicate(activeScenario.id)}
              disabled={loading || scenarios.length >= 5}
              style={actionBtnStyle}
            >
              📋 Duplicate
            </button>
            {!activeScenario.isDefault && (
              <button onClick={() => handleSetDefault(activeScenario.id)} disabled={loading} style={actionBtnStyle}>
                ★ Set Default
              </button>
            )}
            {scenarios.length > 1 && (
              <button
                onClick={() => handleDelete(activeScenario.id)}
                disabled={loading}
                style={{ ...actionBtnStyle, color: '#E53E3E' }}
              >
                🗑
              </button>
            )}
          </div>
        </div>
      )}

      {/* Section toggles for active scenario */}
      {activeScenario && sections.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
        }}>
          {sections.map(section => {
            const included = activeScenario.sectionIds?.includes(section.id);
            return (
              <button
                key={section.id}
                onClick={() => handleToggleSection(activeScenario.id, section.id)}
                disabled={loading}
                style={{
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${included ? '#6C5CE7' : 'var(--border-color)'}`,
                  background: included ? '#EDE9FE' : 'var(--bg-white)',
                  color: included ? '#6C5CE7' : 'var(--text-muted)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {included ? '✓ ' : ''}{section.title}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const actionBtnStyle = {
  padding: '4px 10px',
  background: 'var(--bg-white)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-xs)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
};
