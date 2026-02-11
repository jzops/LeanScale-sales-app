/**
 * CatalogPicker - Dropdown/modal to browse the service catalog and
 * select a service to pre-fill a new SOW section.
 *
 * Props:
 *   onSelect(service) - Called with the selected service catalog item
 *   onCancel()        - Called when the picker is dismissed
 */

import { useState, useEffect, useMemo } from 'react';

const CATEGORY_COLORS = {
  'Power10': { bg: '#EDE9FE', color: '#6C5CE7' },
  'Strategic': { bg: '#DBEAFE', color: '#2563EB' },
  'Managed Services': { bg: '#FEF3C7', color: '#D97706' },
  'Custom Diagnostic': { bg: '#FCE7F3', color: '#DB2777' },
  'Tool Diagnostic': { bg: '#D1FAE5', color: '#059669' },
  'Tool Project': { bg: '#E0F2FE', color: '#0284C7' },
};

export default function CatalogPicker({ onSelect, onCancel }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/service-catalog?active=true');
        if (res.ok) {
          const json = await res.json();
          setServices(json.data || []);
        }
      } catch (err) {
        console.error('Error loading catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = useMemo(() => {
    return [...new Set(services.map(s => s.category).filter(Boolean))].sort();
  }, [services]);

  const filtered = useMemo(() => {
    let result = services;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.primary_function?.toLowerCase().includes(q)
      );
    }

    if (filterCategory) {
      result = result.filter(s => s.category === filterCategory);
    }

    return result;
  }, [services, search, filterCategory]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        width: '90%',
        maxWidth: 700,
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#1a1a2e' }}>
              Add from Service Catalog
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#718096' }}>
              Select a service to pre-fill the section with default hours, rate, and deliverables.
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#A0AEC0', cursor: 'pointer' }}
          >
            x
          </button>
        </div>

        {/* Filters */}
        <div style={{
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid #EDF2F7',
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}>
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #E2E8F0',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              flex: '1 1 200px',
              minWidth: 200,
            }}
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #E2E8F0',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              background: 'white',
            }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span style={{ fontSize: '0.8rem', color: '#A0AEC0', alignSelf: 'center' }}>
            {filtered.length} services
          </span>
        </div>

        {/* Service list */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.5rem 1.5rem',
        }}>
          {loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>
              Loading catalog...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#A0AEC0' }}>
              No services found. {services.length === 0 ? 'The service catalog is empty.' : 'Try a different search.'}
            </div>
          )}

          {filtered.map(service => {
            const catColor = CATEGORY_COLORS[service.category] || { bg: '#EDF2F7', color: '#4A5568' };
            const hoursDisplay = service.hours_low && service.hours_high
              ? `${service.hours_low}-${service.hours_high}h`
              : service.hours_low ? `${service.hours_low}h` : null;

            return (
              <div
                key={service.id}
                onClick={() => onSelect(service)}
                style={{
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #EDF2F7',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F7FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      color: '#1a1a2e',
                      marginBottom: '0.2rem',
                    }}>
                      {service.name}
                    </div>
                    {service.description && (
                      <div style={{ fontSize: '0.75rem', color: '#A0AEC0' }}>
                        {service.description.length > 120
                          ? service.description.slice(0, 120) + '...'
                          : service.description}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      background: catColor.bg,
                      color: catColor.color,
                    }}>
                      {service.category}
                    </span>
                    {hoursDisplay && (
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#718096',
                        background: '#EDF2F7',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                      }}>
                        {hoursDisplay}
                      </span>
                    )}
                    {service.default_rate && (
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#276749',
                        background: '#C6F6D5',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                      }}>
                        ${parseFloat(service.default_rate).toLocaleString()}/hr
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.75rem', color: '#A0AEC0' }}>
            Click a service to create a section with its defaults
          </span>
          <button
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
        </div>
      </div>
    </div>
  );
}
