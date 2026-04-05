-- Migration: Add tags column to use_cases for categorization
-- Created: 2026-04-05

ALTER TABLE use_cases
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];

COMMENT ON COLUMN use_cases.tags IS 'User-defined tags for categorizing AI systems (e.g. produccion, experimental, interno)';

CREATE INDEX IF NOT EXISTS idx_use_cases_tags ON use_cases USING GIN(tags);
