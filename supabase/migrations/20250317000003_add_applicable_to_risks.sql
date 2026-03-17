-- Migration: 20250317000003_add_applicable_to_risks.sql
-- Description: Add applicable field to ai_system_risks for risk applicability toggle

-- Add applicable column with default true (all existing risks apply by default)
ALTER TABLE ai_system_risks 
ADD COLUMN IF NOT EXISTS applicable boolean DEFAULT true;

-- Update existing risks: set applicable based on status
UPDATE ai_system_risks 
SET applicable = (status != 'not_applicable')
WHERE applicable IS NULL;

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_ai_system_risks_applicable ON ai_system_risks(applicable);

COMMENT ON COLUMN ai_system_risks.applicable IS 'Whether this risk applies to this AI system (user toggle)';
