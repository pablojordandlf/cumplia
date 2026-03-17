'use client';

import { useCallback, useContext } from 'react';
import { OrganizationContext } from './use-organization';
import { MemberRole } from '@/types/organization';
import { hasPermission, Permission } from '@/lib/permissions';

interface UsePermissionsResult {
  can: (permission: Permission) => boolean;
  role: MemberRole | null;
  organizationId: string | null;
  isLoading: boolean;
}

export const usePermissions = (): UsePermissionsResult => {
  const { organization, isLoading } = useContext(OrganizationContext);

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

  return {
    can,
    role: currentUserRole,
    organizationId: organization?.id || null,
    isLoading,
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
