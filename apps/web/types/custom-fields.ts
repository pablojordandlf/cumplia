export interface CustomFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'email' | 'number';
}

export type RiskLevel = 'global' | 'prohibited' | 'high_risk' | 'limited_risk' | 'minimal_risk' | 'gpai_model' | 'gpai_system' | 'gpai_sr' | 'unclassified';

export interface CustomFieldTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  applies_to?: RiskLevel; // Deprecated: kept for backwards compatibility
  applies_to_levels?: RiskLevel[]; // New: supports multiple levels
  field_definitions: CustomFieldDefinition[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomFieldTemplateData {
  name: string;
  description?: string;
  applies_to_levels: RiskLevel[];
  field_definitions: CustomFieldDefinition[];
}

export interface UpdateCustomFieldTemplateData {
  name?: string;
  description?: string;
  applies_to_levels?: RiskLevel[];
  field_definitions?: CustomFieldDefinition[];
  is_active?: boolean;
}