import { createClient } from '../supabase/client';
import { UseCase, UseCaseFilters } from '../api/use-cases'; // Assuming UseCase and UseCaseFilters are defined here
import { RealtimeSubscription } from '@supabase/supabase-js';

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
        .eq('user_id', userId); // Assuming user_id is available in the session

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

  // Realtime subscription
  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`use-cases-channel-${userId}`);

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('Change received!', payload);
        // Update state based on payload operation (INSERT, UPDATE, DELETE)
        setUseCases((currentUseCases) => {
          let updatedUseCases = [...currentUseCases];
          switch (payload.event) {
            case 'INSERT':
              updatedUseCases.push(payload.new as UseCase);
              break;
            case 'UPDATE':
              updatedUseCases = updatedUseCases.map((uc) =>
                uc.id === payload.new.id ? (payload.new as UseCase) : uc
              );
              break;
            case 'DELETE':
              updatedUseCases = updatedUseCases.filter((uc) => uc.id !== payload.old.id);
              break;
          }
          return updatedUseCases;
        });
      }
    ).subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);


  return { useCases, loading, error, refetch: fetchUseCases };
};
