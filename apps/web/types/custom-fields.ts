export interface CustomFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'email' | 'number';
}

export interface CustomFieldTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  applies_to: 'global' | 'prohibited' | 'high_risk' | 'limited_risk' | 'minimal_risk' | 'gpai_model' | 'gpai_system' | 'gpai_sr' | 'unclassified';
  field_definitions: CustomFieldDefinition[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomFieldTemplateData {
  name: string;
  description?: string;
  applies_to: 'global' | 'prohibited' | 'high_risk' | 'limited_risk' | 'minimal_risk' | 'gpai_model' | 'gpai_system' | 'gpai_sr' | 'unclassified';
  field_definitions: CustomFieldDefinition[];
}

export interface UpdateCustomFieldTemplateData {
  name?: string;
  description?: string;
  applies_to?: 'global' | 'prohibited' | 'high_risk' | 'limited_risk' | 'minimal_risk' | 'gpai_model' | 'gpai_system' | 'gpai_sr' | 'unclassified';
  field_definitions?: CustomFieldDefinition[];
  is_active?: boolean;
}