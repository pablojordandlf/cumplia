-- Migration: 20250317000004_enhance_risk_templates.sql
-- Description: Add applicability rules and exception handling to risk templates

-- ============================================
-- 1. ADD APPLICABILITY COLUMNS TO RISK_TEMPLATES
-- ============================================

ALTER TABLE risk_templates
ADD COLUMN IF NOT EXISTS applies_to_levels text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS excluded_systems uuid[] DEFAULT ARRAY[]::uuid[],
ADD COLUMN IF NOT EXISTS included_systems uuid[] DEFAULT ARRAY[]::uuid[],
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

COMMENT ON COLUMN risk_templates.applies_to_levels IS 'Array of AI Act risk levels this template applies to by default';
COMMENT ON COLUMN risk_templates.excluded_systems IS 'Array of system IDs to exclude even if they match applies_to_levels';
COMMENT ON COLUMN risk_templates.included_systems IS 'Array of system IDs to include as exceptions even if outside applies_to_levels';
COMMENT ON COLUMN risk_templates.is_active IS 'Whether this template is currently active (can be disabled by admin)';

-- Update existing templates: set is_active = true for all
UPDATE risk_templates SET is_active = true WHERE is_active IS NULL;

-- Update existing templates: set applies_to_levels based on ai_act_level
UPDATE risk_templates SET applies_to_levels = ARRAY[ai_act_level]::text[] WHERE applies_to_levels IS NULL OR array_length(applies_to_levels, 1) IS NULL;

-- ============================================
-- 2. FUNCTION TO GET APPLICABLE TEMPLATES FOR A SYSTEM
-- ============================================

CREATE OR REPLACE FUNCTION get_applicable_template_ids(p_system_id uuid)
RETURNS uuid[] AS $$
DECLARE
  v_system_level text;
  v_result uuid[];
