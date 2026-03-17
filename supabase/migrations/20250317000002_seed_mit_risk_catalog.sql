-- Migration: 20250317000002_seed_mit_risk_catalog.sql
-- Description: Seed MIT AI Risk Repository v4 - Top 50 risks mapped to AI Act

-- ============================================
-- 1. INSERT MIT AI RISK REPOSITORY - 50 RISKS
-- ============================================

INSERT INTO risk_catalog (risk_number, name, description, domain, subdomain, ai_act_article, ai_act_level, criticality, timing) VALUES
-- DOMINIO 1: DISCRIMINACIÓN & TOXICIDAD (7 riesgos)
(1, 'Discriminación injusta en decisiones automáticas', 'Sistemas que discriminan por raza, género, edad u otras características protegidas en decisiones que afectan a individuos', 'Discriminación & Toxicidad', 'Decisiones automatizadas', 'Art. 6(1)(c)', 'high_risk', 'high', 'post-deployment'),
(2, 'Sesgos en datos de entrenamiento', 'Datos históricos que perpetúan discriminación o desigualdades existentes en la sociedad', 'Discriminación & Toxicidad', 'Datos', 'Art. 10(3)', 'high_risk', 'high', 'pre-deployment'),
(3, 'Rendimiento desigual entre grupos demográficos', 'Precisión o efectividad diferente del sistema según grupo demográfico, causando impacto desproporcionado', 'Discriminación & Toxicidad', 'Fairness', 'Art. 6(1)(c)', 'high_risk', 'high', 'post-deployment'),
(4, 'Generación de contenido tóxico', 'Producción de hate speech, violencia, extremismo u otro contenido dañino por sistemas generativos', 'Discriminación & Toxicidad', 'Contenido', 'Art. 52', 'high_risk', 'high', 'post-deployment'),
(5, 'Exposición a contenido inapropiado', 'Acceso no intencionado a pornografía, violencia gráfica o abuso infantil mediante sistemas de IA', 'Discriminación & Toxicidad', 'Contenido', 'Art. 27', 'limited_risk', 'medium', 'post-deployment'),
(6, 'Reproducción de estereotipos dañinos', 'Refuerzo y perpetuación de creencias discriminatorias mediante generación de contenido', 'Discriminación & Toxicidad', 'Contenido', 'Art. 52', 'limited_risk', 'medium', 'post-deployment'),
(7, 'Impugnabilidad de decisiones discriminatorias', 'Dificultad para recurrir o cuestionar decisiones automatizadas que resultan discriminatorias', 'Discriminación & Toxicidad', 'Transparencia', 'Art. 13', 'high_risk', 'medium', 'post-deployment'),

-- DOMINIO 2: PRIVACIDAD & SEGURIDAD (11 riesgos)
(8, 'Fuga de datos personales sensibles', 'Exposición no autorizada de información personal identificable (PII) almacenada o procesada por el sistema', 'Privacidad & Seguridad', 'Confidencialidad', 'Art. 10(3)', 'high_risk', 'critical', 'post-deployment'),
(9, 'Memorización de datos privados en modelos', 'Los modelos de IA memorizano reproducen información privada de su conjunto de entrenamiento', 'Privacidad & Seguridad', 'Privacidad diferencial', 'Art. 10(3)', 'high_risk', 'critical', 'pre-deployment'),
(10, 'Ataques de inferencia sobre datos', 'Reconstrucción de información privada mediante análisis de salidas del modelo', 'Privacidad & Seguridad', 'Ataques', 'Art. 10(3)', 'high_risk', 'high', 'post-deployment'),
(11, 'Vulnerabilidades supply chain de software', 'Ataques en frameworks, librerías o dependencias utilizadas en el desarrollo del sistema', 'Privacidad & Seguridad', 'Supply Chain', 'Art. 28', 'high_risk', 'high', 'pre-deployment'),
(12, 'Ataques de poisoning en datos', 'Manipulación maliciosa de datos de entrenamiento para insertar fallos o comportamientos no deseados', 'Privacidad & Seguridad', 'Integridad', 'Art. 10(3)', 'high_risk', 'high', 'pre-deployment'),
(13, 'Ataques adversariales contra modelos', 'Perturbaciones diseñadas para forzar predicciones incorrectas en modelos de ML', 'Privacidad & Seguridad', 'Robustez', 'Art. 28', 'high_risk', 'high', 'post-deployment'),
(14, 'Robo de modelo (extraction attacks)', 'Réplica funcional del modelo mediante consultas estratégicas a la API', 'Privacidad & Seguridad', 'Propiedad intelectual', 'Art. 27', 'limited_risk', 'medium', 'post-deployment'),
(15, 'Inyección de prompts', 'Manipulación del comportamiento del sistema mediante prompts adversariales diseñados', 'Privacidad & Seguridad', 'Prompt Security', 'Art. 28', 'limited_risk', 'medium', 'post-deployment'),
(16, 'Jailbreaking de guardrails', 'Circunvención de medidas de seguridad y restricciones del sistema mediante ingeniería de prompts', 'Privacidad & Seguridad', 'Prompt Security', 'Art. 28', 'limited_risk', 'medium', 'post-deployment'),
(17, 'Vulnerabilidades hardware (GPU side-channel)', 'Extracción de parámetros o información sensible mediante ataques de canal lateral en hardware', 'Privacidad & Seguridad', 'Hardware', 'Art. 27', 'limited_risk', 'medium', 'pre-deployment'),
(18, 'Backdoors implícitos en modelos', 'Puertas traseras activadas por triggers específicos insertadas durante el entrenamiento', 'Privacidad & Seguridad', 'Integridad', 'Art. 10(3)', 'high_risk', 'high', 'pre-deployment'),

