-- Migration: Fix use_case_catalog schema to match API expectations
-- Date: 2026-03-14

-- Add missing columns to use_case_catalog
ALTER TABLE use_case_catalog 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS template_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS typical_ai_act_level TEXT;

-- Copy data from ai_act_level to typical_ai_act_level for consistency
UPDATE use_case_catalog 
SET typical_ai_act_level = ai_act_level 
WHERE typical_ai_act_level IS NULL;

-- Set all existing records as active
UPDATE use_case_catalog 
SET is_active = true 
WHERE is_active IS NULL;

-- Insert additional use case examples if they don't exist
INSERT INTO use_case_catalog (name, description, sector, ai_act_level, typical_ai_act_level, is_active, template_data)
SELECT * FROM (VALUES
    ('Sistema de Detección de Fraude', 'Sistema de IA que analiza transacciones financieras en tiempo real para detectar patrones sospechosos y prevenir fraudes.', 'finance', 'high_risk', 'high_risk', true, '{"keywords": ["fraude", "transacciones", "finanzas", "detección"]}'::jsonb),
    ('Chatbot de Atención al Cliente', 'Asistente virtual para responder consultas frecuentes y guiar a clientes a través de procesos básicos.', 'finance', 'limited_risk', 'limited_risk', true, '{"keywords": ["chatbot", "atención", "cliente", "conversación"]}'::jsonb),
    ('Sistema de Recomendación de Productos', 'Algoritmo que sugiere productos financieros basados en el historial del cliente y preferencias.', 'finance', 'limited_risk', 'limited_risk', true, '{"keywords": ["recomendación", "productos", "personalización"]}'::jsonb),
    ('Evaluación Automatizada de Crédito', 'Sistema que evalúa solicitudes de préstamo basándose en datos financieros y comportamiento crediticio.', 'finance', 'high_risk', 'high_risk', true, '{"keywords": ["crédito", "evaluación", "riesgo", "préstamo"]}'::jsonb),
    ('Detección de Cáncer con IA', 'Sistema de diagnóstico médico asistido por IA para análisis de imágenes médicas.', 'healthcare', 'high_risk', 'high_risk', true, '{"keywords": ["salud", "diagnóstico", "imágenes", "cáncer"]}'::jsonb),
    ('Asistente Virtual Médico', 'Chatbot para triaje inicial y orientación sobre síntomas antes de consultar con un médico.', 'healthcare', 'limited_risk', 'limited_risk', true, '{"keywords": ["salud", "triaje", "síntomas", "orientación"]}'::jsonb),
    ('Sistema de Evaluación de Candidatos', 'IA para screening de CVs y evaluación inicial de candidatos en procesos de selección.', 'employment', 'high_risk', 'high_risk', true, '{"keywords": ["empleo", "reclutamiento", "cv", "evaluación"]}'::jsonb),
    ('Plataforma de Aprendizaje Personalizado', 'Sistema adaptativo que personaliza contenido educativo según el progreso del estudiante.', 'education', 'high_risk', 'high_risk', true, '{"keywords": ["educación", "aprendizaje", "personalización", "estudiantes"]}'::jsonb),
    ('Sistema de Reconocimiento Facial', 'Identificación biométrica para control de acceso y seguridad.', 'security', 'prohibited', 'prohibited', true, '{"keywords": ["biometría", "facial", "identificación", "seguridad"]}'::jsonb),
    ('Detección de Deepfakes', 'Herramienta para identificar contenido sintético generado por IA.', 'security', 'minimal_risk', 'minimal_risk', true, '{"keywords": ["deepfake", "contenido", "sintético", "detección"]}'::jsonb),
    ('Análisis de Sentimiento en Redes Sociales', 'Monitoreo de opiniones y sentimientos sobre marca o productos en redes sociales.', 'other', 'minimal_risk', 'minimal_risk', true, '{"keywords": ["sentimiento", "redes", "monitoreo", "opinión"]}'::jsonb),
    ('Sistema de Predicción de Mantenimiento', 'IA para predecir fallos en equipos industriales y programar mantenimiento preventivo.', 'transport', 'high_risk', 'high_risk', true, '{"keywords": ["mantenimiento", "predicción", "industrial", "equipos"]}'::jsonb)
) AS v(name, description, sector, ai_act_level, typical_ai_act_level, is_active, template_data)
WHERE NOT EXISTS (
    SELECT 1 FROM use_case_catalog WHERE name = v.name
);
