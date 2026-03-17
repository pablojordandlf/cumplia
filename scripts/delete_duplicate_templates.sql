-- ============================================================
-- SCRIPT PARA ELIMINAR PLANTILLAS DE USUARIO DUPLICADAS
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Paso 0: Ver qué plantillas existen actualmente
SELECT '=== PLANTILLAS ACTUALES ===' as info;

SELECT 
  id,
  name,
  is_system,
  is_active,
  CASE 
    WHEN is_system THEN 'SISTEMA (protegida)'
    ELSE 'USUARIO (se puede borrar)'
  END as tipo,
  created_at
FROM risk_templates
ORDER BY is_system DESC, name;

-- ============================================================
-- PASO 1: Intentar encontrar las plantillas por nombre exacto
-- ============================================================

SELECT '=== Buscando plantillas a eliminar ===' as info;

-- Buscar por nombre exacto
SELECT id, name, is_system, 'ENCONTRADA (exacto)' as estado
FROM risk_templates
WHERE name = 'Riesgo Alto - Catálogo Completo'
   OR name = 'Riesgo Limitado/Mínimo - Catálogo Reducido';

-- Buscar por nombre similar (por si hay variaciones)
SELECT id, name, is_system, 'ENCONTRADA (similar)' as estado
FROM risk_templates
WHERE name ILIKE '%Riesgo Alto%Catálogo%'
   OR name ILIKE '%Riesgo Limitado%Catálogo%'
   OR name ILIKE '%Catálogo Completo%'
   OR name ILIKE '%Catálogo Reducido%';

-- ============================================================
-- PASO 2: Verificar dependencias
-- ============================================================

SELECT '=== Verificando dependencias ===' as info;

-- Ver si hay riesgos asociados a estas plantillas
SELECT 
  rt.name as template_name,
  rt.is_system,
  COUNT(asr.id) as riesgos_asociados
FROM risk_templates rt
LEFT JOIN ai_system_risks asr ON asr.template_id = rt.id
WHERE rt.name ILIKE '%Riesgo Alto%'
   OR rt.name ILIKE '%Riesgo Limitado%'
   OR rt.name ILIKE '%Catálogo Completo%'
   OR rt.name ILIKE '%Catálogo Reducido%'
GROUP BY rt.id, rt.name, rt.is_system;

-- ============================================================
-- PASO 3: ELIMINACIÓN (Descomenta esta sección cuando estés listo)
-- ============================================================

/*
-- Descomenta desde aquí hasta el final para ejecutar el borrado

DO $$
DECLARE
  v_template RECORD;
  v_count int;
BEGIN
  -- Buscar y eliminar plantillas que coincidan
  FOR v_template IN 
    SELECT id, name, is_system
    FROM risk_templates
    WHERE (name ILIKE '%Riesgo Alto%Catálogo Completo%'
       OR name ILIKE '%Riesgo Limitado%Mínimo%Catálogo Reducido%'
       OR name = 'Riesgo Alto - Catálogo Completo'
       OR name = 'Riesgo Limitado/Mínimo - Catálogo Reducido')
      AND is_system = false
  LOOP
    RAISE NOTICE 'Procesando: % (ID: %)', v_template.name, v_template.id;
    
    -- 1. Quitar referencias en ai_system_risks
    UPDATE ai_system_risks
    SET template_id = NULL
    WHERE template_id = v_template.id;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE '  - Referencias actualizadas: %', v_count;
    
    -- 2. Eliminar items de la plantilla
    DELETE FROM risk_template_items
    WHERE template_id = v_template.id;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE '  - Items eliminados: %', v_count;
    
    -- 3. Eliminar la plantilla
    DELETE FROM risk_templates
    WHERE id = v_template.id;
    
    RAISE NOTICE '  ✅ Plantilla eliminada: %', v_template.name;
  END LOOP;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Proceso completado';
  RAISE NOTICE '========================================';
END $$;

-- Verificar resultado
SELECT '=== PLANTILLAS RESTANTES ===' as info;

SELECT id, name, is_system, is_active
FROM risk_templates
ORDER BY is_system DESC, name;

-- Fin del script de eliminación
*/
