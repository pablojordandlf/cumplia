-- Migration: Add missing columns to risk_templates for applicability rules
-- Created: 2026-03-23

-- Add columns if they don't exist
DO $$
BEGIN
    -- applies_to_levels: array of AI Act levels this template applies to
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'risk_templates' AND column_name = 'applies_to_levels'
    ) THEN
        ALTER TABLE risk_templates ADD COLUMN applies_to_levels text[] DEFAULT ARRAY[]::text[];
    END IF;

    -- excluded_systems: array of use_case IDs explicitly excluded
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'risk_templates' AND column_name = 'excluded_systems'
    ) THEN
        ALTER TABLE risk_templates ADD COLUMN excluded_systems uuid[] DEFAULT ARRAY[]::uuid[];
    END IF;

    -- included_systems: array of use_case IDs explicitly included (exceptions)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'risk_templates' AND column_name = 'included_systems'
    ) THEN
        ALTER TABLE risk_templates ADD COLUMN included_systems uuid[] DEFAULT ARRAY[]::uuid[];
    END IF;
END $$;

-- Create or replace function to get applicable template IDs for a use_case
CREATE OR REPLACE FUNCTION get_applicable_template_ids(p_use_case_id uuid)
RETURNS uuid[] AS $$
DECLARE
    v_ai_act_level text;
    v_organization_id uuid;
    v_use_case_id uuid;
    v_template_ids uuid[];
BEGIN
    -- Get use case info
    SELECT uc.id, uc.ai_act_level, uc.organization_id
    INTO v_use_case_id, v_ai_act_level, v_organization_id
    FROM use_cases uc
    WHERE uc.id = p_use_case_id;

    IF v_use_case_id IS NULL THEN
        RETURN ARRAY[]::uuid[];
    END IF;

    -- Find applicable templates:
    -- 1. Template is active
    -- 2. Template applies to this use case's ai_act_level (in applies_to_levels array)
    -- 3. AND use case is NOT in excluded_systems
    -- 4. OR use case IS in included_systems (exception)
    SELECT ARRAY_AGG(rt.id)
    INTO v_template_ids
    FROM risk_templates rt
    WHERE rt.is_active = true
      AND (
          -- Template is system-wide OR belongs to this organization
          (rt.is_system = true OR rt.organization_id = v_organization_id)
          AND (
              -- Applies by level AND not excluded
              (v_ai_act_level = ANY(COALESCE(rt.applies_to_levels, ARRAY[v_ai_act_level]))
               AND NOT (v_use_case_id = ANY(COALESCE(rt.excluded_systems, ARRAY[]::uuid[])))
              )
              -- OR explicitly included as exception
              OR (v_use_case_id = ANY(COALESCE(rt.included_systems, ARRAY[]::uuid[])))
          )
      );

    RETURN COALESCE(v_template_ids, ARRAY[]::uuid[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for better performance on array lookups
CREATE INDEX IF NOT EXISTS idx_risk_templates_applies_to_levels ON risk_templates USING GIN(applies_to_levels);
CREATE INDEX IF NOT EXISTS idx_risk_templates_excluded_systems ON risk_templates USING GIN(excluded_systems);
CREATE INDEX IF NOT EXISTS idx_risk_templates_included_systems ON risk_templates USING GIN(included_systems);

-- Update existing system templates to have proper applies_to_levels
UPDATE risk_templates 
SET applies_to_levels = ARRAY[ai_act_level]::text[]
WHERE is_system = true AND (applies_to_levels IS NULL OR array_length(applies_to_levels, 1) IS NULL);

-- Comment explaining the migration
COMMENT ON FUNCTION get_applicable_template_ids(uuid) IS 
'Returns array of template IDs that apply to a given use case based on AI Act level and exception rules';