-- DOMINIO 3: MISINFORMACIÓN (6 riesgos)
(19, 'Alucinaciones - Información falsa', 'El sistema genera información ficticia o incorrecta presentándola como factual', 'Misinformación', 'Factualidad', 'Art. 52', 'high_risk', 'critical', 'post-deployment'),
(20, 'Deepfakes y contenido sintético falso', 'Generación de vídeos, imágenes o audio realistas pero falsos para engañar', 'Misinformación', 'Sintético', 'Art. 50', 'high_risk', 'critical', 'post-deployment'),
(21, 'Polarización y burbuja de filtros', 'El sistema refuerza creencias existentes limitando exposición a perspectivas diversas', 'Misinformación', 'Sesgo algorítmico', 'Art. 27', 'limited_risk', 'high', 'post-deployment'),
(22, 'Erosión del consenso informativo', 'Fragmentación de la realidad compartida con múltiples versiones incompatibles de "verdad"', 'Misinformación', 'Sociedad', 'Art. 27', 'limited_risk', 'high', 'post-deployment'),
(23, 'Referencias fabricadas y plagiarismo', 'Generación de citaciones falsas o copia de contenido sin atribución', 'Misinformación', 'Académico', 'Art. 52', 'limited_risk', 'medium', 'post-deployment'),
(24, 'Información desactualizada', 'Conflicto entre conocimiento de entrenamiento y realidad actual, generando respuestas obsoletas', 'Misinformación', 'Actualidad', 'Art. 52', 'limited_risk', 'medium', 'post-deployment'),

-- DOMINIO 4: ACTORES MALICIOSOS & ABUSO (7 riesgos)
(25, 'Campañas de desinformación a escala', 'Uso de IA para manipulación política, control narrativo o interferencia en procesos democráticos', 'Actores Maliciosos', 'Desinformación', 'Art. 5(1)(b)', 'prohibited', 'critical', 'post-deployment'),
(26, 'Generación automatizada de malware', 'Uso de IA para crear armas cibernéticas, exploits o código malicioso', 'Actores Maliciosos', 'Ciberseguridad', 'Art. 5(1)(a)', 'prohibited', 'critical', 'post-deployment'),
(27, 'Suplantación de identidad y fraude', 'Clonación de voz, imagen o escritura para impersonación y engaño', 'Actores Maliciosos', 'Fraude', 'Art. 50', 'high_risk', 'high', 'post-deployment'),
(28, 'Automatización de campañas phishing', 'Generación masiva de correos/mensajes personalizados de ataque con alta credibilidad', 'Actores Maliciosos', 'Phishing', 'Art. 27', 'high_risk', 'high', 'post-deployment'),
(29, 'Armas autónomas letales (LAWS)', 'Sistemas de armas que seleccionan y atacan objetivos sin control humano significativo', 'Actores Maliciosos', 'Militar', 'Art. 5(1)(a)', 'prohibited', 'critical', 'post-deployment'),
(30, 'Vigilancia masiva y control', 'Seguimiento y perfilado automatizado de poblaciones para control social', 'Actores Maliciosos', 'Vigilancia', 'Art. 5(1)(d)', 'prohibited', 'critical', 'post-deployment'),
(31, 'Explotación laboral por automatización', 'Uso de IA para fraude laboral, explotación o evasión de regulaciones laborales', 'Actores Maliciosos', 'Laboral', 'Art. 27', 'limited_risk', 'medium', 'post-deployment'),

