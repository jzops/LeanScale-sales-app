/**
 * SowBuilder - Main SOW builder orchestrating diagnostic item selection + section management
 *
 * Two-panel layout:
 *   Left:  DiagnosticItemPicker (select items to include)
 *   Right: SectionEditor list (organize items into named bundles)
 *
 * Props:
 *   sow              - The SOW object (from API)
 *   sections         - Array of SOW sections (from API)
 *   diagnosticResult - The diagnostic result object with processes array
 *   onSave()         - Callback after saving
 */

import { useState, useMemo, useRef } from 'react';
import DiagnosticItemPicker from './DiagnosticItemPicker';
import SectionEditor from './SectionEditor';
import CatalogPicker from './CatalogPicker';

export default function SowBuilder({
  sow,
  sections: initialSections = [],
  diagnosticResult,
  onSave,
}) {
  const [sections, setSections] = useState(initialSections);
  const [selectedItems, setSelectedItems] = useState(() => {
    // If sections already have assigned items, use those
    const existingItems = new Set();
    initialSections.forEach(s => {
      (s.diagnostic_items || []).forEach(name => existingItems.add(name));
    });
    if (existingItems.size > 0) {
      return Array.from(existingItems);
    }
    // New SOW with no assigned items: auto-select warning/unable items
    const processes = diagnosticResult?.processes || [];
    return processes
      .filter(p => p.status === 'warning' || p.status === 'unable')
      .map(p => p.name);
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null); // section ID being assigned items to
  const [showCatalog, setShowCatalog] = useState(false);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const processes = diagnosticResult?.processes || [];

  // Build a map of process name → process data for quick lookup
  const processMap = useMemo(() => {
    const map = {};
    processes.forEach(p => { map[p.name] = p; });
    return map;
  }, [processes]);

  // Build a map of which items are assigned to which sections
  const assignedItems = useMemo(() => {
    const map = {};
    sections.forEach(s => {
      (s.diagnostic_items || []).forEach(name => {
        map[name] = s.title || 'Untitled Section';
      });
    });
    return map;
  }, [sections]);

  // --- Section CRUD ---

  async function addSection() {
    try {
      const res = await fetch(`/api/sow/${sow.id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Section ${sections.length + 1}`,
          sortOrder: sections.length,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSections(prev => [...prev, json.data]);
        setActiveSection(json.data.id);
      }
    } catch (err) {
      setError('Failed to add section. Please try again.');
    }
  }

  async function addSectionFromCatalog(service) {
    setShowCatalog(false);
    try {
      // Use the average of hours_low and hours_high, or hours_low if only one exists
      const hours = service.hours_low && service.hours_high
        ? Math.round((service.hours_low + service.hours_high) / 2)
        : service.hours_low || null;

      const res = await fetch(`/api/sow/${sow.id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: service.name,
          description: service.description || '',
          hours: hours,
          rate: service.default_rate ? parseFloat(service.default_rate) : null,
          deliverables: (service.key_steps || []).map(step =>
            typeof step === 'string' ? step : step.name || step.title || String(step)
          ),
          sortOrder: sections.length,
          service_catalog_id: service.id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSections(prev => [...prev, json.data]);
        setActiveSection(json.data.id);
      }
    } catch (err) {
      setError('Failed to add section from catalog. Please try again.');
    }
  }

  async function updateSection(sectionId, updates) {
    try {
      const res = await fetch(`/api/sow/${sow.id}/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success) {
        setSections(prev => prev.map(s => s.id === sectionId ? json.data : s));
      }
    } catch (err) {
      setError('Failed to update section. Please try again.');
    }
  }

  async function deleteSection(sectionId) {
    try {
      const res = await fetch(`/api/sow/${sow.id}/sections/${sectionId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setSections(prev => prev.filter(s => s.id !== sectionId));
      }
    } catch (err) {
      setError('Failed to delete section. Please try again.');
    }
  }

  // --- Assign selected items to active section ---

  function assignItemsToSection(sectionId) {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    // Get currently unassigned selected items
    const unassigned = selectedItems.filter(name => !assignedItems[name]);
    if (unassigned.length === 0) return;

    const updatedDiagnosticItems = [...(section.diagnostic_items || []), ...unassigned];
    updateSection(sectionId, { diagnosticItems: updatedDiagnosticItems });
  }

  function removeItemFromSection(sectionId, itemName) {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const updatedDiagnosticItems = (section.diagnostic_items || []).filter(n => n !== itemName);
    updateSection(sectionId, { diagnosticItems: updatedDiagnosticItems });
  }

  // --- Drag and drop reordering ---

  function handleDragStart(index) {
    dragItem.current = index;
  }

  function handleDragEnter(index) {
    dragOverItem.current = index;
  }

  async function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const reordered = [...sections];
    const [dragged] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, dragged);

    setSections(reordered);
    dragItem.current = null;
    dragOverItem.current = null;

    // Persist new order to API
    const ordering = reordered.map((s, i) => ({ id: s.id, sortOrder: i }));
    try {
      await fetch(`/api/sow/${sow.id}/sections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordering }),
      });
    } catch (err) {
      setError('Failed to save section order. Please try again.');
    }
  }

  // --- Save all & recalculate totals ---

  async function handleSaveAll() {
    setSaving(true);
    try {
      // Calculate totals from all sections
      let totalHours = 0;
      let totalInvestment = 0;
      let minDate = null;
      let maxDate = null;

      sections.forEach(s => {
        const h = parseFloat(s.hours) || 0;
        const r = parseFloat(s.rate) || 0;
        totalHours += h;
        totalInvestment += h * r;

        if (s.start_date && (!minDate || s.start_date < minDate)) minDate = s.start_date;
        if (s.end_date && (!maxDate || s.end_date > maxDate)) maxDate = s.end_date;
      });

      // Update the SOW with calculated totals
      await fetch(`/api/sow/${sow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalHours,
          totalInvestment,
          startDate: minDate,
          endDate: maxDate,
        }),
      });

      onSave?.();
    } catch (err) {
      setError('Failed to save SOW. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Summary calculations
  const totalHours = sections.reduce((sum, s) => sum + (parseFloat(s.hours) || 0), 0);
  const totalInvestment = sections.reduce((sum, s) => {
    const h = parseFloat(s.hours) || 0;
    const r = parseFloat(s.rate) || 0;
    return sum + (h * r);
  }, 0);
  const unassignedCount = selectedItems.filter(name => !assignedItems[name]).length;

  return (
    <div>
      {/* Error banner */}
      {error && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1.25rem',
          background: '#FFF5F5',
          border: '1px solid #FED7D7',
          borderRadius: '0.75rem',
          marginBottom: '1rem',
          color: '#9B2C2C',
          fontSize: '0.875rem',
        }}>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#9B2C2C',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0 0.25rem',
            }}
          >
            x
          </button>
        </div>
      )}

      {/* Summary bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.25rem',
        background: '#F7FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '0.75rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
          <SummaryItem label="Sections" value={sections.length} />
          <SummaryItem label="Total Hours" value={totalHours} />
          <SummaryItem label="Total Investment" value={`$${totalInvestment.toLocaleString()}`} color="#276749" />
          <SummaryItem label="Items Selected" value={selectedItems.length} />
          {unassignedCount > 0 && (
            <SummaryItem label="Unassigned" value={unassignedCount} color="#E53E3E" />
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#6C5CE7',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: saving ? 'wait' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save SOW'}
          </button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        alignItems: 'start',
      }}>
        {/* Left panel: Diagnostic Item Picker */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
              Diagnostic Items
            </h3>
            {activeSection && unassignedCount > 0 && (
              <button
                onClick={() => assignItemsToSection(activeSection)}
                style={{
                  padding: '0.35rem 0.75rem',
                  background: '#6C5CE7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Add {unassignedCount} to Section
              </button>
            )}
          </div>
          <DiagnosticItemPicker
            processes={processes}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            assignedItems={assignedItems}
          />
        </div>

        {/* Right panel: Sections */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
              SOW Sections
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setShowCatalog(true)}
                style={{
                  padding: '0.35rem 0.75rem',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                + From Catalog
              </button>
              <button
                onClick={addSection}
                style={{
                  padding: '0.35rem 0.75rem',
                  background: '#6C5CE7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                + Blank Section
              </button>
            </div>
          </div>

          {sections.length === 0 ? (
            <div style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              border: '2px dashed #E2E8F0',
              borderRadius: '0.75rem',
              color: '#A0AEC0',
            }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                No sections yet. Create sections to organize diagnostic items into SOW bundles.
              </p>
              <button
                onClick={addSection}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#6C5CE7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Create First Section
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    outline: activeSection === section.id ? '2px solid #6C5CE7' : 'none',
                    outlineOffset: '2px',
                    borderRadius: '0.75rem',
                    cursor: 'grab',
                  }}
                >
                  <SectionEditor
                    section={section}
                    onUpdate={(updates) => updateSection(section.id, updates)}
                    onDelete={() => deleteSection(section.id)}
                    diagnosticItems={processMap}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Catalog picker modal */}
      {showCatalog && (
        <CatalogPicker
          onSelect={addSectionFromCatalog}
          onCancel={() => setShowCatalog(false)}
        />
      )}
    </div>
  );
}

function SummaryItem({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontWeight: 600, color: color || '#1a1a2e' }}>
        {value}
      </div>
    </div>
  );
}
