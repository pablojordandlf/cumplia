'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface LimitResult {
  limit: number;
  used: number;
  remaining: number;
  percentage: number;
  canUse: boolean;
  isLoading: boolean;
}

// Default fallback limits if plans table is not accessible
const DEFAULT_LIMITS: Record<string, number> = {
  free: 1,
  starter: 5,
  professional: 15,
  business: 30,
  enterprise: -1, // unlimited
};

export function useLimit(resource: 'useCases' | 'ai_systems'): LimitResult {
  const [limit, setLimit] = useState<number>(0);
  const [used, setUsed] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchLimitData() {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        // Get user's organization membership
        const { data: membership } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single();

        let planName = 'starter';

        if (membership?.organization_id) {
          // B2B: Get organization plan
          const { data: orgData } = await supabase
            .from('organizations')
            .select('plan_name')
            .eq('id', membership.organization_id)
            .single();
          
          planName = orgData?.plan_name || 'free';

          // Count use cases for this organization
          const { count } = await supabase
            .from('use_cases')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', membership.organization_id)
            .is('deleted_at', null);

          setUsed(count || 0);
        } else {
          // Personal mode: Check user's subscription/plan
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan_type')
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .single();

          planName = subscription?.plan_type || 'free';

          // Count user's use cases
          const { count } = await supabase
            .from('use_cases')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .is('deleted_at', null);

          setUsed(count || 0);
        }

        // Fetch plan limits from plans table
        const { data: planData } = await supabase
          .from('plans')
          .select('limits')
          .eq('name', planName)
          .single();

        // Extract max_ai_systems from plans.limits JSONB
        const planLimits = planData?.limits as { max_ai_systems?: number } | null;
        const maxSystems = planLimits?.max_ai_systems;
        
        // Use database value if available, otherwise fallback to defaults
        const planLimit = maxSystems !== undefined ? maxSystems : (DEFAULT_LIMITS[planName] || 1);
        setLimit(planLimit);

      } catch (error) {
        console.error('Error fetching limit data:', error);
        // Default to free plan on error
        setLimit(1);
        setUsed(0);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLimitData();
  }, [resource, supabase]);

  const remaining = limit === -1 ? Infinity : Math.max(0, limit - used);
  const percentage = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const canUse = limit === -1 || used < limit;

  return {
    limit,
    used,
    remaining,
    percentage,
    canUse,
    isLoading,
  };
}
