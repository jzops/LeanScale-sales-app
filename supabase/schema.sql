-- LeanScale Sales App - Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CUSTOMERS TABLE
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

-- Index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_customers_slug ON customers(slug);

-- ============================================
-- AVAILABILITY DATES TABLE
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

-- Index on date for fast lookups
CREATE INDEX IF NOT EXISTS idx_availability_dates_date ON availability_dates(date);

-- ============================================
-- FORM SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  form_type TEXT NOT NULL CHECK (form_type IN ('getting_started', 'diagnostic_intake', 'contact')),
  data JSONB NOT NULL,
  slack_notified BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by customer
CREATE INDEX IF NOT EXISTS idx_form_submissions_customer ON form_submissions(customer_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_type ON form_submissions(form_type);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to customers
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to availability_dates
DROP TRIGGER IF EXISTS update_availability_dates_updated_at ON availability_dates;
CREATE TRIGGER update_availability_dates_updated_at
  BEFORE UPDATE ON availability_dates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Customers: Anyone can read, only service_role can write
DROP POLICY IF EXISTS "Allow public read on customers" ON customers;
CREATE POLICY "Allow public read on customers"
  ON customers FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow service_role full access on customers" ON customers;
CREATE POLICY "Allow service_role full access on customers"
  ON customers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Availability: Anyone can read, only service_role can write
DROP POLICY IF EXISTS "Allow public read on availability_dates" ON availability_dates;
CREATE POLICY "Allow public read on availability_dates"
  ON availability_dates FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow service_role full access on availability_dates" ON availability_dates;
CREATE POLICY "Allow service_role full access on availability_dates"
  ON availability_dates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Form submissions: Only service_role can read/write
DROP POLICY IF EXISTS "Allow service_role full access on form_submissions" ON form_submissions;
CREATE POLICY "Allow service_role full access on form_submissions"
  ON form_submissions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- SAMPLE DATA: Demo Customer
-- ============================================
INSERT INTO customers (slug, name, password, nda_link, intake_form_link, youtube_video_id, google_slides_embed_url, assigned_team, is_demo)
VALUES (
  'demo',
  'Demo',
  'demo2026',
  'https://powerforms.docusign.net/0758efed-0a42-4275-b5d9-f26875d64ae6?env=na4&acct=9287b4d2-50a6-4309-b7e8-7f0b785470c0&accountId=9287b4d2-50a6-4309-b7e8-7f0b785470c0',
  'https://forms.fillout.com/t/nqEbrHoL5Eus',
  'M7oECb8xsy0',
  'https://docs.google.com/presentation/d/e/2PACX-1vSGSLvHvPn9Cus6N3BpGnK6AkZsUiEdh8cARVVBiZ4w54uUCjHHJ-lHfymW8wfPPraAXMfgXtePxIwf/pubembed?start=true&loop=true&delayms=3000',
  ARRAY['izzy', 'brian', 'dave', 'kavean'],
  TRUE
) ON CONFLICT (slug) DO NOTHING;

-- Sample customer: Parafimy (from existing config)
INSERT INTO customers (slug, name, password, nda_link, intake_form_link, youtube_video_id, google_slides_embed_url, assigned_team, is_demo)
VALUES (
  'parafimy',
  'Parafimy',
  'demo2026',
  'https://powerforms.docusign.net/0758efed-0a42-4275-b5d9-f26875d64ae6?env=na4&acct=9287b4d2-50a6-4309-b7e8-7f0b785470c0&accountId=9287b4d2-50a6-4309-b7e8-7f0b785470c0',
  'https://forms.fillout.com/t/nqEbrHoL5Eus',
  'M7oECb8xsy0',
  'https://docs.google.com/presentation/d/e/2PACX-1vSGSLvHvPn9Cus6N3BpGnK6AkZsUiEdh8cARVVBiZ4w54uUCjHHJ-lHfymW8wfPPraAXMfgXtePxIwf/pubembed?start=true&loop=true&delayms=3000',
  ARRAY['izzy', 'brian', 'dave', 'kavean'],
  FALSE
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SAMPLE DATA: Availability Dates (Next 6 cohorts)
-- ============================================
INSERT INTO availability_dates (date, cohort_number, status, spots_total, spots_left)
VALUES
  ('2026-02-02', 1, 'waitlist', 4, 0),
  ('2026-02-16', 2, 'waitlist', 4, 0),
  ('2026-03-02', 3, 'limited', 4, 2),
  ('2026-03-16', 4, 'available', 4, 3),
  ('2026-03-30', 5, 'available', 4, 4),
  ('2026-04-13', 6, 'available', 4, 4)
ON CONFLICT (date) DO NOTHING;
