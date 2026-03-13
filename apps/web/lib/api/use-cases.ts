import { UseCase, UseCaseFilters } from './use-cases'; // Import from the new hook file

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