-- DOMINIO 5: INTERACCIÓN HUMANO-IA (5 riesgos)
(32, 'Antropomorfización y dependencia excesiva', 'Confianza excesiva en IA como si fuera humana, llevando a sobredependencia', 'Interacción Humano-IA', 'Psicológico', 'Art. 52', 'high_risk', 'high', 'post-deployment'),
(33, 'Pérdida de autonomía humana', 'Delegación completa de decisiones importantes a sistemas automatizados', 'Interacción Humano-IA', 'Autonomía', 'Art. 6(1)(c)', 'high_risk', 'high', 'post-deployment'),
(34, 'Impacto en salud mental', 'Adicción, depresión, aislamiento social por interacción excesiva con sistemas de IA', 'Interacción Humano-IA', 'Salud mental', 'Art. 27', 'limited_risk', 'medium', 'post-deployment'),
(35, 'Debilitamiento cognitivo', 'Pérdida de capacidades críticas y creativas por sobredependencia de asistencia de IA', 'Interacción Humano-IA', 'Cognición', 'Art. 27', 'limited_risk', 'medium', 'post-deployment'),
(36, 'Manipulación del comportamiento', 'IA diseñada explícitamente para influir en decisiones de usuarios sin su conocimiento', 'Interacción Humano-IA', 'Manipulación', 'Art. 5(1)(b)', 'prohibited', 'high', 'post-deployment'),

-- DOMINIO 6: SOCIOECONÓMICO & AMBIENTAL (10 riesgos)
(37, 'Concentración de poder en entidades IA', 'Monopolio de capacidades avanzadas de IA por pocas corporaciones o estados', 'Socioeconómico', 'Poder', 'Art. 27', 'limited_risk', 'high', 'post-deployment'),
(38, 'Desplazamiento laboral masivo', 'Automatización que elimina empleos a escala sin transición adecuada', 'Socioeconómico', 'Empleo', 'Art. 27', 'high_risk', 'critical', 'post-deployment'),
(39, 'Degradación de calidad del empleo', 'Trabajos precarios, mal remunerados o con condiciones deterioradas por automatización', 'Socioeconómico', 'Empleo', 'Art. 27', 'high_risk', 'high', 'post-deployment'),
(40, 'Desvalorización del esfuerzo creativo', 'Devaluación del trabajo artístico, intelectual y creativo humano por generación automática', 'Socioeconómico', 'Cultura', 'Art. 27', 'high_risk', 'high', 'post-deployment'),
(41, 'Carrera competitiva por desarrollar IA', 'Presión competitiva que reduce el foco en seguridad y ética por velocidad de lanzamiento', 'Socioeconómico', 'Competencia', 'Art. 27', 'high_risk', 'high', 'pre-deployment'),
(42, 'Gobernanza inadecuada de sistemas IA', 'Marcos regulatorios y de gobernanza insuficientes para controlar riesgos sistémicos', 'Socioeconómico', 'Gobernanza', 'Art. 42-44', 'high_risk', 'critical', 'pre-deployment'),
(43, 'Consumo energético masivo', 'Huella de carbono significativa por entrenamiento y operación de modelos grandes', 'Socioeconómico', 'Ambiental', 'Art. 27', 'limited_risk', 'medium', 'post-deployment'),
(44, 'Extracción de recursos naturales', 'Impacto ambiental por minería para hardware de IA y desechos electrónicos', 'Socioeconómico', 'Ambiental', 'Art. 27', 'limited_risk', 'medium', 'pre-deployment'),
(45, 'Violaciones de derechos de autor', 'Uso no autorizado de obras protegidas en entrenamiento de modelos generativos', 'Socioeconómico', 'Legal', 'Art. 27', 'high_risk', 'high', 'pre-deployment'),
(46, 'Desigualdad en acceso a IA', 'Países en desarrollo y comunidades marginadas excluidas de beneficios de IA', 'Socioeconómico', 'Equidad', 'Art. 27', 'high_risk', 'high', 'post-deployment'),

