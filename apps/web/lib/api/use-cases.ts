import { api } from './client';

export interface UseCase {
  id: string;
  organization_id: string;
  catalog_id: string | null;
  name: string;
  description: string | null;
  sector: string;
  status: 'draft' | 'classified' | 'in_review' | 'compliant' | 'non_compliant';
  ai_act_level: string;
  confidence_score: number | null;
  classification_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUseCaseData {
  name: string;
  description?: string;
  sector: string;
  catalog_id?: string | null;
}

export interface UpdateUseCaseData {
  name?: string;
  description?: string;
  sector?: string;
  status?: string;
}

export interface UseCaseFilters {
  sector?: string;
  status?: string;
  ai_act_level?: string;
}

export const useCasesApi = {
  list: (filters?: UseCaseFilters) => {
    const params = new URLSearchParams();
    if (filters?.sector) params.append('sector', filters.sector);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.ai_act_level) params.append('ai_act_level', filters.ai_act_level);
    return api.get<UseCase[]>(`/use-cases?${params.toString()}`);
  },
  
  get: (id: string) => api.get<UseCase>(`/use-cases/${id}`),
  
  create: (data: CreateUseCaseData) => api.post<UseCase>('/use-cases', data),
  
  update: (id: string, data: UpdateUseCaseData) => 
    api.patch<UseCase>(`/use-cases/${id}`, data),
  
  delete: (id: string) => api.delete<void>(`/use-cases/${id}`),
  
  classify: (id: string) => api.post<UseCase>(`/use-cases/${id}/classify`, {}),
};
