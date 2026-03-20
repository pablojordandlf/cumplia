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

const PLAN_LIMITS: Record<string, number> = {
  starter: 1,
  professional: 15,
  business: -1, // unlimited
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

        // Get user's organization
        const { data: membership } = await supabase
          .from('organization_members')
          .select('organization_id, organizations!organization_id(plan)')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single();

        if (membership?.organization_id) {
          // B2B: Use organization plan
          const orgPlan = (membership.organizations as any)?.plan || 'starter';
          const planLimit = PLAN_LIMITS[orgPlan] || 1;
          setLimit(planLimit);

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

          const plan = subscription?.plan_type || 'starter';
          const planLimit = PLAN_LIMITS[plan] || 1;
          setLimit(planLimit);

          // Count user's use cases
          const { count } = await supabase
            .from('use_cases')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .is('deleted_at', null);

          setUsed(count || 0);
        }
      } catch (error) {
        console.error('Error fetching limit data:', error);
        // Default to starter plan on error
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
