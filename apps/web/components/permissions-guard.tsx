
// components/permissions-guard.tsx

import React from 'react';
import { usePermissions } from '@/hooks/use-permissions'; // Import the permissions hook
import { Permission } from '@/lib/permissions'; // Import Permission type

interface PermissionsGuardProps {
  requiredPermission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional fallback UI for unauthorized state
}

export const PermissionsGuard: React.FC<PermissionsGuardProps> = ({
  requiredPermission,
  children,
  fallback = null, // Default to null if no fallback is provided
}) => {
  const { can, isLoading } = usePermissions();

  // Display fallback or nothing while loading or if permissions are not met
  if (isLoading) {
    // Optionally, you could render a loading spinner here
    return <>{fallback}</>; 
  }

  // Check if the user has the required permission
  if (can(requiredPermission)) {
    return <>{children}</>;
  } else {
    // Render fallback UI if user does not have permission
    return <>{fallback}</>;
  }
};
