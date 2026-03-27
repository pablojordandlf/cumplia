import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useRiskAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function markRiskAnalysisAsCompleted(systemId: string): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('use_cases')
        .update({ risk_analysis_completed: true })
        .eq('id', systemId)
        .select('id')
        .single();

      if (updateError) {
        console.error('Error updating risk analysis status:', updateError);
        setError(updateError.message);
        return false;
      }

      return !!data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error in markRiskAnalysisAsCompleted:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function markRiskAnalysisAsIncomplete(systemId: string): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('use_cases')
        .update({ risk_analysis_completed: false })
        .eq('id', systemId)
        .select('id')
        .single();

      if (updateError) {
        console.error('Error updating risk analysis status:', updateError);
        setError(updateError.message);
        return false;
      }

      return !!data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error in markRiskAnalysisAsIncomplete:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    markRiskAnalysisAsCompleted,
    markRiskAnalysisAsIncomplete,
    loading,
    error,
  };
}
