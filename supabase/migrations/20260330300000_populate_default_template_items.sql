-- Migration: 20260330300000_populate_default_template_items.sql
-- Description: Populate system risk template items for "Riesgos Alto Riesgo" and "Riesgos Limitado"
-- Applied directly to production on 2026-03-30. This migration is idempotent.

-- "Riesgos Alto Riesgo": all non-prohibited catalog risks (45 total)
INSERT INTO risk_template_items (template_id, catalog_risk_id, is_required)
SELECT
  (SELECT id FROM risk_templates WHERE name = 'Riesgos Alto Riesgo' AND is_system = true LIMIT 1),
  id,
  true
FROM risk_catalog
WHERE is_active = true
  AND ai_act_level != 'prohibited'
ON CONFLICT (template_id, catalog_risk_id) DO NOTHING;

-- "Riesgos Limitado": 20 most relevant risks for limited-risk systems
-- Covers: discriminación, privacidad, misinformación, seguridad, interacción humano-IA
INSERT INTO risk_template_items (template_id, catalog_risk_id, is_required)
SELECT
  (SELECT id FROM risk_templates WHERE name = 'Riesgos Limitado' AND is_system = true LIMIT 1),
  id,
  CASE WHEN criticality = 'critical' THEN true ELSE false END
FROM risk_catalog
WHERE is_active = true
  AND risk_number IN (
    1,   -- Discriminación injusta en decisiones automáticas
    2,   -- Sesgos en datos de entrenamiento
    5,   -- Exposición a contenido inapropiado
    6,   -- Reproducción de estereotipos dañinos
    8,   -- Fuga de datos personales sensibles (critical)
    9,   -- Memorización de datos privados en modelos (critical)
    15,  -- Inyección de prompts
    19,  -- Alucinaciones - Información falsa (critical)
    20,  -- Deepfakes y contenido sintético falso (critical)
    21,  -- Polarización y burbuja de filtros
    22,  -- Erosión del consenso informativo
    27,  -- Suplantación de identidad y fraude
    32,  -- Antropomorfización y dependencia excesiva
    33,  -- Pérdida de autonomía humana
    34,  -- Impacto en salud mental
    38,  -- Desplazamiento laboral masivo (critical)
    42,  -- Gobernanza inadecuada de sistemas IA (critical)
    47,  -- Desalineamiento entre objetivos IA y humanos (critical)
    49,  -- Falta de transparencia e interpretabilidad (critical)
    50   -- Capacidades peligrosas no detectadas (critical)
  )
ON CONFLICT (template_id, catalog_risk_id) DO NOTHING;
