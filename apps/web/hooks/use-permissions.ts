
// hooks/use-permissions.ts

import { useContext } from 'react';
import { AuthContext } from '@/lib/auth-context'; // Assuming AuthContext is available and provides user info
import { OrganizationContext } from './use-organization'; // Use the organization context
import { Role } from '@/types/roles';
import { Permission, hasPermission } from '@/lib/permissions';

interface UsePermissionsResult {
  can: (permission: Permission) => boolean;
  role: Role | null;
  organization: string | null; // Or the full organization object/ID
  isLoading: boolean;
}

// Mock for OrganizationContext, replace with actual import if it's complex
// interface OrganizationContextType {
//   organization: { id: string; name: string; role: Role } | null;
//   members: any[];
//   usage: any;
//   limits: any;
//   isLoading: boolean;
// }

export const usePermissions = (): UsePermissionsResult => {
  // Assume AuthContext provides the authenticated user and their current organization context (if any)
  // If user is not logged in, or not in an organization, role and organization will be null.
  const { user, isLoading: isAuthLoading } = useContext(AuthContext); 
  const { organization, role, isLoading: isOrgLoading } = useContext(OrganizationContext);

  // Determine the current user's role within the selected organization
  // This logic might need to be more sophisticated if a user can belong to multiple orgs and switch context
  const currentUserRole = organization?.role || null; // Assuming organization object from context has a role property
  
  const isLoading = isAuthLoading || isOrgLoading;

  const can = (permission: Permission): boolean => {
    if (isLoading || !currentUserRole) {
      // While loading or if no role is determined, deny permission by default
      return false;
    }
    // Use the hasPermission function from lib/permissions.ts
    return hasPermission(currentUserRole, permission);
  };

  return {
    can,
    role: currentUserRole,
    organization: organization?.id || null, // Return organization ID or null
    isLoading,
  };
};
