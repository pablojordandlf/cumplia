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
  classification_data: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface UseCaseFilters {
  status?: UseCase['status'];
  sector?: string;
  ai_act_level?: UseCase['ai_act_level'];
  search?: string;
}

export const useCasesApi = {
  list: (filters?: UseCaseFilters) => {
    // This function will be removed as useUseCases hook handles fetching
    // It's kept here temporarily to preserve the interface if needed, but ideally components
    // should be updated to use the hook directly.
    console.warn('useCasesApi.list is deprecated. Use useUseCases hook instead.');
    // Dummy implementation or throw error if strictly migrating
    return Promise.reject(new Error('useCasesApi.list is deprecated. Use useUseCases hook instead.'));
  },
  
  get: (id: string) => {
    // This function will be removed as useUseCases hook handles fetching
    console.warn('useCasesApi.get is deprecated. Use useUseCases hook instead.');
    return Promise.reject(new Error('useCasesApi.get is deprecated. Use useUseCases hook instead.'));
  },
  
  create: (data: Omit<UseCase, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'status' | 'ai_act_level' | 'confidence_score' | 'classification_reason' | 'classification_data'>) => {
    console.warn('useCasesApi.create is deprecated. Use useUseCase hook instead.');
    return Promise.reject(new Error('useCasesApi.create is deprecated. Use useUseCase hook instead.'));
  },
  
  update: (id: string, data: Partial<Omit<UseCase, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => {
    console.warn('useCasesApi.update is deprecated. Use useUseCase hook instead.');
    return Promise.reject(new Error('useCasesApi.update is deprecated. Use useUseCase hook instead.'));
  },
  
  delete: (id: string) => {
    console.warn('useCasesApi.delete is deprecated. Use useUseCase hook instead.');
    return Promise.reject(new Error('useCasesApi.delete is deprecated. Use useUseCase hook instead.'));
  },
  
  classify: (id: string) => {
    console.warn('useCasesApi.classify is deprecated. Use useUseCase hook instead.');
    return Promise.reject(new Error('useCasesApi.classify is deprecated. Use useUseCase hook instead.'));
  },
};
