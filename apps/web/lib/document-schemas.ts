// Document Schemas for Document Generation Wizard
// Defines the form fields and structure for each document type

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'number';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
  section: 'organization' | 'document' | 'use_case';
}

export interface DocumentSchema {
  type: string;
  title: string;
  description: string;
  legalBasis: string;
  requiresUseCase: boolean;
  minPlan: 'starter' | 'essential' | 'professional';
  fields: FormField[];
}

export const documentSchemas: Record<string, DocumentSchema> = {
  ai_policy: {
    type: 'ai_policy',
    title: 'Política de Uso de IA',
    description: 'Documento maestro de gobernanza de IA para toda la organización',
    legalBasis: 'Art. 26 AI Act - Obligaciones del Desplegador',
    requiresUseCase: false,
    minPlan: 'starter',
    fields: [
      {
        id: 'scope_description',
        type: 'textarea',
        label: 'Alcance de la política',
        placeholder: 'Describe el alcance de esta política (ej: todos los empleados, contratistas, departamentos específicos...)',
        required: true,
        section: 'document',
        helpText: 'Define quién debe cumplir esta política',
      },
      {
        id: 'responsible_department',
        type: 'text',
        label: 'Departamento responsable',
        placeholder: 'ej: Dirección de Tecnología / Compliance',
        required: true,
        section: 'document',
      },
      {
        id: 'review_frequency',
        type: 'select',
        label: 'Frecuencia de revisión',
        required: true,
        section: 'document',
        options: [
          { value: 'annual', label: 'Anual' },
          { value: 'biannual', label: 'Semestral' },
          { value: 'quarterly', label: 'Trimestral' },
        ],
      },
      {
        id: 'include_prohibited_uses',
        type: 'multiselect',
        label: 'Usos prohibidos específicos',
        required: false,
        section: 'document',
        helpText: 'Selecciona los usos prohibidos que quieres destacar en la política',
        options: [
          { value: 'social_scoring', label: 'Sistemas de puntuación social' },
          { value: 'subliminal', label: 'Manipulación subliminal' },
          { value: 'biometric_remote', label: 'Identificación biométrica remota' },
          { value: 'emotion_recognition', label: 'Reconocimiento de emociones' },
          { value: 'predictive_policing', label: 'Policía predictiva' },
        ],
      },
    ],
  },

  employee_notice: {
    type: 'employee_notice',
    title: 'Notificación a Empleados',
    description: 'Información obligatoria para empleados en sistemas de alto riesgo',
    legalBasis: 'Art. 50 AI Act - Transparencia',
    requiresUseCase: true,
    minPlan: 'essential',
    fields: [
      {
        id: 'employee_categories',
        type: 'multiselect',
        label: 'Categorías de empleados afectados',
        required: true,
        section: 'document',
        options: [
          { value: 'all_employees', label: 'Todos los empleados' },
          { value: 'hr_department', label: 'Departamento de RRHH' },
          { value: 'managers', label: 'Gerentes y directivos' },
          { value: 'candidates', label: 'Candidatos externos' },
          { value: 'contractors', label: 'Contratistas' },
        ],
      },
      {
        id: 'notification_date',
        type: 'date',
        label: 'Fecha de notificación',
        required: true,
        section: 'document',
        helpText: 'Fecha en que se notificará a los empleados',
      },
      {
        id: 'system_purpose',
        type: 'textarea',
        label: 'Propósito del sistema de IA',
        placeholder: 'Describe para qué se utiliza el sistema de IA y qué decisiones automatiza',
        required: true,
        section: 'document',
      },
      {
        id: 'automated_decisions',
        type: 'textarea',
        label: 'Decisiones automatizadas',
        placeholder: 'ej: evaluación de desempeño, asignación de tareas, promociones...',
        required: true,
        section: 'document',
        helpText: 'Qué decisiones toma el sistema de forma automatizada',
      },
      {
        id: 'human_oversight_contact',
        type: 'text',
        label: 'Persona/departamento de supervisión',
        placeholder: 'ej: Dirección de RRHH / DPO',
        required: true,
        section: 'document',
        helpText: 'Quién supervisa el sistema y revisa las decisiones',
      },
      {
        id: 'appeal_procedure',
        type: 'textarea',
        label: 'Procedimiento de apelación',
        placeholder: 'Describe cómo los empleados pueden apelar decisiones o solicitar revisión humana',
        required: true,
        section: 'document',
      },
      {
        id: 'data_protection_measures',
        type: 'textarea',
        label: 'Medidas de protección de datos',
        placeholder: 'ej: Encriptación, anonimización, control de accesos...',
        required: true,
        section: 'document',
      },
    ],
  },

  systems_register: {
    type: 'systems_register',
    title: 'Registro de Sistemas',
    description: 'Inventario formal de todos los sistemas de IA de la organización',
    legalBasis: 'Art. 71 AI Act - Registro de sistemas de alto riesgo',
    requiresUseCase: true,
    minPlan: 'essential',
    fields: [
      {
        id: 'register_scope',
        type: 'select',
        label: 'Alcance del registro',
        required: true,
        section: 'document',
        options: [
          { value: 'all_systems', label: 'Todos los sistemas de IA' },
          { value: 'high_risk_only', label: 'Solo sistemas de alto riesgo' },
          { value: 'internal_only', label: 'Solo sistemas internos' },
        ],
      },
      {
        id: 'last_update_date',
        type: 'date',
        label: 'Fecha de última actualización',
        required: true,
        section: 'document',
      },
      {
        id: 'next_review_date',
        type: 'date',
        label: 'Próxima fecha de revisión',
        required: true,
        section: 'document',
      },
      {
        id: 'responsible_person',
        type: 'text',
        label: 'Persona responsable del registro',
        placeholder: 'Nombre y cargo',
        required: true,
        section: 'document',
      },
    ],
  },

  fria: {
    type: 'fria',
    title: 'FRIA - Evaluación de Impacto',
    description: 'Evaluación de Impacto en Derechos Fundamentales (Art. 27 AI Act)',
    legalBasis: 'Art. 27-29 AI Act - FRIA',
    requiresUseCase: true,
    minPlan: 'professional',
    fields: [
      {
        id: 'system_description',
        type: 'textarea',
        label: 'Descripción detallada del sistema',
        placeholder: 'Describe el sistema, su propósito, funcionalidades y contexto de uso...',
        required: true,
        section: 'document',
      },
      {
        id: 'affected_rights',
        type: 'multiselect',
        label: 'Derechos fundamentales afectados',
        required: true,
        section: 'document',
        options: [
          { value: 'data_protection', label: 'Protección de datos (GDPR)' },
          { value: 'non_discrimination', label: 'No discriminación' },
          { value: 'labor_rights', label: 'Derechos laborales' },
          { value: 'access_to_justice', label: 'Acceso a la justicia' },
          { value: 'freedom_expression', label: 'Libertad de expresión' },
          { value: 'privacy', label: 'Privacidad' },
        ],
      },
      {
        id: 'positive_impacts',
        type: 'textarea',
        label: 'Impactos positivos identificados',
        placeholder: 'Describe los beneficios y mejoras que aporta el sistema...',
        required: true,
        section: 'document',
      },
      {
        id: 'negative_impacts',
        type: 'textarea',
        label: 'Impactos negativos / riesgos identificados',
        placeholder: 'Describe los riesgos potenciales y efectos adversos...',
        required: true,
        section: 'document',
      },
      {
        id: 'mitigation_measures',
        type: 'multiselect',
        label: 'Medidas de mitigación implementadas',
        required: true,
        section: 'document',
        options: [
          { value: 'human_oversight', label: 'Supervisión humana' },
          { value: 'bias_audits', label: 'Auditorías de sesgo' },
          { value: 'explainability', label: 'Explicabilidad de decisiones' },
          { value: 'data_minimization', label: 'Minimización de datos' },
          { value: 'regular_monitoring', label: 'Monitorización regular' },
          { value: 'incident_logging', label: 'Registro de incidentes' },
        ],
      },
      {
        id: 'human_oversight_details',
        type: 'textarea',
        label: 'Detalles de supervisión humana',
        placeholder: 'Describe quién supervisa, cómo y con qué frecuencia...',
        required: true,
        section: 'document',
      },
      {
        id: 'appeal_mechanism',
        type: 'textarea',
        label: 'Mecanismo de apelación / revisión',
        placeholder: 'Describe el proceso para que las personas afectadas puedan apelar decisiones...',
        required: true,
        section: 'document',
      },
      {
        id: 'consultation_conducted',
        type: 'select',
        label: '¿Se ha realizado consulta a trabajadores/representantes?',
        required: true,
        section: 'document',
        options: [
          { value: 'yes_completed', label: 'Sí, completada' },
          { value: 'yes_in_progress', label: 'Sí, en progreso' },
          { value: 'planned', label: 'Planeada' },
          { value: 'not_required', label: 'No requerida' },
        ],
      },
      {
        id: 'consultation_summary',
        type: 'textarea',
        label: 'Resumen de la consulta realizada',
        placeholder: 'Resume las aportaciones recibidas y cómo se han integrado...',
        required: false,
        section: 'document',
      },
      {
        id: 'risk_benefit_analysis',
        type: 'textarea',
        label: 'Análisis riesgo-beneficio',
        placeholder: 'Resume el balance entre riesgos y beneficios del sistema...',
        required: true,
        section: 'document',
      },
      {
        id: 'implementation_decision',
        type: 'select',
        label: 'Decisión sobre implementación',
        required: true,
        section: 'document',
        options: [
          { value: 'proceed', label: 'Proceder con la implementación' },
          { value: 'proceed_with_modifications', label: 'Proceder con modificaciones' },
          { value: 'do_not_proceed', label: 'No proceder' },
        ],
      },
      {
        id: 'review_date',
        type: 'date',
        label: 'Fecha de revisión programada',
        required: true,
        section: 'document',
        helpText: 'La FRIA debe revisarse al menos anualmente',
      },
    ],
  },

  candidate_notice: {
    type: 'candidate_notice',
    title: 'Notificación a Candidatos',
    description: 'Información para candidatos en procesos de selección con IA',
    legalBasis: 'Art. 50 + Anexo III AI Act - Procesos de selección',
    requiresUseCase: true,
    minPlan: 'essential',
    fields: [
      {
        id: 'selection_process_description',
        type: 'textarea',
        label: 'Descripción del proceso de selección',
        placeholder: 'Describe el proceso completo, etapas y uso de IA en cada una...',
        required: true,
        section: 'document',
      },
      {
        id: 'ia_usage_description',
        type: 'textarea',
        label: 'Uso específico de IA en el proceso',
        placeholder: 'ej: screening de CVs, evaluación de competencias, análisis de video entrevistas...',
        required: true,
        section: 'document',
      },
      {
        id: 'evaluation_criteria',
        type: 'textarea',
        label: 'Criterios de evaluación',
        placeholder: 'Describe los criterios que utiliza el sistema para evaluar candidatos...',
        required: true,
        section: 'document',
      },
      {
        id: 'dpo_contact',
        type: 'text',
        label: 'Contacto del Delegado de Protección de Datos',
        placeholder: 'email@empresa.com',
        required: true,
        section: 'document',
      },
      {
        id: 'data_retention_period',
        type: 'text',
        label: 'Período de conservación de datos',
        placeholder: 'ej: 2 años desde la finalización del proceso',
        required: true,
        section: 'document',
      },
      {
        id: 'rights_explanation',
        type: 'textarea',
        label: 'Explicación de derechos ARCO',
        placeholder: 'Describe cómo los candidatos pueden ejercer sus derechos de acceso, rectificación, cancelación y oposición...',
        required: true,
        section: 'document',
      },
    ],
  },
};

// Helper function to get schema by type
export function getDocumentSchema(type: string): DocumentSchema | undefined {
  return documentSchemas[type];
}

// Helper function to get all available document types
export function getAvailableDocumentTypes(): DocumentSchema[] {
  return Object.values(documentSchemas);
}

// Helper function to check if a document type requires a use case
export function requiresUseCase(type: string): boolean {
  return documentSchemas[type]?.requiresUseCase ?? false;
}

// Helper function to get minimum plan for a document type
export function getMinPlan(type: string): string {
  return documentSchemas[type]?.minPlan ?? 'starter';
}
