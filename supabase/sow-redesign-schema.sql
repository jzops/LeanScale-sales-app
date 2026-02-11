-- LeanScale Sales App - SOW Redesign Schema (Self-Contained)
-- Creates prerequisite tables if missing, then adds sow_sections, sow_versions,
-- and new columns on sows.
-- Safe to re-run — uses IF NOT EXISTS / IF NOT EXISTS throughout.

-- ============================================
-- PREREQUISITES: Ensure base tables exist
-- ============================================

-- uuid-ossp extension (may already exist)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- update_updated_at_column trigger function (defined in schema.sql, safe to re-create)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- SOW table (defined in sow-schema.sql — create if not present)
CREATE TABLE IF NOT EXISTS sows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'sent', 'accepted', 'declined')),
  sow_type TEXT NOT NULL DEFAULT 'custom'
    CHECK (sow_type IN ('clay', 'q2c', 'embedded', 'custom')),
  intake_submission_id UUID,
  transcript_text TEXT,
  diagnostic_snapshot JSONB,
  content JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sows_customer ON sows(customer_id);
CREATE INDEX IF NOT EXISTS idx_sows_status ON sows(status);

-- RLS for sows (idempotent — will skip if already enabled)
ALTER TABLE sows ENABLE ROW LEVEL SECURITY;

-- Drop-and-recreate policy to avoid "already exists" errors
DROP POLICY IF EXISTS "Allow service_role full access on sows" ON sows;
CREATE POLICY "Allow service_role full access on sows"
  ON sows FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Diagnostic results table (defined in diagnostic-results-schema.sql)
CREATE TABLE IF NOT EXISTS diagnostic_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL,
  diagnostic_type TEXT NOT NULL
    CHECK (diagnostic_type IN ('gtm', 'clay', 'cpq')),
  processes JSONB NOT NULL DEFAULT '[]',
  tools JSONB DEFAULT '[]',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, diagnostic_type)
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_results_customer ON diagnostic_results(customer_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_type ON diagnostic_results(diagnostic_type);

ALTER TABLE diagnostic_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access on diagnostic_results" ON diagnostic_results;
CREATE POLICY "Allow service_role full access on diagnostic_results"
  ON diagnostic_results FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Diagnostic notes table
CREATE TABLE IF NOT EXISTS diagnostic_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagnostic_result_id UUID NOT NULL
    REFERENCES diagnostic_results(id) ON DELETE CASCADE,
  process_name TEXT NOT NULL,
  note TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_notes_result ON diagnostic_notes(diagnostic_result_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_notes_process ON diagnostic_notes(process_name);

ALTER TABLE diagnostic_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access on diagnostic_notes" ON diagnostic_notes;
CREATE POLICY "Allow service_role full access on diagnostic_notes"
  ON diagnostic_notes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- SOW SECTIONS TABLE
-- ============================================
-- Replaces monolithic sows.content.scope JSONB with relational sections
-- linked to diagnostic items
CREATE TABLE IF NOT EXISTS sow_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sow_id UUID NOT NULL REFERENCES sows(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  deliverables JSONB DEFAULT '[]',

  -- Hours and pricing
  hours NUMERIC(10,2),
  rate NUMERIC(10,2),

  -- Timeline
  start_date DATE,
  end_date DATE,

  -- Linked diagnostic items (array of process names from diagnostic_results.processes)
  diagnostic_items JSONB DEFAULT '[]',

  -- Ordering
  sort_order INTEGER DEFAULT 0,

  -- Teamwork references (populated after push-to-teamwork)
  teamwork_milestone_id INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sow_sections_sow ON sow_sections(sow_id);

DROP TRIGGER IF EXISTS update_sow_sections_updated_at ON sow_sections;
CREATE TRIGGER update_sow_sections_updated_at
  BEFORE UPDATE ON sow_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE sow_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access on sow_sections" ON sow_sections;
CREATE POLICY "Allow service_role full access on sow_sections"
  ON sow_sections FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- SOW VERSIONS TABLE
-- ============================================
-- Timestamped snapshots created on PDF export
CREATE TABLE IF NOT EXISTS sow_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sow_id UUID NOT NULL REFERENCES sows(id) ON DELETE CASCADE,

  version_number INTEGER NOT NULL,
  content_snapshot JSONB NOT NULL,   -- Full SOW content at time of export
  sections_snapshot JSONB NOT NULL,  -- All sections at time of export

  exported_by TEXT,
  exported_at TIMESTAMPTZ DEFAULT NOW(),

  -- PDF storage (URL or path)
  pdf_url TEXT,

  UNIQUE(sow_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_sow_versions_sow ON sow_versions(sow_id);

ALTER TABLE sow_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access on sow_versions" ON sow_versions;
CREATE POLICY "Allow service_role full access on sow_versions"
  ON sow_versions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- MODIFY SOWS TABLE - Add new columns
-- ============================================
-- Links to diagnostic_results rows
ALTER TABLE sows ADD COLUMN IF NOT EXISTS
  diagnostic_result_ids UUID[] DEFAULT '{}';

-- Computed from linked diagnostic items
ALTER TABLE sows ADD COLUMN IF NOT EXISTS
  overall_rating TEXT;

-- Totals (auto-calculated from sections)
ALTER TABLE sows ADD COLUMN IF NOT EXISTS
  total_hours NUMERIC(10,2);

ALTER TABLE sows ADD COLUMN IF NOT EXISTS
  total_investment NUMERIC(10,2);

-- Timeline
ALTER TABLE sows ADD COLUMN IF NOT EXISTS
  start_date DATE;

ALTER TABLE sows ADD COLUMN IF NOT EXISTS
  end_date DATE;

-- Teamwork integration references
ALTER TABLE sows ADD COLUMN IF NOT EXISTS
  teamwork_project_id INTEGER;

ALTER TABLE sows ADD COLUMN IF NOT EXISTS
  teamwork_project_url TEXT;

-- Version tracking
ALTER TABLE sows ADD COLUMN IF NOT EXISTS
  current_version INTEGER DEFAULT 0;
