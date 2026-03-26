-- Migration: 20260326000003_fix_duplicate_template_function.sql
-- Description: Fix the duplicate_template RLS function to handle missing columns gracefully

-- ============================================
-- 1. DROP OLD FUNCTION
-- ============================================
DROP FUNCTION IF EXISTS duplicate_template(uuid, uuid);

-- ============================================
-- 2. CREATE FIXED FUNCTION
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
    is_active
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
    true
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

COMMENT ON FUNCTION duplicate_template(uuid, uuid) IS 'Safely duplicates a custom template without RLS permission issues';

-- ============================================
-- 3. ENSURE PERMISSIONS ARE GRANTED
-- ============================================
GRANT EXECUTE ON FUNCTION duplicate_template(uuid, uuid) TO authenticated;

-- ============================================
-- 4. TEST THAT THE FUNCTION WORKS
-- ============================================
-- This is just documentation - not actual test code
-- To test manually in Supabase SQL Editor:
-- SELECT duplicate_template('template-id-here'::uuid, auth.uid());
