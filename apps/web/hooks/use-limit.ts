'use client';

import { useOrganization } from './use-organization';

interface LimitResult {
  limit: number;
  used: number;
  remaining: number;
  percentage: number;
  canUse: boolean;
  isLoading: boolean;
}

export function useLimit(resource: 'useCases' | 'ai_systems'): LimitResult {
  const { limits, usage, isLoading } = useOrganization();

  let limit = 0;
  let used = 0;

  if (resource === 'useCases' || resource === 'ai_systems') {
    limit = limits?.maxAiSystems || 0;
    used = usage?.aiSystems || 0;
  }

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