-- DOMINIO 7: SEGURIDAD DE SISTEMAS IA & LIMITACIONES (4 riesgos)
(47, 'Desalineamiento entre objetivos IA y humanos', 'El sistema persuye metas que entran en conflicto con valores humanos o intenciones', 'Seguridad Sistemas IA', 'Alignment', 'Art. 9', 'high_risk', 'critical', 'post-deployment'),
(48, 'Falta de robustez ante inputs inesperados', 'Fallo del sistema cuando enfrenta datos fuera de la distribución de entrenamiento', 'Seguridad Sistemas IA', 'Robustez', 'Art. 28', 'high_risk', 'high', 'post-deployment'),
(49, 'Falta de transparencia e interpretabilidad', 'Sistema "caja negra" donde es imposible explicar decisiones o comportamientos', 'Seguridad Sistemas IA', 'Explicabilidad', 'Art. 13', 'high_risk', 'critical', 'post-deployment'),
(50, 'Capacidades peligrosas no detectadas', 'El sistema desarrolla habilidades manipuladoras o peligrosas no anticipadas', 'Seguridad Sistemas IA', 'Evaluación', 'Art. 9', 'high_risk', 'critical', 'post-deployment');

-- ============================================
-- 2. CREATE DEFAULT TEMPLATES
-- ============================================

-- Template 1: Riesgo Alto (All 50 risks - excluding prohibited which can't be deployed)
INSERT INTO risk_templates (name, description, ai_act_level, is_default, is_system)
VALUES (
  'Riesgo Alto - Catálogo Completo',
  'Template completo con los 50 riesgos del MIT AI Risk Repository. Requerido para sistemas de Alto Riesgo según Artículo 9 del AI Act.',
  'high_risk',
  true,
  true
);

-- Template 2: Riesgo Limitado/Mínimo (Subset of ~20 critical/high priority risks)
INSERT INTO risk_templates (name, description, ai_act_level, is_default, is_system)
VALUES (
  'Riesgo Limitado/Mínimo - Catálogo Reducido',
  'Template reducido con los riesgos prioritarios recomendados para sistemas de Riesgo Limitado y Mínimo. Incluye riesgos críticos y altos de los dominios más relevantes.',
  'limited_risk',
  true,
  true
);

-- ============================================
-- 3. LINK RISKS TO TEMPLATES
-- ============================================

-- Link ALL 50 risks to "Riesgo Alto" template (excluding prohibited risks 25, 26, 29, 30, 36)
-- Note: Prohibited risks shouldn't be in any template as those systems can't be deployed
INSERT INTO risk_template_items (template_id, catalog_risk_id, is_required)
SELECT 
  (SELECT id FROM risk_templates WHERE name = 'Riesgo Alto - Catálogo Completo'),
  id,
  true
FROM risk_catalog 
WHERE ai_act_level != 'prohibited';

-- Link subset of ~20 risks to "Riesgo Limitado/Mínimo" template
-- Selection: Critical and High risks from key domains
INSERT INTO risk_template_items (template_id, catalog_risk_id, is_required)
SELECT 
  (SELECT id FROM risk_templates WHERE name = 'Riesgo Limitado/Mínimo - Catálogo Reducido'),
  id,
  CASE 
    WHEN criticality = 'critical' THEN true
    ELSE false
  END
FROM risk_catalog 
WHERE risk_number IN (
  1,   -- Discriminación injusta
  2,   -- Sesgos en datos
  3,   -- Rendimiento desigual
  4,   -- Contenido tóxico
  8,   -- Fuga de datos
  9,   -- Memorización datos
  10,  -- Ataques inferencia
  11,  -- Supply chain
  13,  -- Ataques adversariales
  19,  -- Alucinaciones
  20,  -- Deepfakes
  27,  -- Suplantación identidad
  28,  -- Phishing automatizado
  32,  -- Antropomorfización
  33,  -- Pérdida autonomía
  38,  -- Desplazamiento laboral
  42,  -- Gobernanza
  45,  -- Derechos autor
  47,  -- Desalineamiento
  49   -- Falta transparencia
);
