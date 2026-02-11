-- Phase 5: Service Catalog
-- Stores predefined service types with hours, rates, and diagnostic mappings

CREATE TABLE IF NOT EXISTS service_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core identity
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,  -- 'Power10', 'Strategic', 'Managed Services', 'Custom Diagnostic', 'Tool Diagnostic', 'Tool Project'

  -- Delivery model
  status TEXT,              -- 'Ready for Diagnostic', 'Pending Basic Info', 'Missing Rubric'
  delivery_model TEXT,      -- 'Menu' (standardized) or 'Custom' (variable)
  project_type TEXT,        -- 'Strategic', 'Technical', 'Strategic & Technical'

  -- Hours and pricing
  hours_low INTEGER,        -- e.g., 20
  hours_high INTEGER,       -- e.g., 50
  default_rate NUMERIC(10,2),

  -- Team
  owner TEXT,               -- Primary owner
  team_members TEXT[] DEFAULT '{}',

  -- GTM classification
  primary_function TEXT,    -- 'Cross Functional', 'Marketing', 'Sales', 'Customer Success', 'Partnerships'
  functions TEXT[] DEFAULT '{}',
  primary_gtm_outcome TEXT, -- 'Foundational', 'Increase Pipeline', 'Reduce Churn', etc.
  gtm_outcomes TEXT[] DEFAULT '{}',
  power10_metric TEXT,      -- 'ARR', 'Bookings', 'Pipeline production', etc.

  -- Tools and diagnostic mapping
  tools TEXT[] DEFAULT '{}',
  diagnostic_types TEXT[] DEFAULT '{}',
  gtm_metrics TEXT[] DEFAULT '{}',

  -- Implementation details
  key_steps JSONB DEFAULT '[]',
  diagnostic_rubric JSONB,
  default_phases JSONB DEFAULT '[]',
  related_services TEXT[] DEFAULT '{}',

  -- State
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_catalog_category ON service_catalog(category);
CREATE INDEX IF NOT EXISTS idx_service_catalog_function ON service_catalog(primary_function);
CREATE INDEX IF NOT EXISTS idx_service_catalog_active ON service_catalog(active);

-- Allow service_role full access (bypasses RLS)
ALTER TABLE service_catalog ENABLE ROW LEVEL SECURITY;

-- Public read access for authenticated users
DROP POLICY IF EXISTS "service_catalog_read" ON service_catalog;
CREATE POLICY "service_catalog_read" ON service_catalog
  FOR SELECT USING (true);

-- Service role full access
DROP POLICY IF EXISTS "service_catalog_admin" ON service_catalog;
CREATE POLICY "service_catalog_admin" ON service_catalog
  FOR ALL USING (true) WITH CHECK (true);

-- Add service_catalog_id to sow_sections for tracking which catalog item seeded a section
ALTER TABLE sow_sections
  ADD COLUMN IF NOT EXISTS service_catalog_id UUID REFERENCES service_catalog(id) ON DELETE SET NULL;
