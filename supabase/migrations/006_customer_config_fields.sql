-- Migration: Add customer configuration fields
-- diagnostic_type: which diagnostic this customer uses (gtm, clay, cpq)
-- customer_type: prospect, active, or churned (drives nav + features)

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS diagnostic_type TEXT DEFAULT 'gtm'
    CHECK (diagnostic_type IN ('gtm', 'clay', 'cpq')),
  ADD COLUMN IF NOT EXISTS customer_type TEXT DEFAULT 'prospect'
    CHECK (customer_type IN ('prospect', 'active', 'churned'));

-- Update existing demo customer
UPDATE customers SET customer_type = 'prospect', diagnostic_type = 'gtm' WHERE slug = 'demo';
