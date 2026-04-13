// Interface definitions for UseCase
export interface UseCase {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  sector: string | null;
  status: 'draft' | 'classified' | 'pending' | 'completed';
  ai_act_level: 'prohibited' | 'high_risk' | 'limited_risk' | 'minimal_risk' | null;
  confidence_score: number | null;
  classification_reason: string | null;
  classification_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface UseCaseFilters {
  status?: UseCase['status'];
  sector?: string;
  ai_act_level?: UseCase['ai_act_level'];
  search?: string;
}

