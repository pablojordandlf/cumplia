import React from 'react';
import { createClient } from '@/lib/supabase/client';
import { UseCase, UseCaseFilters } from '@/lib/api/use-cases';

interface UseCasesHook {
  useCases: UseCase[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUseCases = (userId: string): UseCasesHook => {
  const [useCases, setUseCases] = React.useState<UseCase[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUseCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('use_cases')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setUseCases(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUseCases();
  }, [userId]);

  // Realtime subscription - simplified to refetch on changes
  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`use-cases-channel-${userId}`);

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'use_cases',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        // Refetch all data when changes occur
        fetchUseCases();
      }
    ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { useCases, loading, error, refetch: fetchUseCases };
};
