-- LeanScale Sales App - SOW & Diagnostic Snapshots Schema
-- Phase 4: Statement of Work and diagnostic snapshot tables
-- Run this in the Supabase SQL Editor after the base schema.sql

-- ============================================
-- SOW TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'sent', 'accepted', 'declined')),
  sow_type TEXT NOT NULL
    CHECK (sow_type IN ('clay', 'q2c', 'embedded', 'custom')),

  -- Inputs
  intake_submission_id UUID REFERENCES form_submissions(id) ON DELETE SET NULL,
  transcript_text TEXT,
  diagnostic_snapshot JSONB,

  -- Output
  content JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ,

  -- Metadata
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sows_customer ON sows(customer_id);
CREATE INDEX IF NOT EXISTS idx_sows_status ON sows(status);

CREATE TRIGGER update_sows_updated_at
  BEFORE UPDATE ON sows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE sows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access on sows"
  ON sows FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- DIAGNOSTIC SNAPSHOTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS diagnostic_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  diagnostic_type TEXT NOT NULL
    CHECK (diagnostic_type IN ('gtm', 'clay', 'cpq')),
  data JSONB NOT NULL,
  assessed_by TEXT,
  assessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_snapshots_customer ON diagnostic_snapshots(customer_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_snapshots_type ON diagnostic_snapshots(diagnostic_type);

ALTER TABLE diagnostic_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access on diagnostic_snapshots"
  ON diagnostic_snapshots FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ADD CUSTOMER_TYPE TO CUSTOMERS
-- ============================================
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS customer_type TEXT DEFAULT 'active'
    CHECK (customer_type IN ('prospect', 'active', 'churned'));
