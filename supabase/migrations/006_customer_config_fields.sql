-- Migration: Add customer configuration fields
-- diagnostic_type: which diagnostic this customer uses (gtm, clay, cpq)
-- customer_type: active (default), prospect, or churned (drives nav + features)

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS diagnostic_type TEXT DEFAULT 'gtm'
    CHECK (diagnostic_type IN ('gtm', 'clay', 'cpq')),
  ADD COLUMN IF NOT EXISTS customer_type TEXT DEFAULT 'active'
    CHECK (customer_type IN ('prospect', 'active', 'churned'));

-- Demo customer stays as prospect (shows Why/Try/Buy nav)
UPDATE customers SET customer_type = 'prospect', diagnostic_type = 'gtm' WHERE slug = 'demo';

-- All non-demo customers default to active
UPDATE customers SET customer_type = 'active' WHERE slug != 'demo' AND (customer_type IS NULL OR customer_type = 'prospect');
