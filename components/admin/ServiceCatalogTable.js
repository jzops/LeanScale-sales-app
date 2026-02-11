/**
 * ServiceCatalogTable - Filterable table of service catalog items
 *
 * Props:
 *   services        - Array of service objects
 *   categories      - Array of category strings for filter
 *   onEdit(service) - Callback when edit is clicked
 *   onDelete(id)    - Callback when delete is clicked
 *   loading         - Boolean loading state
 */

import { useState, useMemo } from 'react';

const CATEGORY_COLORS = {
  'Power10': { bg: '#EDE9FE', color: '#6C5CE7' },
  'Strategic': { bg: '#DBEAFE', color: '#2563EB' },
  'Managed Services': { bg: '#FEF3C7', color: '#D97706' },
  'Custom Diagnostic': { bg: '#FCE7F3', color: '#DB2777' },
  'Tool Diagnostic': { bg: '#D1FAE5', color: '#059669' },
  'Tool Project': { bg: '#E0F2FE', color: '#0284C7' },
};

const STATUS_COLORS = {
  'Ready for Diagnostic': { bg: '#C6F6D5', color: '#276749' },
  'Pending Basic Info': { bg: '#FEFCBF', color: '#975A16' },
  'Missing Rubric': { bg: '#FED7D7', color: '#9B2C2C' },
};

export default function ServiceCatalogTable({
  services = [],
  categories = [],
  onEdit,
  onDelete,
  loading = false,
}) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const filtered = useMemo(() => {
    let result = services;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.owner?.toLowerCase().includes(q)
      );
    }

    if (filterCategory) {
      result = result.filter(s => s.category === filterCategory);
    }

    if (filterStatus) {
      result = result.filter(s => s.status === filterStatus);
    }

    result = [...result].sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      const cmp = typeof aVal === 'string'
        ? aVal.localeCompare(bVal)
        : (aVal - bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [services, search, filterCategory, filterStatus, sortField, sortDir]);

  function handleSort(field) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const statuses = [...new Set(services.map(s => s.status).filter(Boolean))];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
        Loading service catalog...
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #E2E8F0',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            background: 'white',
          }}
        >
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{ fontSize: '0.8rem', color: '#A0AEC0' }}>
          {filtered.length} of {services.length} services
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.85rem',
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
              {[
                { key: 'name', label: 'Service' },
                { key: 'category', label: 'Category' },
                { key: 'status', label: 'Status' },
                { key: 'hours_low', label: 'Hours' },
                { key: 'default_rate', label: 'Rate' },
                { key: 'owner', label: 'Owner' },
                { key: 'primary_function', label: 'Function' },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{
                    padding: '0.625rem 0.5rem',
                    textAlign: 'left',
                    color: '#4A5568',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                >
                  {col.label}
                  {sortField === col.key && (
                    <span style={{ marginLeft: '0.25rem' }}>
                      {sortDir === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
              ))}
              <th style={{ padding: '0.625rem 0.5rem', textAlign: 'right', color: '#4A5568', fontWeight: 600 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#A0AEC0' }}>
                  No services found
                </td>
              </tr>
            )}
            {filtered.map(service => {
              const catColor = CATEGORY_COLORS[service.category] || { bg: '#EDF2F7', color: '#4A5568' };
              const statColor = STATUS_COLORS[service.status] || { bg: '#EDF2F7', color: '#4A5568' };

              return (
                <tr key={service.id} style={{ borderBottom: '1px solid #EDF2F7' }}>
                  <td style={{ padding: '0.5rem' }}>
                    <div style={{ fontWeight: 500, color: '#1a1a2e' }}>{service.name}</div>
                    {service.description && (
                      <div style={{ fontSize: '0.75rem', color: '#A0AEC0', marginTop: '0.125rem' }}>
                        {service.description.length > 80
                          ? service.description.slice(0, 80) + '...'
                          : service.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      background: catColor.bg,
                      color: catColor.color,
                    }}>
                      {service.category}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    {service.status && (
                      <span style={{
                        display: 'inline-block',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: statColor.bg,
                        color: statColor.color,
                      }}>
                        {service.status}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>
                    {service.hours_low != null && service.hours_high != null
                      ? `${service.hours_low}–${service.hours_high}h`
                      : service.hours_low ? `${service.hours_low}h` : '—'}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    {service.default_rate ? `$${parseFloat(service.default_rate).toLocaleString()}` : '—'}
                  </td>
                  <td style={{ padding: '0.5rem', color: '#718096' }}>
                    {service.owner || '—'}
                  </td>
                  <td style={{ padding: '0.5rem', color: '#718096', fontSize: '0.8rem' }}>
                    {service.primary_function || '—'}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => onEdit?.(service)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: '#EDF2F7',
                        border: 'none',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        color: '#4A5568',
                        cursor: 'pointer',
                        marginRight: '0.25rem',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${service.name}"?`)) {
                          onDelete?.(service.id);
                        }
                      }}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: '#FED7D7',
                        border: 'none',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        color: '#9B2C2C',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
