-- Migration: 20260330100000_reseed_risk_template_items.sql
-- Description: Ensure system risk templates have their risk factors populated.
-- This is idempotent and safe to run multiple times.

DO $$
DECLARE
  v_high_risk_id uuid;
  v_limited_risk_id uuid;
  v_count int;
BEGIN

  -- ============================================================
  -- 1. Find or create "Alto Riesgo" system template
  -- ============================================================
  SELECT id INTO v_high_risk_id
  FROM risk_templates
  WHERE is_system = true
    AND (
      name = 'Riesgos Alto Riesgo'
      OR name = 'Riesgo Alto - Catálogo Completo'
      OR ai_act_level = 'high_risk'
    )
  ORDER BY
    CASE WHEN name = 'Riesgos Alto Riesgo' THEN 0
         WHEN name = 'Riesgo Alto - Catálogo Completo' THEN 1
         ELSE 2
    END
  LIMIT 1;

  IF v_high_risk_id IS NULL THEN
    -- Create it if it doesn't exist at all
    INSERT INTO risk_templates (
      name, description, ai_act_level, is_default, is_system, is_active, applies_to_levels
    ) VALUES (
      'Alto Riesgo - Catálogo Completo',
      'Plantilla con todos los riesgos del catálogo MIT AI Risk Repository para sistemas de Alto Riesgo (Art. 9 del AI Act).',
      'high_risk', true, true, true, ARRAY['high_risk']::text[]
    )
    RETURNING id INTO v_high_risk_id;
    RAISE NOTICE 'Created high_risk template (id: %)', v_high_risk_id;
  ELSE
    -- Ensure it's active and has correct fields
    UPDATE risk_templates
    SET is_active = true,
        is_system = true,
        applies_to_levels = CASE
          WHEN applies_to_levels IS NULL OR array_length(applies_to_levels, 1) IS NULL
          THEN ARRAY['high_risk']::text[]
          ELSE applies_to_levels
        END
    WHERE id = v_high_risk_id;
    RAISE NOTICE 'Using existing high_risk template (id: %)', v_high_risk_id;
  END IF;

  -- Populate items: add ALL non-prohibited catalog risks
  INSERT INTO risk_template_items (template_id, catalog_risk_id, is_required)
  SELECT v_high_risk_id, rc.id, true
  FROM risk_catalog rc
  WHERE rc.is_active = true
    AND rc.ai_act_level != 'prohibited'
  ON CONFLICT (template_id, catalog_risk_id) DO NOTHING;

  SELECT COUNT(*) INTO v_count FROM risk_template_items WHERE template_id = v_high_risk_id;
  RAISE NOTICE 'High risk template now has % items', v_count;

  -- ============================================================
  -- 2. Find or create "Riesgo Limitado/Mínimo" system template
  -- ============================================================
  SELECT id INTO v_limited_risk_id
  FROM risk_templates
  WHERE is_system = true
    AND (
      name = 'Riesgos Limitado/Mínimo'
      OR name = 'Riesgo Limitado/Mínimo - Catálogo Reducido'
      OR (ai_act_level = 'limited_risk' AND id != v_high_risk_id)
    )
  ORDER BY
    CASE WHEN name = 'Riesgos Limitado/Mínimo' THEN 0
         WHEN name = 'Riesgo Limitado/Mínimo - Catálogo Reducido' THEN 1
         ELSE 2
    END
  LIMIT 1;

  IF v_limited_risk_id IS NULL THEN
    INSERT INTO risk_templates (
      name, description, ai_act_level, is_default, is_system, is_active, applies_to_levels
    ) VALUES (
      'Riesgo Limitado/Mínimo - Catálogo Reducido',
      'Plantilla con los riesgos prioritarios para sistemas de Riesgo Limitado y Mínimo según el AI Act.',
      'limited_risk', true, true, true, ARRAY['limited_risk', 'minimal_risk']::text[]
    )
    RETURNING id INTO v_limited_risk_id;
    RAISE NOTICE 'Created limited_risk template (id: %)', v_limited_risk_id;
  ELSE
    UPDATE risk_templates
    SET is_active = true,
        is_system = true,
        applies_to_levels = CASE
          WHEN applies_to_levels IS NULL OR array_length(applies_to_levels, 1) IS NULL
          THEN ARRAY['limited_risk', 'minimal_risk']::text[]
          ELSE applies_to_levels
        END
    WHERE id = v_limited_risk_id;
    RAISE NOTICE 'Using existing limited_risk template (id: %)', v_limited_risk_id;
  END IF;

  -- Populate items: add critical+high risks from relevant domains
  INSERT INTO risk_template_items (template_id, catalog_risk_id, is_required)
  SELECT
    v_limited_risk_id,
    rc.id,
    CASE WHEN rc.criticality = 'critical' THEN true ELSE false END
  FROM risk_catalog rc
  WHERE rc.is_active = true
    AND rc.ai_act_level != 'prohibited'
    AND (
      rc.criticality IN ('critical', 'high')
      OR rc.risk_number IN (1, 2, 3, 4, 8, 9, 10, 19, 20, 27, 32, 33, 47, 48, 49)
    )
  ON CONFLICT (template_id, catalog_risk_id) DO NOTHING;

  SELECT COUNT(*) INTO v_count FROM risk_template_items WHERE template_id = v_limited_risk_id;
  RAISE NOTICE 'Limited risk template now has % items', v_count;

END $$;
