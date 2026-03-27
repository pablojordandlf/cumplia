import { createClient } from '@/lib/supabase/client';
import { UseCase } from '@/lib/api/use-cases';

interface UseCaseHook {
  createUseCase: (data: Omit<UseCase, 'id' | 'created_at' | 'updated_at' | 'status' | 'ai_act_level' | 'confidence_score' | 'classification_reason' | 'classification_data'>) => Promise<UseCase | null>;
  updateUseCase: (id: string, data: Partial<Omit<UseCase, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => Promise<UseCase | null>;
  deleteUseCase: (id: string) => Promise<boolean>;
  classifyUseCase: (id: string) => Promise<UseCase | null>;
}

export const useUseCase = (userId: string): UseCaseHook => {
  const supabase = createClient();

  const createUseCase = async (data: Omit<UseCase, 'id' | 'created_at' | 'updated_at' | 'status' | 'ai_act_level' | 'confidence_score' | 'classification_reason' | 'classification_data'>): Promise<UseCase | null> => {
    try {
      const { data: newUseCase, error } = await supabase
        .from('use_cases')
        .insert([{ ...data, user_id: userId }]) // Ensure user_id is set
        .single();

      if (error) throw error;
      return newUseCase;
    } catch (err: any) {
      console.error('Error creating use case:', err.message);
      return null;
    }
  };

  const updateUseCase = async (id: string, data: Partial<Omit<UseCase, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<UseCase | null> => {
    try {
      const { data: updatedUseCase, error } = await supabase
        .from('use_cases')
        .update(data)
        .eq('id', id)
        .single();

      if (error) throw error;
      return updatedUseCase;
    } catch (err: any) {
      console.error('Error updating use case:', err.message);
      return null;
    }
  };

  const deleteUseCase = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('use_cases').delete().eq('id', id);

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error deleting use case:', err.message);
      return false;
    }
  };

  const classifyUseCase = async (id: string): Promise<UseCase | null> => {
    try {
      // Obtener el sistema de IA para enviar datos a la API
      const { data: useCase, error: fetchError } = await supabase
        .from('use_cases')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchError || !useCase) {
        throw new Error('Use case not found');
      }

      // Llamar al endpoint de clasificación (requiere fetch porque es server-side AI)
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          useCaseId: id,
          name: useCase.name,
          description: useCase.description,
          sector: useCase.sector,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Classification failed');
      }

      const result = await response.json();
      return result.useCase;

    } catch (err: any) {
      console.error('Error classifying use case:', err.message);
      return null;
    }
  };

  return { createUseCase, updateUseCase, deleteUseCase, classifyUseCase };
};