BEGIN
  -- Get the system's AI Act risk level
  SELECT ai_act_level INTO v_system_level
  FROM use_cases
  WHERE id = p_system_id;
  
  IF v_system_level IS NULL THEN
    RETURN ARRAY[]::uuid[];
  END IF;
  
  -- Get templates that apply to this system
  SELECT ARRAY_AGG(rt.id)
  INTO v_result
  FROM risk_templates rt
  WHERE rt.is_active = true
    AND (
      -- Template applies to this risk level AND system is not excluded
      (
        v_system_level = ANY(rt.applies_to_levels)
        AND NOT (p_system_id = ANY(rt.excluded_systems))
      )
      -- OR system is explicitly included as exception
      OR (p_system_id = ANY(rt.included_systems))
    );
  
  RETURN COALESCE(v_result, ARRAY[]::uuid[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_applicable_template_ids(uuid) IS 'Returns array of template IDs applicable to a given AI system based on risk level and exceptions';

-- ============================================
-- 3. CREATE SYSTEM TEMPLATES
-- ============================================

-- First, check if system templates already exist
DO $$
DECLARE
  v_high_risk_template_id uuid;
  v_limited_risk_template_id uuid;
  v_catalog_risk record;
  v_count int;
BEGIN
  -- Create "Riesgos Alto Riesgo" template if it doesn't exist
  SELECT id INTO v_high_risk_template_id
  FROM risk_templates
  WHERE is_system = true AND name = 'Riesgos Alto Riesgo';
  
  IF v_high_risk_template_id IS NULL THEN
    INSERT INTO risk_templates (
      name,
      description,
      ai_act_level,
      is_default,
      is_system,
      is_active,
      applies_to_levels
    ) VALUES (
      'Riesgos Alto Riesgo',
      'Plantilla pre-configurada con todos los riesgos del catálogo MIT para sistemas de Alto Riesgo según el AI Act. Incluye los 50 riesgos priorizados del MIT AI Risk Repository.',
      'high_risk',
      true,
      true,
      true,
      ARRAY['high_risk']::text[]
    )
    RETURNING id INTO v_high_risk_template_id;
    
    -- Add all 50 catalog risks to this template
    FOR v_catalog_risk IN SELECT id FROM risk_catalog WHERE is_active = true LOOP
      INSERT INTO risk_template_items (template_id, catalog_risk_id, is_required)
      VALUES (v_high_risk_template_id, v_catalog_risk.id, true)
      ON CONFLICT (template_id, catalog_risk_id) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Created "Riesgos Alto Riesgo" template with all catalog risks';
  ELSE
    -- Update existing template with new fields
    UPDATE risk_templates
    SET is_system = true,
        is_active = true,
        applies_to_levels = ARRAY['high_risk']::text[],
        description = 'Plantilla pre-configurada con todos los riesgos del catálogo MIT para sistemas de Alto Riesgo según el AI Act. Incluye los 50 riesgos priorizados del MIT AI Risk Repository.'
    WHERE id = v_high_risk_template_id;
    
    -- Ensure all catalog risks are included
    FOR v_catalog_risk IN SELECT id FROM risk_catalog WHERE is_active = true LOOP
      INSERT INTO risk_template_items (template_id, catalog_risk_id, is_required)
      VALUES (v_high_risk_template_id, v_catalog_risk.id, true)
      ON CONFLICT (template_id, catalog_risk_id) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Updated "Riesgos Alto Riesgo" template';
  END IF;
  
  -- Create "Riesgos Limitado/Mínimo" template if it doesn't exist
  SELECT id INTO v_limited_risk_template_id
  FROM risk_templates
  WHERE is_system = true AND name = 'Riesgos Limitado/Mínimo';
  
  IF v_limited_risk_template_id IS NULL THEN
    INSERT INTO risk_templates (
      name,
      description,
      ai_act_level,
      is_default,
      is_system,
      is_active,
      applies_to_levels
    ) VALUES (
      'Riesgos Limitado/Mínimo',
      'Plantilla pre-configurada para sistemas de Riesgo Limitado y Mínimo según el AI Act. Incluye los riesgos críticos y de alta prioridad del catálogo MIT que son aplicables a estos sistemas.',
      'limited_risk',
      false,
      true,
      true,
      ARRAY['limited_risk', 'minimal_risk']::text[]
    )
    RETURNING id INTO v_limited_risk_template_id;
    
    -- Add critical and high priority risks (subset of catalog)
    -- These are risks that apply across risk levels: discriminación, privacidad, seguridad, transparencia
    FOR v_catalog_risk IN 
      SELECT id FROM risk_catalog 
      WHERE is_active = true 
        AND criticality IN ('critical', 'high')
        AND ai_act_level IN ('limited_risk', 'minimal_risk', 'high_risk')
      ORDER BY risk_number
      LIMIT 15
    LOOP
      INSERT INTO risk_template_items (template_id, catalog_risk_id, is_required)
      VALUES (v_limited_risk_template_id, v_catalog_risk.id, true)
      ON CONFLICT (template_id, catalog_risk_id) DO NOTHING;
    END LOOP;
    
    -- Count how many we added
    SELECT COUNT(*) INTO v_count FROM risk_template_items WHERE template_id = v_limited_risk_template_id;
    RAISE NOTICE 'Created "Riesgos Limitado/Mínimo" template with % risks', v_count;
  ELSE
    -- Update existing template with new fields
    UPDATE risk_templates
    SET is_system = true,
        is_active = true,
        applies_to_levels = ARRAY['limited_risk', 'minimal_risk']::text[],
        ai_act_level = 'limited_risk',
        description = 'Plantilla pre-configurada para sistemas de Riesgo Limitado y Mínimo según el AI Act. Incluye los riesgos críticos y de alta prioridad del catálogo MIT que son aplicables a estos sistemas.'
    WHERE id = v_limited_risk_template_id;
    
    RAISE NOTICE 'Updated "Riesgos Limitado/Mínimo" template';
  END IF;
  
END $$;

-- ============================================
-- 4. INDEXES FOR NEW COLUMNS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_risk_templates_system ON risk_templates(is_system);
CREATE INDEX IF NOT EXISTS idx_risk_templates_active ON risk_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_risk_templates_applies_to ON risk_templates USING GIN(applies_to_levels);

-- ============================================
-- 5. POLICY UPDATES FOR SYSTEM TEMPLATES
-- ============================================

-- Allow admins to update system templates (for is_active, applicability rules)
DROP POLICY IF EXISTS "Users can update own templates" ON risk_templates;

CREATE POLICY "Users can update own templates" ON risk_templates
  FOR UPDATE USING (
    -- User owns the template
    auth.uid() = created_by
    -- OR it's a system template (only is_active and exception fields can be modified)
    OR is_system = true
  );

-- System templates cannot be deleted
DROP POLICY IF EXISTS "Users can delete own templates" ON risk_templates;

CREATE POLICY "Users can delete own templates" ON risk_templates
  FOR DELETE USING (
    auth.uid() = created_by 
    AND is_system = false
  );
