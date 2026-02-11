/**
 * ServiceEditor - Form for creating/editing a service catalog item
 *
 * Props:
 *   service         - Existing service object (null for new)
 *   onSave(data)    - Callback with form data
 *   onCancel()      - Callback to dismiss
 *   saving          - Boolean loading state
 */

import { useState } from 'react';

const CATEGORIES = [
  'Power10',
  'Strategic',
  'Managed Services',
  'Custom Diagnostic',
  'Tool Diagnostic',
  'Tool Project',
];

const STATUSES = [
  'Ready for Diagnostic',
  'Pending Basic Info',
  'Missing Rubric',
];

const DELIVERY_MODELS = ['Menu', 'Custom'];

const PROJECT_TYPES = ['Strategic', 'Technical', 'Strategic & Technical'];

const FUNCTIONS = [
  'Cross Functional',
  'Marketing',
  'Sales',
  'Customer Success',
  'Partnerships',
];

const inputStyle = {
  padding: '0.5rem 0.75rem',
  border: '1px solid #E2E8F0',
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  width: '100%',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#4A5568',
  marginBottom: '0.25rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

export default function ServiceEditor({
  service = null,
  onSave,
  onCancel,
  saving = false,
}) {
  const isNew = !service;

  const [form, setForm] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || 'Strategic',
    status: service?.status || 'Pending Basic Info',
    delivery_model: service?.delivery_model || 'Menu',
    project_type: service?.project_type || '',
    hours_low: service?.hours_low ?? '',
    hours_high: service?.hours_high ?? '',
    default_rate: service?.default_rate ?? '',
    owner: service?.owner || '',
    team_members: (service?.team_members || []).join(', '),
    primary_function: service?.primary_function || '',
    functions: (service?.functions || []).join(', '),
    primary_gtm_outcome: service?.primary_gtm_outcome || '',
    gtm_outcomes: (service?.gtm_outcomes || []).join(', '),
    power10_metric: service?.power10_metric || '',
    tools: (service?.tools || []).join(', '),
    notes: service?.notes || '',
    active: service?.active ?? true,
  });

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const data = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category,
      status: form.status || null,
      delivery_model: form.delivery_model || null,
      project_type: form.project_type || null,
      hours_low: form.hours_low !== '' ? parseInt(form.hours_low) : null,
      hours_high: form.hours_high !== '' ? parseInt(form.hours_high) : null,
      default_rate: form.default_rate !== '' ? parseFloat(form.default_rate) : null,
      owner: form.owner.trim() || null,
      team_members: form.team_members ? form.team_members.split(',').map(s => s.trim()).filter(Boolean) : [],
      primary_function: form.primary_function || null,
      functions: form.functions ? form.functions.split(',').map(s => s.trim()).filter(Boolean) : [],
      primary_gtm_outcome: form.primary_gtm_outcome.trim() || null,
      gtm_outcomes: form.gtm_outcomes ? form.gtm_outcomes.split(',').map(s => s.trim()).filter(Boolean) : [],
      power10_metric: form.power10_metric.trim() || null,
      tools: form.tools ? form.tools.split(',').map(s => s.trim()).filter(Boolean) : [],
      notes: form.notes.trim() || null,
      active: form.active,
    };

    onSave?.(data);
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '0.75rem',
      padding: '1.5rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
          {isNew ? 'Add Service' : `Edit: ${service.name}`}
        </h3>
        <button
          onClick={onCancel}
          style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#A0AEC0', cursor: 'pointer' }}
        >
          x
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Name - full width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {/* Description - full width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            />
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Category *</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              style={{ ...inputStyle, background: 'white' }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Status */}
          <div>
            <label style={labelStyle}>Status</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              style={{ ...inputStyle, background: 'white' }}
            >
              <option value="">—</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Delivery Model */}
          <div>
            <label style={labelStyle}>Delivery Model</label>
            <select
              value={form.delivery_model}
              onChange={(e) => handleChange('delivery_model', e.target.value)}
              style={{ ...inputStyle, background: 'white' }}
            >
              <option value="">—</option>
              {DELIVERY_MODELS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Project Type */}
          <div>
            <label style={labelStyle}>Project Type</label>
            <select
              value={form.project_type}
              onChange={(e) => handleChange('project_type', e.target.value)}
              style={{ ...inputStyle, background: 'white' }}
            >
              <option value="">—</option>
              {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Hours */}
          <div>
            <label style={labelStyle}>Hours (Low)</label>
            <input
              type="number"
              value={form.hours_low}
              onChange={(e) => handleChange('hours_low', e.target.value)}
              style={inputStyle}
              min={0}
            />
          </div>

          <div>
            <label style={labelStyle}>Hours (High)</label>
            <input
              type="number"
              value={form.hours_high}
              onChange={(e) => handleChange('hours_high', e.target.value)}
              style={inputStyle}
              min={0}
            />
          </div>

          {/* Rate */}
          <div>
            <label style={labelStyle}>Default Rate ($/hr)</label>
            <input
              type="number"
              value={form.default_rate}
              onChange={(e) => handleChange('default_rate', e.target.value)}
              style={inputStyle}
              min={0}
              step="0.01"
            />
          </div>

          {/* Owner */}
          <div>
            <label style={labelStyle}>Owner</label>
            <input
              type="text"
              value={form.owner}
              onChange={(e) => handleChange('owner', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Team Members */}
          <div>
            <label style={labelStyle}>Team Members (comma-separated)</label>
            <input
              type="text"
              value={form.team_members}
              onChange={(e) => handleChange('team_members', e.target.value)}
              style={inputStyle}
              placeholder="e.g., Anthony, Bernardo"
            />
          </div>

          {/* Primary Function */}
          <div>
            <label style={labelStyle}>Primary Function</label>
            <select
              value={form.primary_function}
              onChange={(e) => handleChange('primary_function', e.target.value)}
              style={{ ...inputStyle, background: 'white' }}
            >
              <option value="">—</option>
              {FUNCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Functions */}
          <div>
            <label style={labelStyle}>Functions (comma-separated)</label>
            <input
              type="text"
              value={form.functions}
              onChange={(e) => handleChange('functions', e.target.value)}
              style={inputStyle}
              placeholder="e.g., Sales, Marketing"
            />
          </div>

          {/* GTM Outcome */}
          <div>
            <label style={labelStyle}>Primary GTM Outcome</label>
            <input
              type="text"
              value={form.primary_gtm_outcome}
              onChange={(e) => handleChange('primary_gtm_outcome', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Power10 Metric */}
          <div>
            <label style={labelStyle}>Power10 Metric</label>
            <input
              type="text"
              value={form.power10_metric}
              onChange={(e) => handleChange('power10_metric', e.target.value)}
              style={inputStyle}
              placeholder="e.g., ARR, Bookings"
            />
          </div>

          {/* Tools */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Tools (comma-separated)</label>
            <input
              type="text"
              value={form.tools}
              onChange={(e) => handleChange('tools', e.target.value)}
              style={inputStyle}
              placeholder="e.g., Salesforce, HubSpot, Clay"
            />
          </div>

          {/* Notes - full width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
            />
          </div>

          {/* Active toggle */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => handleChange('active', e.target.checked)}
              />
              <span style={{ fontSize: '0.875rem', color: '#4A5568' }}>Active (visible in catalog)</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid #E2E8F0',
        }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              color: '#4A5568',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !form.name.trim()}
            style={{
              padding: '0.5rem 1.25rem',
              background: saving ? '#9CA3AF' : '#6C5CE7',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: saving ? 'wait' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : (isNew ? 'Add Service' : 'Save Changes')}
          </button>
        </div>
      </form>
    </div>
  );
}
