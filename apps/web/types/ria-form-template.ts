export type RiskLevel =
  | 'prohibited'
  | 'high_risk'
  | 'gpai_regime'
  | 'limited_risk'
  | 'minimal_risk';

export type SystemTypeValue =
  | 'gpai'
  | 'non_gpai_embedded'
  | 'non_gpai_standalone'
  | 'unsure';

// --- Form Structure Types ---

export interface RiaSystemTypeOption {
  value: SystemTypeValue;
  label: string;
  description?: string;
}

export interface RiaFormQuestion {
  id: string;
  key: string;
  label: string;
  tooltip?: string;
  affects_classification: boolean;
  parent_question_id: string | null;
  parent_answer_trigger: string | null;
  options?: Array<{ value: string; label: string }>;
}

export interface RiaFormSection {
  id: string;
  title: string;
  description?: string;
  questions: RiaFormQuestion[];
}

export interface RiaFormStep {
  id: string;
  title: string;
  subtitle?: string;
  type: 'system_type' | 'questions';
  applies_to?: 'all' | 'non_gpai' | 'gpai';
  options?: RiaSystemTypeOption[];
  sections?: RiaFormSection[];
}

export interface RiaFormStructure {
  version: string;
  steps: RiaFormStep[];
}

// --- Classification Rules Types ---

export interface FieldEqualsCondition {
  type: 'field_equals';
  field: string;
  value: string;
}

export interface AllCondition {
  type: 'all';
  conditions: RiaCondition[];
}

export interface AnyCondition {
  type: 'any';
  conditions: RiaCondition[];
}

export type RiaCondition = FieldEqualsCondition | AllCondition | AnyCondition;

export interface RiaClassificationRule {
  result: RiskLevel;
  logic: 'all' | 'any';
  conditions: RiaCondition[];
}

export interface RiaTransparencyRule {
  logic: 'all' | 'any';
  conditions: RiaCondition[];
}

export interface RiaClassificationRules {
  version: string;
  rules: RiaClassificationRule[];
  transparency_rules: RiaTransparencyRule;
  priority: RiskLevel[];
  default_result: RiskLevel;
}

// --- Template Record Types ---

export interface RiaFormTemplate {
  id: string;
  name: string;
  description?: string;
  is_system: boolean;
  is_default: boolean;
  organization_id: string | null;
  created_by: string | null;
  structure: RiaFormStructure;
  classification_rules: RiaClassificationRules;
  created_at: string;
  updated_at: string;
}

export interface AiSystemRiaAssignment {
  ai_system_id: string;
  template_id: string;
  created_at: string;
  updated_at: string;
}

// --- API Payload Types ---

export interface CreateRiaTemplatePayload {
  name: string;
  description?: string;
  structure: RiaFormStructure;
  classification_rules: RiaClassificationRules;
  source_template_id?: string;
}

export interface UpdateRiaTemplatePayload {
  name?: string;
  description?: string;
  structure?: RiaFormStructure;
  classification_rules?: RiaClassificationRules;
  is_default?: boolean;
}

// --- Form Answers ---

export type RiaFormAnswers = Record<string, string>;
