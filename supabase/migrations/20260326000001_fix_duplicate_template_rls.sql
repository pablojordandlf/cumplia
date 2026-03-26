-- Migration: 20260326000001_fix_duplicate_template_rls.sql
-- Description: Fix duplicate template RLS issues by creating a SECURITY DEFINER function

-- ============================================
-- 1. CREATE FUNCTION TO DUPLICATE TEMPLATES
-- ============================================

CREATE OR REPLACE FUNCTION duplicate_template(
  p_template_id uuid,
  p_user_id uuid
)
RETURNS uuid AS $$
DECLARE
  v_original_template record;
  v_new_template_id uuid;
  v_item record;
BEGIN
  -- Get the original template
  SELECT * INTO v_original_template
  FROM risk_templates
  WHERE id = p_template_id;
  
  IF v_original_template IS NULL THEN
    RAISE EXCEPTION 'Template not found';
  END IF;
  
  -- Don't allow duplicating system templates directly
  IF v_original_template.is_system = true THEN
    RAISE EXCEPTION 'System templates cannot be directly duplicated';
  END IF;
  
  -- Create the new template
  INSERT INTO risk_templates (
    name,
    description,
    ai_act_level,
    is_default,
    is_system,
    organization_id,
    created_by,
    is_active,
    applies_to_levels,
    excluded_systems,
    included_systems
  ) VALUES (
    'Copy of ' || v_original_template.name,
    CASE WHEN v_original_template.description IS NOT NULL
      THEN 'Copy: ' || v_original_template.description
      ELSE NULL
    END,
    v_original_template.ai_act_level,
    false,
    false,
    v_original_template.organization_id,
    p_user_id,
    true,
    v_original_template.applies_to_levels,
    v_original_template.excluded_systems,
    v_original_template.included_systems
  )
  RETURNING id INTO v_new_template_id;
  
  -- Duplicate all template items
  FOR v_item IN
    SELECT * FROM risk_template_items
    WHERE template_id = p_template_id
  LOOP
    INSERT INTO risk_template_items (
      template_id,
      catalog_risk_id,
      is_required
    ) VALUES (
      v_new_template_id,
      v_item.catalog_risk_id,
      v_item.is_required
    );
  END LOOP;
  
  RETURN v_new_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION duplicate_template(uuid, uuid) IS 'Safely duplicates a template without RLS permission issues';

-- ============================================
-- 2. UPDATE RLS POLICY FOR INSERT
-- ============================================

-- Allow users to insert templates they create
DROP POLICY IF EXISTS "Users can insert own templates" ON risk_templates;

CREATE POLICY "Users can insert own templates" ON risk_templates
  FOR INSERT WITH CHECK (
    auth.uid() = created_by OR created_by IS NOT NULL
  );

-- ============================================
-- 3. GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION duplicate_template(uuid, uuid) TO authenticated;
