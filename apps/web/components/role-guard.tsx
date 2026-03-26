'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserOrganization } from '@/lib/auth-helpers';

type UserRole = 'admin' | 'compliance_officer' | 'auditor' | 'viewer';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

/**
 * Client-side route protection component
 * 
 * Usage:
 * <RoleGuard allowedRoles={['admin']}>
 *   <AdminContent />
 * </RoleGuard>
 */
export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback 
}: RoleGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const { data, error } = await fetchUserOrganization();
        
        if (error || !data) {
          setIsAuthorized(false);
          return;
        }

        const userRole = (data.role as UserRole) || 'viewer';
        const isAllowed = allowedRoles.includes(userRole);
        
        if (!isAllowed) {
          // Redirect to dashboard if not authorized
          router.push('/dashboard');
          setIsAuthorized(false);
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking authorization:', error);
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, [allowedRoles, router]);

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Unauthorized state
  if (!isAuthorized) {
    return fallback || (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-4">No tienes permiso para acceder a esta página</p>
        </div>
      </div>
    );
  }

  // Authorized - render children
  return <>{children}</>;
}
