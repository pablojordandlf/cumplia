-- RIA Form Templates
-- Stores dynamic questionnaire templates for EU AI Act risk classification

CREATE TABLE ria_form_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  is_system boolean DEFAULT false NOT NULL,
  is_default boolean DEFAULT false NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id),
  structure jsonb NOT NULL DEFAULT '{}',
  classification_rules jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Only one default per organization (NULL org = system-level default)
CREATE UNIQUE INDEX ria_templates_one_org_default
  ON ria_form_templates (organization_id)
  WHERE is_default = true AND organization_id IS NOT NULL;

CREATE UNIQUE INDEX ria_templates_one_system_default
  ON ria_form_templates ((true))
  WHERE is_default = true AND is_system = true;

-- Per-system template assignment (overrides the default)
CREATE TABLE ai_system_ria_assignments (
  ai_system_id uuid PRIMARY KEY REFERENCES use_cases(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES ria_form_templates(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_ria_form_templates_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER ria_form_templates_updated_at
  BEFORE UPDATE ON ria_form_templates
  FOR EACH ROW EXECUTE FUNCTION update_ria_form_templates_updated_at();

CREATE OR REPLACE FUNCTION update_ai_system_ria_assignments_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER ai_system_ria_assignments_updated_at
  BEFORE UPDATE ON ai_system_ria_assignments
  FOR EACH ROW EXECUTE FUNCTION update_ai_system_ria_assignments_updated_at();

-- RLS
ALTER TABLE ria_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_system_ria_assignments ENABLE ROW LEVEL SECURITY;

-- System templates are readable by everyone
CREATE POLICY "system_templates_readable_by_all" ON ria_form_templates
  FOR SELECT USING (is_system = true);

-- Org templates readable by org members
CREATE POLICY "org_templates_readable_by_members" ON ria_form_templates
  FOR SELECT USING (
    organization_id IS NOT NULL AND
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.status = 'active'
    )
  );

-- Own templates readable by creator (solo users)
CREATE POLICY "own_templates_readable" ON ria_form_templates
  FOR SELECT USING (
    organization_id IS NULL AND created_by = auth.uid()
  );

-- Only org admins/owners can insert templates
CREATE POLICY "org_admins_can_insert_templates" ON ria_form_templates
  FOR INSERT WITH CHECK (
    NOT is_system AND (
      -- Solo user
      organization_id IS NULL AND created_by = auth.uid()
      OR
      -- Org member with admin+
      organization_id IN (
        SELECT om.organization_id FROM organization_members om
        WHERE om.user_id = auth.uid()
          AND om.status = 'active'
          AND om.role IN ('owner', 'admin')
      )
    )
  );

-- Only owners of templates can update (not system templates)
CREATE POLICY "template_owners_can_update" ON ria_form_templates
  FOR UPDATE USING (
    NOT is_system AND (
      created_by = auth.uid()
      OR organization_id IN (
        SELECT om.organization_id FROM organization_members om
        WHERE om.user_id = auth.uid()
          AND om.status = 'active'
          AND om.role IN ('owner', 'admin')
      )
    )
  );

-- Only owners can delete custom templates
CREATE POLICY "template_owners_can_delete" ON ria_form_templates
  FOR DELETE USING (
    NOT is_system AND (
      created_by = auth.uid()
      OR organization_id IN (
        SELECT om.organization_id FROM organization_members om
        WHERE om.user_id = auth.uid()
          AND om.status = 'active'
          AND om.role IN ('owner', 'admin')
      )
    )
  );

-- RIA assignments: accessible to system owners
CREATE POLICY "ria_assignments_select" ON ai_system_ria_assignments
  FOR SELECT USING (
    ai_system_id IN (
      SELECT id FROM use_cases
      WHERE user_id = auth.uid()
        OR organization_id IN (
          SELECT om.organization_id FROM organization_members om
          WHERE om.user_id = auth.uid() AND om.status = 'active'
        )
    )
  );

CREATE POLICY "ria_assignments_insert" ON ai_system_ria_assignments
  FOR INSERT WITH CHECK (
    ai_system_id IN (
      SELECT id FROM use_cases
      WHERE user_id = auth.uid()
        OR organization_id IN (
          SELECT om.organization_id FROM organization_members om
          WHERE om.user_id = auth.uid() AND om.status = 'active'
            AND om.role IN ('owner', 'admin', 'editor')
        )
    )
  );

CREATE POLICY "ria_assignments_update" ON ai_system_ria_assignments
  FOR UPDATE USING (
    ai_system_id IN (
      SELECT id FROM use_cases
      WHERE user_id = auth.uid()
        OR organization_id IN (
          SELECT om.organization_id FROM organization_members om
          WHERE om.user_id = auth.uid() AND om.status = 'active'
            AND om.role IN ('owner', 'admin', 'editor')
        )
    )
  );

CREATE POLICY "ria_assignments_delete" ON ai_system_ria_assignments
  FOR DELETE USING (
    ai_system_id IN (
      SELECT id FROM use_cases
      WHERE user_id = auth.uid()
        OR organization_id IN (
          SELECT om.organization_id FROM organization_members om
          WHERE om.user_id = auth.uid() AND om.status = 'active'
            AND om.role IN ('owner', 'admin', 'editor')
        )
    )
  );

-- ─── Seed the system template ────────────────────────────────────────────────

INSERT INTO ria_form_templates (
  id,
  name,
  description,
  is_system,
  is_default,
  organization_id,
  created_by,
  structure,
  classification_rules
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Plantilla EU AI Act (Sistema)',
  'Cuestionario oficial de clasificación de riesgo según el Reglamento (UE) 2024/1689 (AI Act). Cubre: tipo de sistema, usos prohibidos (Art. 5), sistemas de alto riesgo (Anexo III) y obligaciones de transparencia (Art. 50).',
  true,
  true,
  null,
  null,
  '{
    "version": "1.0",
    "steps": [
      {
        "id": "step-1",
        "key": "systemType",
        "title": "Tipo de Sistema de IA",
        "description": "Si usas un modelo de terceros vía API (OpenAI, Anthropic, Google…), selecciona según la aplicación que construyes, no según el modelo base.",
        "type": "system_type",
        "step_order": 1,
        "applies_to": "all",
        "options": [
          {
            "value": "gpai_base",
            "label": "Modelo GPAI",
            "description": "Entreno y distribuyo un modelo base sin interfaz ni caso de uso propio",
            "examples": "LLM propio, modelo de embeddings propietario",
            "icon": "Brain",
            "tooltip": "Un modelo GPAI (General Purpose AI) es un modelo entrenado con grandes cantidades de datos que puede realizar múltiples tipos de tareas. Si eres tú quien lo entrena y lo distribuye —sin definir un caso de uso concreto— selecciona esta opción. Si lo que haces es usar un modelo de otro (OpenAI, Anthropic, etc.) para construir tu aplicación, no eres proveedor de un modelo GPAI."
          },
          {
            "value": "gpai_systemic",
            "label": "Modelo GPAI de alto impacto",
            "description": "Mi modelo supera 10²⁵ FLOP de entrenamiento o ha sido designado por la Comisión Europea",
            "examples": "Modelos frontier de grandes laboratorios de IA",
            "icon": "Sparkles",
            "tooltip": "El AI Act define un umbral cuantitativo de 10²⁵ FLOP de cómputo de entrenamiento para considerar un modelo GPAI de riesgo sistémico. También puede ser designado por la Comisión Europea en base a otros criterios como el número de usuarios o capacidades en dominios críticos. Esta categoría aplica a muy pocos actores a nivel mundial."
          },
          {
            "value": "specific",
            "label": "Sistema con finalidad definida",
            "description": "Aplico IA a un caso de uso concreto, aunque use un modelo de terceros",
            "examples": "Chatbot, detector de fraude, scoring de crédito, generador de contratos",
            "badge": "★ más habitual",
            "icon": "Cpu",
            "tooltip": "Es la categoría más frecuente para PYMEs. Si tu sistema tiene un propósito claro y específico —aunque por debajo use GPT-4 u otro modelo— selecciona esta opción. La finalidad concreta es lo que determina el riesgo regulatorio, no el modelo subyacente."
          },
          {
            "value": "multipurpose",
            "label": "Sistema con múltiples usos",
            "description": "Mi sistema puede aplicarse a distintos casos de uso sin uno único definido",
            "examples": "Plataforma de automatización corporativa, asistente IA multiuso interno",
            "icon": "Bot",
            "tooltip": "Selecciona esta opción si tu sistema está diseñado para que distintos departamentos o clientes lo usen con finalidades diferentes, sin una única función predefinida. En este caso, el AI Act exige evaluar el riesgo por cada caso de uso concreto. CumplIA te mostrará una advertencia para que repitas la evaluación por cada uso previsto."
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Usos Prohibidos (Art. 5)",
        "type": "questions",
        "step_order": 2,
        "applies_to": "all",
        "badge_text": "Cualquier Sí → Prohibido",
        "badge_color": "red",
        "warning_message": "Si cualquier respuesta es Sí, el sistema está prohibido en la UE. Aplica a todos los tipos de sistema.",
        "warning_type": "danger",
        "sections": [
          {
            "id": "section-2-a",
            "title": "Sección A: Manipulación y explotación",
            "section_order": 1,
            "questions": [
              {
                "id": "q-p2-1",
                "key": "p2_1",
                "label": "2.1 — ¿El sistema intenta influir en el comportamiento de las personas sin que sean conscientes, o aprovecha sus puntos débiles para perjudicarlas?",
                "tooltip": "El AI Act prohíbe dos técnicas distintas: (1) técnicas subliminales que operan fuera de la consciencia del usuario; y (2) técnicas que explotan vulnerabilidades específicas —edad, discapacidad, situación económica— para distorsionar la conducta causando daño. Si tu sistema optimiza métricas de engagement sin considerar el impacto en el usuario, puede entrar en esta categoría.",
                "question_order": 1,
                "affects_classification": true
              },
              {
                "id": "q-p2-2",
                "key": "p2_2",
                "label": "2.2 — ¿El sistema puntúa o clasifica a personas por su comportamiento para conceder o denegar beneficios en contextos no relacionados con esa puntuación?",
                "tooltip": "La prohibición de social scoring se refiere a usar IA para construir perfiles de comportamiento social que luego se usen en contextos distintos al que generó los datos. No confundir con el scoring crediticio tradicional basado en historial financiero (que es Alto Riesgo, no Prohibido).",
                "question_order": 2,
                "affects_classification": true
              }
            ]
          },
          {
            "id": "section-2-b",
            "title": "Sección B: Vigilancia y biometría",
            "section_order": 2,
            "questions": [
              {
                "id": "q-p2-3",
                "key": "p2_3",
                "label": "2.3 — ¿El sistema identifica personas a distancia y en tiempo real en espacios públicos mediante biometría, con fines de vigilancia policial?",
                "tooltip": "Se refiere a la identificación biométrica remota en tiempo real: el sistema procesa rasgos físicos de personas en espacios accesibles al público para contrastarlos con bases de datos, mientras ocurre. Esta prohibición tiene tres excepciones muy estrictas — si crees que tu sistema podría acogerse a alguna, responde Sí y se desplegará la subpregunta.",
                "question_order": 1,
                "affects_classification": true
              },
              {
                "id": "q-p2-3a",
                "key": "p2_3a",
                "label": "2.3a — ¿Opera exclusivamente bajo autorización judicial para búsqueda de víctimas de trata, prevención de ataque terrorista inminente o localización de sospechosos de delitos graves?",
                "tooltip": "Las tres únicas excepciones requieren: (1) autorización judicial previa, (2) que el uso sea estrictamente necesario, y (3) que existan las salvaguardas procedimentales exigidas. Si se cumple todo → no es Prohibido, pero sí es Alto Riesgo. Si hay cualquier duda, consulta con asesoría legal.",
                "question_order": 2,
                "affects_classification": true,
                "parent_question_id": "q-p2-3",
                "parent_answer_trigger": "yes"
              },
              {
                "id": "q-p2-4",
                "key": "p2_4",
                "label": "2.4 — ¿El sistema deduce rasgos sensibles —raza, ideología política, religión u orientación sexual— a partir de datos biométricos?",
                "tooltip": "Esta prohibición cubre los sistemas que usan datos biométricos (imagen, voz, movimiento, señales fisiológicas) para inferir atributos especialmente protegidos. No requiere que la inferencia sea correcta — el mero intento de deducir estos atributos es suficiente para la prohibición.",
                "question_order": 3,
                "affects_classification": true
              },
              {
                "id": "q-p2-5",
                "key": "p2_5",
                "label": "2.5 — ¿El sistema recopila imágenes de rostros de forma masiva desde internet o cámaras para crear o ampliar bases de datos de reconocimiento facial?",
                "tooltip": "La prohibición cubre tanto el scraping desde fuentes abiertas (redes sociales, webs públicas) como la captura desde sistemas de videovigilancia, siempre que el fin sea construir o ampliar bases de datos de reconocimiento facial. La mera recopilación masiva con esta finalidad está prohibida.",
                "question_order": 4,
                "affects_classification": true
              },
              {
                "id": "q-p2-6",
                "key": "p2_6",
                "label": "2.6 — ¿El sistema detecta o infiere las emociones de empleados o estudiantes en el contexto laboral o educativo?",
                "tooltip": "El AI Act prohíbe la inferencia de emociones en el lugar de trabajo y en centros educativos. No aplica si la finalidad es exclusivamente médica o de seguridad y está debidamente documentada. Si hay una relación de dependencia o evaluación, aplica la prohibición.",
                "question_order": 5,
                "affects_classification": true
              }
            ]
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Sistemas de Alto Riesgo (Art. 6 y Anexo III)",
        "type": "questions",
        "step_order": 3,
        "applies_to": "non_gpai",
        "warning_message": "Si cualquier respuesta es Sí, el sistema se clasifica como Alto Riesgo salvo que se aplique la excepción de la Sección 2 del Art. 6.",
        "warning_type": "warning",
        "sections": [
          {
            "id": "section-3-biometry",
            "title": "Biometría",
            "section_order": 1,
            "questions": [
              {
                "id": "q-p3-1",
                "key": "p3_1",
                "label": "3.1 — ¿El sistema realiza identificación biométrica remota en diferido (no en tiempo real) de personas?",
                "tooltip": "La identificación biométrica remota post-facto consiste en cotejar grabaciones o imágenes ya obtenidas contra bases de datos, sin hacerlo en el momento de la captura. Es Alto Riesgo (no Prohibido) cuando no se hace en tiempo real.",
                "question_order": 1,
                "affects_classification": true
              },
              {
                "id": "q-p3-2",
                "key": "p3_2",
                "label": "3.2 — ¿El sistema categoriza personas por características biométricas para inferir raza, opinión política, sindicación, religión, vida u orientación sexual?",
                "tooltip": "La categorización biométrica sensible va más allá de la identificación: infiere atributos especialmente protegidos. No confundir con la prohibición (p2_4): aquí aplica cuando el uso es legítimo pero la materia es sensible, lo que lo convierte en Alto Riesgo.",
                "question_order": 2,
                "affects_classification": true
              },
              {
                "id": "q-p3-3",
                "key": "p3_3",
                "label": "3.3 — ¿El sistema detecta, reconoce o verifica emociones de personas?",
                "tooltip": "La detección de emociones mediante biometría (expresión facial, tono de voz, microgestos) es Alto Riesgo cuando no opera en el ámbito laboral o educativo (donde sería Prohibida). Por ejemplo, en atención al cliente, banca o seguros puede ser Alto Riesgo.",
                "question_order": 3,
                "affects_classification": true
              },
              {
                "id": "q-p3-3a",
                "key": "p3_3a",
                "label": "3.3a — ¿Se usa exclusivamente con finalidad médica o de seguridad debidamente documentada?",
                "tooltip": "Si la detección de emociones tiene una finalidad exclusivamente médica (p.ej., monitorización de pacientes) o de seguridad (p.ej., detección de fatiga en conductores) y está debidamente justificada y documentada, se aplica una excepción que puede reducir su clasificación.",
                "question_order": 4,
                "affects_classification": true,
                "parent_question_id": "q-p3-3",
                "parent_answer_trigger": "yes"
              }
            ]
          },
          {
            "id": "section-3-infra",
            "title": "Infraestructuras y seguridad",
            "section_order": 2,
            "questions": [
              {
                "id": "q-p3-4",
                "key": "p3_4",
                "label": "3.4 — ¿El sistema gestiona o controla infraestructura crítica (redes eléctricas, agua, gas, transporte o sistemas financieros)?",
                "tooltip": "Infraestructura crítica es aquella cuya interrupción tendría consecuencias graves para la seguridad pública, la economía o servicios esenciales. Si el sistema toma decisiones automatizadas que afectan a estos entornos, se clasifica como Alto Riesgo.",
                "question_order": 1,
                "affects_classification": true
              },
              {
                "id": "q-p3-5",
                "key": "p3_5",
                "label": "3.5 — ¿El sistema es un componente de seguridad de un producto regulado por legislación sectorial de la UE (Anexo I del AI Act)?",
                "tooltip": "El Anexo I del AI Act lista sectores con legislación de armonización preexistente: maquinaria industrial, juguetes, equipos de radio, equipos de presión, vehículos a motor, dispositivos médicos, equipos de protección individual, entre otros. Si tu sistema de IA actúa como componente de seguridad de estos productos, es Alto Riesgo.",
                "question_order": 2,
                "affects_classification": true
              }
            ]
          },
          {
            "id": "section-3-rights",
            "title": "Derechos fundamentales y acceso a servicios",
            "section_order": 3,
            "questions": [
              {
                "id": "q-p3-6",
                "key": "p3_6",
                "label": "3.6 — ¿El sistema determina el acceso a educación, formación profesional, o evalúa el rendimiento académico?",
                "tooltip": "Sistemas que deciden quién accede a instituciones educativas, qué trayectorias formativas se recomiendan, o que evalúan el rendimiento de estudiantes. Incluye plataformas de evaluación adaptativa, sistemas de admisión y herramientas de detección de plagio que determinan sanciones.",
                "question_order": 1,
                "affects_classification": true
              },
              {
                "id": "q-p3-7",
                "key": "p3_7",
                "label": "3.7 — ¿El sistema interviene en reclutamiento, selección, evaluación o gestión de personas en el empleo?",
                "tooltip": "Aplica a la IA que filtra CVs, puntúa candidatos, decide ascensos o despidos, asigna tareas, monitoriza productividad o determina condiciones laborales. La presencia de supervisión humana no excluye la clasificación como Alto Riesgo si la IA condiciona las decisiones finales.",
                "question_order": 2,
                "affects_classification": true
              },
              {
                "id": "q-p3-8",
                "key": "p3_8",
                "label": "3.8 — ¿El sistema evalúa la elegibilidad para servicios públicos, prestaciones sociales, créditos, seguros u otros servicios esenciales?",
                "tooltip": "Scoring crediticio, evaluación de riesgo en seguros, valoración de elegibilidad para ayudas sociales, scoring médico para priorización de atención. La clave es si el sistema condiciona de forma significativa el acceso de personas a recursos o servicios esenciales.",
                "question_order": 3,
                "affects_classification": true
              }
            ]
          },
          {
            "id": "section-3-order",
            "title": "Orden público y justicia",
            "section_order": 4,
            "questions": [
              {
                "id": "q-p3-9",
                "key": "p3_9",
                "label": "3.9 — ¿El sistema apoya decisiones en las áreas de aplicación de la ley, gestión migratoria, asilo, control de fronteras, administración de justicia o procesos democráticos?",
                "tooltip": "Esta categoría agrupa los tres últimos grupos del Anexo III: (6) aplicación de la ley — análisis de riesgo de reincidencia, perfilado, poligrafía; (7) migración y asilo — valoración de solicitudes, detección de documentos fraudulentos; (8) administración de justicia — asistencia a jueces; y (9) procesos democráticos — influencia en elecciones o referéndums.",
                "question_order": 1,
                "affects_classification": true
              }
            ]
          }
        ]
      },
      {
        "id": "step-4",
        "title": "Obligaciones de Transparencia (Art. 50)",
        "type": "questions",
        "step_order": 4,
        "applies_to": "all",
        "warning_message": "Un Sí activa la obligación de transparencia pero no cambia el nivel de riesgo principal. Puede coexistir con cualquier clasificación.",
        "warning_type": "info",
        "sections": [
          {
            "id": "section-4-main",
            "title": "",
            "section_order": 1,
            "questions": [
              {
                "id": "q-p4-1",
                "key": "p4_1",
                "label": "4.1 — ¿El sistema interactúa directamente con personas sin que sea evidente que están ante una IA (chatbots, agentes conversacionales)?",
                "tooltip": "La obligación aplica cuando un usuario podría creer razonablemente que está interactuando con una persona humana. No aplica si el uso de IA es obvio por el contexto o si el usuario ya fue informado. Incluye chatbots de atención al cliente, asistentes virtuales y agentes autónomos.",
                "question_order": 1,
                "affects_classification": true
              },
              {
                "id": "q-p4-2",
                "key": "p4_2",
                "label": "4.2 — ¿El sistema genera contenido sintético de imagen, audio o vídeo que representa personas, lugares o eventos reales (deepfakes)?",
                "tooltip": "La obligación de marcar el contenido como generado por IA aplica a los contenidos que podrían inducir a error sobre su autenticidad. Se excluyen los usos artísticos o de entretenimiento que lo anuncien claramente. El foco es en la capacidad de confusión con la realidad.",
                "question_order": 2,
                "affects_classification": true
              },
              {
                "id": "q-p4-3",
                "key": "p4_3",
                "label": "4.3 — ¿El sistema genera textos publicados sobre materias de interés público sin revelar que son generados por IA?",
                "tooltip": "Aplica a sistemas que producen contenido informativo, periodístico o de análisis de actualidad que podría presentarse al público sin indicar su origen artificial. El objetivo es prevenir la desinformación a escala.",
                "question_order": 3,
                "affects_classification": true
              },
              {
                "id": "q-p4-4",
                "key": "p4_4",
                "label": "4.4 — ¿El sistema detecta o infiere emociones de personas (fuera del ámbito laboral/educativo prohibido)?",
                "tooltip": "La detección de emociones en contextos no prohibidos (ver 2.6) activa la obligación de informar al afectado. Por ejemplo, en atención al cliente o en aplicaciones de salud mental. Debe notificarse al usuario antes o en el momento en que se produce la detección.",
                "question_order": 4,
                "affects_classification": true
              }
            ]
          }
        ]
      }
    ]
  }',
  '{
    "version": "1.0",
    "rules": [
      {
        "result": "prohibited",
        "logic": "any",
        "conditions": [
          {"type": "field_equals", "field": "p2_1", "value": "yes"},
          {"type": "field_equals", "field": "p2_2", "value": "yes"},
          {
            "type": "all",
            "conditions": [
              {"type": "field_equals", "field": "p2_3", "value": "yes"},
              {"type": "field_equals", "field": "p2_3a", "value": "no"}
            ]
          },
          {"type": "field_equals", "field": "p2_4", "value": "yes"},
          {"type": "field_equals", "field": "p2_5", "value": "yes"},
          {"type": "field_equals", "field": "p2_6", "value": "yes"}
        ]
      },
      {
        "result": "high_risk",
        "logic": "any",
        "conditions": [
          {"type": "field_equals", "field": "systemType", "value": "gpai_systemic"},
          {
            "type": "all",
            "conditions": [
              {"type": "field_equals", "field": "p2_3", "value": "yes"},
              {"type": "field_equals", "field": "p2_3a", "value": "yes"}
            ]
          },
          {"type": "field_equals", "field": "p3_1", "value": "yes"},
          {"type": "field_equals", "field": "p3_2", "value": "yes"},
          {
            "type": "all",
            "conditions": [
              {"type": "field_equals", "field": "p3_3", "value": "yes"},
              {"type": "field_equals", "field": "p3_3a", "value": "yes"}
            ]
          },
          {"type": "field_equals", "field": "p3_4", "value": "yes"},
          {"type": "field_equals", "field": "p3_5", "value": "yes"},
          {"type": "field_equals", "field": "p3_6", "value": "yes"},
          {"type": "field_equals", "field": "p3_7", "value": "yes"},
          {"type": "field_equals", "field": "p3_8", "value": "yes"},
          {"type": "field_equals", "field": "p3_9", "value": "yes"}
        ]
      },
      {
        "result": "gpai_regime",
        "logic": "any",
        "conditions": [
          {"type": "field_equals", "field": "systemType", "value": "gpai_base"}
        ]
      },
      {
        "result": "limited_risk",
        "logic": "any",
        "conditions": [
          {"type": "field_equals", "field": "systemType", "value": "multipurpose"},
          {"type": "field_equals", "field": "p4_1", "value": "yes"},
          {"type": "field_equals", "field": "p4_2", "value": "yes"},
          {"type": "field_equals", "field": "p4_3", "value": "yes"},
          {"type": "field_equals", "field": "p4_4", "value": "yes"}
        ]
      }
    ],
    "transparency_rules": {
      "logic": "any",
      "conditions": [
        {"type": "field_equals", "field": "p4_1", "value": "yes"},
        {"type": "field_equals", "field": "p4_2", "value": "yes"},
        {"type": "field_equals", "field": "p4_3", "value": "yes"},
        {"type": "field_equals", "field": "p4_4", "value": "yes"}
      ]
    },
    "priority": ["prohibited", "high_risk", "gpai_regime", "limited_risk", "minimal_risk"],
    "default_result": "minimal_risk"
  }'
);
