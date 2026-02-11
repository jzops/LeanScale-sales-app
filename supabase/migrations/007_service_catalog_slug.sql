-- Migration: Add slug column to service_catalog for bridging
-- static services-catalog.js IDs with database records
-- Diagnostic processes reference services via slug (e.g., "activity-capture")

ALTER TABLE service_catalog ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_service_catalog_slug ON service_catalog(slug);
