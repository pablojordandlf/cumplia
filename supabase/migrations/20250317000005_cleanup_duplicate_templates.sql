-- Migration: 20250317000005_cleanup_duplicate_templates.sql
-- Description: Remove duplicate user templates that have similar names to system templates

-- First, we need to handle the foreign key constraint from ai_system_risks
-- We'll set template_id to NULL for those records, or delete them if they're orphans

DO $$
DECLARE
  v_template_id uuid;
  v_deleted_count int := 0;
BEGIN
  -- =====================================================
  -- STEP 1: Handle "Riesgo Alto - Catálogo Completo"
  -- =====================================================
  SELECT id INTO v_template_id
  FROM risk_templates
  WHERE name = 'Riesgo Alto - Catálogo Completo'
    AND is_system = false;
  
  IF v_template_id IS NOT NULL THEN
    -- Remove references from ai_system_risks (set to NULL or delete orphaned risks)
    -- Option A: Set template_id to NULL (keeps the risks but removes template link)
    UPDATE ai_system_risks
    SET template_id = NULL
    WHERE template_id = v_template_id;
    
    -- Delete template items first (should cascade, but being explicit)
    DELETE FROM risk_template_items
    WHERE template_id = v_template_id;
    
    -- Now delete the template
    DELETE FROM risk_templates
    WHERE id = v_template_id;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted template: Riesgo Alto - Catálogo Completo (ID: %)', v_template_id;
  ELSE
    RAISE NOTICE 'Template not found: Riesgo Alto - Catálogo Completo';
  END IF;

  -- =====================================================
  -- STEP 2: Handle "Riesgo Limitado/Mínimo - Catálogo Reducido"
  -- =====================================================
  SELECT id INTO v_template_id
  FROM risk_templates
  WHERE name = 'Riesgo Limitado/Mínimo - Catálogo Reducido'
    AND is_system = false;
  
  IF v_template_id IS NOT NULL THEN
    -- Remove references from ai_system_risks
    UPDATE ai_system_risks
    SET template_id = NULL
    WHERE template_id = v_template_id;
    
    -- Delete template items first
    DELETE FROM risk_template_items
    WHERE template_id = v_template_id;
    
    -- Now delete the template
    DELETE FROM risk_templates
    WHERE id = v_template_id;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted template: Riesgo Limitado/Mínimo - Catálogo Reducido (ID: %)', v_template_id;
  ELSE
    RAISE NOTICE 'Template not found: Riesgo Limitado/Mínimo - Catálogo Reducido';
  END IF;

  -- =====================================================
  -- STEP 3: Clean up any other similar duplicates
  -- =====================================================
  FOR v_template_id IN
    SELECT id FROM risk_templates
    WHERE is_system = false 
      AND (
        name ILIKE '%Riesgo Alto%' 
        OR name ILIKE '%Catálogo Completo%'
        OR name ILIKE '%Riesgo Limitado%'
        OR name ILIKE '%Catálogo Reducido%'
      )
      AND created_by IS NOT NULL
  LOOP
    -- Remove references
    UPDATE ai_system_risks
    SET template_id = NULL
    WHERE template_id = v_template_id;
    
    -- Delete items
    DELETE FROM risk_template_items
    WHERE template_id = v_template_id;
    
    -- Delete template
    DELETE FROM risk_templates
    WHERE id = v_template_id;
    
    RAISE NOTICE 'Deleted additional duplicate template (ID: %)', v_template_id;
  END LOOP;

END $$;

-- Verify remaining templates
SELECT id, name, is_system, is_active, created_by, created_at
FROM risk_templates
ORDER BY is_system DESC, name;
