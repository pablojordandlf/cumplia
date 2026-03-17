-- Migration: 20250317000003_add_applicable_to_risks.sql
-- Description: Add applicable field to ai_system_risks for risk applicability toggle

-- Add applicable column with default false (all risks don't apply by default)
ALTER TABLE ai_system_risks 
ADD COLUMN IF NOT EXISTS applicable boolean DEFAULT false;

-- Update existing risks: set all to not applicable by default
-- Users will manually activate the ones that apply
UPDATE ai_system_risks 
SET applicable = false
WHERE applicable IS NULL;

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_ai_system_risks_applicable ON ai_system_risks(applicable);

COMMENT ON COLUMN ai_system_risks.applicable IS 'Whether this risk applies to this AI system (user toggle)';
