-- Migration: Add support for multiple risk levels in custom_field_templates
-- This allows a single template to apply to multiple AI Act levels

-- 1. Create new column with array type
ALTER TABLE custom_field_templates
ADD COLUMN applies_to_levels TEXT[] DEFAULT ARRAY['global']::TEXT[];

-- 2. Migrate existing data from applies_to to applies_to_levels
UPDATE custom_field_templates
SET applies_to_levels = ARRAY[applies_to]::TEXT[]
WHERE applies_to IS NOT NULL;

-- 3. Update indexes
DROP INDEX IF EXISTS idx_custom_field_templates_applies_to;
CREATE INDEX IF NOT EXISTS idx_custom_field_templates_applies_to_levels 
ON custom_field_templates USING GIN(applies_to_levels);

-- 4. Add index for backwards compatibility queries
CREATE INDEX IF NOT EXISTS idx_custom_field_templates_applies_to_simple
ON custom_field_templates(applies_to);

-- 5. Comment the new column
COMMENT ON COLUMN custom_field_templates.applies_to_levels IS 'Array of AI Act levels this template applies to: "global", "prohibited", "high_risk", "limited_risk", "minimal_risk", "gpai_model", "gpai_system", "gpai_sr", "unclassified"';

-- Note: applies_to column is kept for backwards compatibility but will be deprecated
COMMENT ON COLUMN custom_field_templates.applies_to IS 'DEPRECATED: Use applies_to_levels instead. Kept for backwards compatibility.';
