-- LeanScale Sales App — Consolidated Schema
-- Version: 001
-- Date: 2026-02-11
-- Replaces: schema.sql, sow-schema.sql, sow-redesign-schema.sql, diagnostic-results-schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CUSTOMERS
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  password TEXT NOT NULL,
  nda_link TEXT,
  intake_form_link TEXT,
  assigned_team TEXT[] DEFAULT '{}',
  youtube_video_id TEXT,
  google_slides_embed_url TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  diagnostic_type TEXT DEFAULT 'gtm' CHECK (diagnostic_type IN ('gtm', 'clay', 'cpq')),
  customer_type TEXT DEFAULT 'active' CHECK (customer_type IN ('prospect', 'active', 'churned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_slug ON customers(slug);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);

-- ============================================
-- AVAILABILITY DATES
-- ============================================
CREATE TABLE IF NOT EXISTS availability_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  cohort_number INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'limited', 'waitlist', 'sold_out')),
  spots_total INTEGER DEFAULT 4,
  spots_left INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_availability_dates_date ON availability_dates(date);

-- ============================================
-- FORM SUBMISSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  form_type TEXT NOT NULL CHECK (form_type IN ('getting_started', 'diagnostic_intake', 'contact')),
  data JSONB NOT NULL,
  slack_notified BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_customer ON form_submissions(customer_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_type ON form_submissions(form_type);

-- ============================================
-- DIAGNOSTIC RESULTS
-- ============================================
CREATE TABLE IF NOT EXISTS diagnostic_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  diagnostic_type TEXT NOT NULL CHECK (diagnostic_type IN ('gtm', 'clay', 'cpq')),
  processes JSONB NOT NULL DEFAULT '[]',
  tools JSONB DEFAULT '[]',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, diagnostic_type)
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_results_customer ON diagnostic_results(customer_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_type ON diagnostic_results(diagnostic_type);

-- ============================================
-- DIAGNOSTIC NOTES
-- ============================================
CREATE TABLE IF NOT EXISTS diagnostic_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagnostic_result_id UUID NOT NULL REFERENCES diagnostic_results(id) ON DELETE CASCADE,
  process_name TEXT NOT NULL,
  note TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_notes_result ON diagnostic_notes(diagnostic_result_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_notes_process ON diagnostic_notes(process_name);

-- ============================================
-- SERVICE CATALOG
-- ============================================
CREATE TABLE IF NOT EXISTS service_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  subcategory TEXT,
  description TEXT,
  deliverables JSONB DEFAULT '[]',
  hours_low NUMERIC(10,2),
  hours_high NUMERIC(10,2),
  rate NUMERIC(10,2) DEFAULT 200.00,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_catalog_category ON service_catalog(category);
CREATE INDEX IF NOT EXISTS idx_service_catalog_active ON service_catalog(active);

-- ============================================
-- SOWS
-- ============================================
CREATE TABLE IF NOT EXISTS sows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'sent', 'accepted', 'declined')),
  sow_type TEXT NOT NULL DEFAULT 'custom'
    CHECK (sow_type IN ('clay', 'q2c', 'embedded', 'custom')),
  intake_submission_id UUID REFERENCES form_submissions(id) ON DELETE SET NULL,
  transcript_text TEXT,
  diagnostic_snapshot JSONB,
  content JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ,
  created_by TEXT,
  -- Diagnostic links
  diagnostic_result_ids UUID[] DEFAULT '{}',
  overall_rating TEXT,
  -- Totals (computed from sections)
  total_hours NUMERIC(10,2),
  total_investment NUMERIC(10,2),
  start_date DATE,
  end_date DATE,
  -- Teamwork integration
  teamwork_project_id INTEGER,
  teamwork_project_url TEXT,
  -- Versioning
  current_version INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sows_customer ON sows(customer_id);
CREATE INDEX IF NOT EXISTS idx_sows_status ON sows(status);
CREATE INDEX IF NOT EXISTS idx_sows_type ON sows(sow_type);

-- ============================================
-- SOW SECTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS sow_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sow_id UUID NOT NULL REFERENCES sows(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  deliverables JSONB DEFAULT '[]',
  hours NUMERIC(10,2),
  rate NUMERIC(10,2),
  start_date DATE,
  end_date DATE,
  diagnostic_items JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  service_catalog_id UUID REFERENCES service_catalog(id) ON DELETE SET NULL,
  teamwork_milestone_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sow_sections_sow ON sow_sections(sow_id);
CREATE INDEX IF NOT EXISTS idx_sow_sections_catalog ON sow_sections(service_catalog_id);

-- ============================================
-- SOW VERSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS sow_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sow_id UUID NOT NULL REFERENCES sows(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content_snapshot JSONB NOT NULL,
  sections_snapshot JSONB NOT NULL,
  exported_by TEXT,
  exported_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,
  UNIQUE(sow_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_sow_versions_sow ON sow_versions(sow_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'customers', 'availability_dates', 'diagnostic_results',
    'diagnostic_notes', 'sows', 'sow_sections', 'service_catalog'
  ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS update_%s_updated_at ON %I;
       CREATE TRIGGER update_%s_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      tbl, tbl, tbl, tbl
    );
  END LOOP;
END $$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'customers', 'availability_dates', 'form_submissions',
    'diagnostic_results', 'diagnostic_notes',
    'sows', 'sow_sections', 'sow_versions', 'service_catalog'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format(
      'DROP POLICY IF EXISTS "service_role_full_%s" ON %I;
       CREATE POLICY "service_role_full_%s" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true);',
      tbl, tbl, tbl, tbl
    );
  END LOOP;
END $$;

-- Public read on customers, availability, service_catalog
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['customers', 'availability_dates', 'service_catalog'])
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS "public_read_%s" ON %I;
       CREATE POLICY "public_read_%s" ON %I FOR SELECT TO anon, authenticated USING (true);',
      tbl, tbl, tbl, tbl
    );
  END LOOP;
END $$;
