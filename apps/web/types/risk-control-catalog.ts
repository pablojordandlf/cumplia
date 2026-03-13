// types/risk-control-catalog.ts

export interface RiskCatalog {
  id: string;
  name: string;
  description: string;
  ai_act_article: string;
  ai_act_level: 'prohibited' | 'high_risk' | 'limited_risk' | 'minimal_risk';
  category: string;
  sector_tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ControlCatalog {
  id: string;
  name: string;
  description: string;
  implementation_guide: string | null;
  ai_act_level: 'high_risk' | 'limited_risk' | 'minimal_risk';
  category: string;
  related_risk_ids: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface UseCaseRisk {
  id: string;
  use_case_id: string | null; // Assuming use_case_id can be null if not linked
  catalog_risk_id: string | null; // Assuming it can be null if it's a custom risk
  custom_name: string | null;
  custom_description: string | null;
  status: 'identified' | 'assessed' | 'mitigated' | 'accepted';
  severity: 'low' | 'medium' | 'high' | 'critical';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UseCaseControl {
  id: string;
  use_case_id: string | null; // Assuming use_case_id can be null if not linked
  use_case_risk_id: string | null; // Assuming it can be null if not linked to a specific use_case_risk
  catalog_control_id: string | null; // Assuming it can be null if it's a custom control
  custom_name: string | null;
  status: 'planned' | 'implemented' | 'verified' | 'failed';
  implementation_notes: string | null;
  evidence_url: string | null;
  due_date: string | null; // ISO date string
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
