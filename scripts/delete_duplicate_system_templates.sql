-- ============================================================
-- ELIMINAR PLANTILLAS DUPLICADAS DEL SISTEMA
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- IDs de las plantillas:
-- Duplicadas (a eliminar):
--   2131f434-c1d5-47af-8f24-cf69f0faf463 = 'Riesgo Alto - Catálogo Completo'
--   7e7f51ce-8959-4800-a00a-b2d15d29c6c7 = 'Riesgo Limitado/Mínimo - Catálogo Reducido'
-- Oficiales (conservar):
--   16b37132-ac4c-4d23-84b5-df202f1f6882 = 'Riesgos Alto Riesgo'
--   842cd241-090b-4c9e-85e9-c65918b4ad78 = 'Riesgos Limitado/Mínimo'

DO $$
DECLARE
  v_dup_high_risk uuid := '2131f434-c1d5-47af-8f24-cf69f0faf463';
  v_dup_limited uuid := '7e7f51ce-8959-4800-a00a-b2d15d29c6c7';
  v_official_high uuid := '16b37132-ac4c-4d23-84b5-df202f1f6882';
  v_official_limited uuid := '842cd241-090b-4c9e-85e9-c65918b4ad78';
  v_count int;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'INICIANDO ELIMINACIÓN DE DUPLICADAS';
  RAISE NOTICE '========================================';

  -- ==========================================================
  -- PASO 1: Migrar riesgos de plantilla duplicada a oficial
  -- ==========================================================
  
  -- Migrar riesgos de "Riesgo Alto - Catálogo Completo" → "Riesgos Alto Riesgo"
  UPDATE ai_system_risks
  SET template_id = v_official_high
  WHERE template_id = v_dup_high_risk;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE '✓ Migrados % riesgos de Alto Riesgo (dup → oficial)', v_count;
  
  -- Migrar riesgos de "Riesgo Limitado/Mínimo - Catálogo Reducido" → "Riesgos Limitado/Mínimo"
  UPDATE ai_system_risks
  SET template_id = v_official_limited
  WHERE template_id = v_dup_limited;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE '✓ Migrados % riesgos de Limitado/Mínimo (dup → oficial)', v_count;

  -- ==========================================================
  -- PASO 2: Eliminar items de plantillas duplicadas
  -- ==========================================================
  
  DELETE FROM risk_template_items WHERE template_id = v_dup_high_risk;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE '✓ Eliminados % items de plantilla duplicada (alto riesgo)', v_count;
  
  DELETE FROM risk_template_items WHERE template_id = v_dup_limited;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE '✓ Eliminados % items de plantilla duplicada (limitado)', v_count;

  -- ==========================================================
  -- PASO 3: Eliminar plantillas duplicadas
  -- ==========================================================
  
  -- Quitar flag is_system temporalmente para permitir borrado
  UPDATE risk_templates SET is_system = false WHERE id IN (v_dup_high_risk, v_dup_limited);
  
  -- Eliminar plantilla duplicada alto riesgo
  DELETE FROM risk_templates WHERE id = v_dup_high_risk;
  RAISE NOTICE '✓ Eliminada plantilla duplicada: Riesgo Alto - Catálogo Completo';
  
  -- Eliminar plantilla duplicada limitado/mínimo
  DELETE FROM risk_templates WHERE id = v_dup_limited;
  RAISE NOTICE '✓ Eliminada plantilla duplicada: Riesgo Limitado/Mínimo - Catálogo Reducido';

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ PROCESO COMPLETADO EXITOSAMENTE';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================

SELECT '=== PLANTILLAS RESTANTES ===' as info;

SELECT 
  id,
  name,
  is_system,
  is_active,
  created_at
FROM risk_templates
ORDER BY name;

SELECT '=== VERIFICAR QUE NO HAY RIESGOS HUÉRFANOS ===' as info;

SELECT 
  COUNT(*) as total_riesgos,
  COUNT(template_id) as riesgos_con_template,
  COUNT(*) - COUNT(template_id) as riesgos_sin_template
FROM ai_system_risks;
