'use client';

import { useCallback, useContext, useMemo } from 'react';
import { OrganizationContext } from './use-organization';
import { MemberRole, OrganizationPlan } from '@/types/organization';
import { hasPermission, Permission } from '@/lib/permissions';

export interface PermissionChecks {
  hasFeature: (feature: string) => boolean;
  isPlan: (plan: string) => boolean;
  canCreateUseCase: boolean;
  canInviteUser: boolean;
  getPercentage: (type: 'useCases' | 'users') => number;
}

interface PermissionsData {
  plan: {
    name: OrganizationPlan;
    displayName: string;
  };
  usage: {
    useCasesUsed: number;
    usersUsed: number;
  };
  limits: {
    useCases: number;
    users: number;
  };
  features: {
    apiAccess: boolean;
    integrations: boolean;
    prioritySupport: boolean;
    sso: boolean;
    customTemplates: boolean;
  };
}

interface UsePermissionsResult {
  can: (permission: Permission) => boolean;
  role: MemberRole | null;
  organizationId: string | null;
  isLoading: boolean;
  checks: PermissionChecks | null;
  permissions: PermissionsData | null;
  refresh: () => Promise<void>;
}

export const usePermissions = (): UsePermissionsResult => {
  const { organization, limits, usage, isLoading, refresh } = useContext(OrganizationContext);

  const currentUserRole = organization?.currentUserRole || null;

  const can = useCallback(
    (permission: Permission): boolean => {
      if (isLoading || !currentUserRole) {
        return false;
      }
      return hasPermission(currentUserRole, permission);
    },
    [isLoading, currentUserRole]
  );

  // Build checks object for PermissionGate
  const checks: PermissionChecks | null = useMemo(() => {
    if (!organization || !limits || !usage) return null;
    
    return {
      hasFeature: (feature: string) => limits.features.includes(feature),
      isPlan: (plan: string) => organization.plan === plan,
      canCreateUseCase: limits.maxAiSystems === -1 || (usage?.aiSystems || 0) < limits.maxAiSystems,
      canInviteUser: limits.maxUsers === -1 || (usage?.users || 0) < limits.maxUsers,
      getPercentage: (type: 'useCases' | 'users') => {
        if (type === 'useCases') {
          if (limits.maxAiSystems === -1) return 0;
          return Math.min(100, Math.round(((usage?.aiSystems || 0) / limits.maxAiSystems) * 100));
        } else {
          if (limits.maxUsers === -1) return 0;
          return Math.min(100, Math.round(((usage?.users || 0) / limits.maxUsers) * 100));
        }
      },
    };
  }, [organization, limits, usage]);

  // Build permissions object for backward compatibility
  const permissions: PermissionsData | null = useMemo(() => {
    if (!organization || !limits || !usage) return null;

    const planDisplayNames: Record<OrganizationPlan, string> = {
      starter: 'Starter',
      professional: 'Professional',
      business: 'Business',
      enterprise: 'Enterprise',
    };

    return {
      plan: {
        name: organization.plan,
        displayName: planDisplayNames[organization.plan],
      },
      usage: {
        useCasesUsed: usage?.aiSystems || 0,
        usersUsed: usage?.users || 0,
      },
      limits: {
        useCases: limits.maxAiSystems,
        users: limits.maxUsers,
      },
      features: {
        apiAccess: limits.features.includes('api_access'),
        integrations: limits.features.includes('integrations'),
        prioritySupport: limits.features.includes('priority_support'),
        sso: limits.features.includes('sso'),
        customTemplates: limits.features.includes('custom_templates'),
      },
    };
  }, [organization, limits, usage]);

  return {
    can,
    role: currentUserRole,
    organizationId: organization?.id || null,
    isLoading,
    checks,
    permissions,
    refresh: refresh || (async () => {}),
  };
};

// Hook for checking permissions without context (for API routes or server components)
export function checkPermission(
  role: MemberRole,
  permission: Permission
): boolean {
  return hasPermission(role, permission);
}

// Get role hierarchy level (for comparing roles)
export function getRoleLevel(role: MemberRole): number {
  const levels: Record<MemberRole, number> = {
    owner: 4,
    admin: 3,
    editor: 2,
    viewer: 1,
  };
  return levels[role] || 0;
}

// Check if a role can manage another role
export function canManageRole(
  userRole: MemberRole,
  targetRole: MemberRole
): boolean {
  return getRoleLevel(userRole) > getRoleLevel(targetRole);
}

export type { Permission };
