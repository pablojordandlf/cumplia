-- Migration: 20250317000005_cleanup_duplicate_templates.sql
-- Description: Remove duplicate user templates that have similar names to system templates

-- Delete specific user-created templates that are duplicates of system templates
-- These were created before the system templates were in place

DO $$
DECLARE
  v_deleted_count int := 0;
BEGIN
  -- Delete "Riesgo Alto - Catálogo Completo" (user template, not system)
  DELETE FROM risk_templates
  WHERE name = 'Riesgo Alto - Catálogo Completo'
    AND is_system = false;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  IF v_deleted_count > 0 THEN
    RAISE NOTICE 'Deleted template: Riesgo Alto - Catálogo Completo';
  ELSE
    RAISE NOTICE 'Template not found: Riesgo Alto - Catálogo Completo';
  END IF;

  -- Delete "Riesgo Limitado/Mínimo - Catálogo Reducido" (user template, not system)
  DELETE FROM risk_templates
  WHERE name = 'Riesgo Limitado/Mínimo - Catálogo Reducido'
    AND is_system = false;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  IF v_deleted_count > 0 THEN
    RAISE NOTICE 'Deleted template: Riesgo Limitado/Mínimo - Catálogo Reducido';
  ELSE
    RAISE NOTICE 'Template not found: Riesgo Limitado/Mínimo - Catálogo Reducido';
  END IF;

  -- Also check for any other potential duplicates with similar patterns
  -- Delete any user template that might be a duplicate of system templates
  DELETE FROM risk_templates
  WHERE is_system = false 
    AND (
      name ILIKE '%Riesgo Alto%' 
      OR name ILIKE '%Catálogo Completo%'
      OR name ILIKE '%Riesgo Limitado%'
      OR name ILIKE '%Catálogo Reducido%'
    )
    AND created_by IS NOT NULL;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  IF v_deleted_count > 0 THEN
    RAISE NOTICE 'Deleted % additional duplicate template(s)', v_deleted_count;
  END IF;

END $$;

-- Verify remaining templates
SELECT id, name, is_system, is_active, created_by, created_at
FROM risk_templates
ORDER BY is_system DESC, name;
