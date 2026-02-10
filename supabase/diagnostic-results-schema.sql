-- LeanScale Sales App - Diagnostic Results & Notes Schema
-- Per-customer configurable diagnostic results with inline notes
-- Run this in the Supabase SQL Editor after schema.sql (requires customers table and update_updated_at_column trigger)

-- ============================================
-- DIAGNOSTIC RESULTS TABLE
-- ============================================
-- One row per customer per diagnostic type
-- processes JSONB stores the full array in the same shape as diagnostic-data.js
CREATE TABLE IF NOT EXISTS diagnostic_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  diagnostic_type TEXT NOT NULL
    CHECK (diagnostic_type IN ('gtm', 'clay', 'cpq')),

  -- Process data array (same shape as static data files)
  -- Each element: { name, status, addToEngagement, function, outcome, metric, ... }
  processes JSONB NOT NULL DEFAULT '[]',

  -- Tools data (GTM only)
  tools JSONB DEFAULT '[]',

  -- Metadata
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One result per customer per type
  UNIQUE(customer_id, diagnostic_type)
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_results_customer
  ON diagnostic_results(customer_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_type
  ON diagnostic_results(diagnostic_type);

CREATE TRIGGER update_diagnostic_results_updated_at
  BEFORE UPDATE ON diagnostic_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE diagnostic_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access on diagnostic_results"
  ON diagnostic_results FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- DIAGNOSTIC NOTES TABLE
-- ============================================
-- Inline notes/comments on individual process line items
CREATE TABLE IF NOT EXISTS diagnostic_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagnostic_result_id UUID NOT NULL
    REFERENCES diagnostic_results(id) ON DELETE CASCADE,

  -- Which process item this note is on (matches processes[].name)
  process_name TEXT NOT NULL,

  -- The note content
  note TEXT NOT NULL,

  -- Who wrote it
  author TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_notes_result
  ON diagnostic_notes(diagnostic_result_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_notes_process
  ON diagnostic_notes(process_name);

CREATE TRIGGER update_diagnostic_notes_updated_at
  BEFORE UPDATE ON diagnostic_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE diagnostic_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access on diagnostic_notes"
  ON diagnostic_notes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
