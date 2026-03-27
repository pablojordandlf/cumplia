'use client';

import { useEffect, useState } from 'react';
import { fetchUserOrganization } from '@/lib/auth-helpers';
import { Eye, AlertCircle } from 'lucide-react';

type UserRole = 'admin' | 'compliance_officer' | 'auditor' | 'viewer';

/**
 * ReadOnlyBadge Component
 * 
 * Displays a visual indicator when user has view-only (viewer) role
 * Shows role-specific badge for compliance and auditor roles
 */
export function ReadOnlyBadge() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const { data, error } = await fetchUserOrganization();
        if (!error && data) {
          setUserRole((data.role as UserRole) || 'viewer');
        } else {
          setUserRole('viewer');
        }
      } catch {
        setUserRole('viewer');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRole();
  }, []);

  if (isLoading || !userRole || userRole === 'admin') {
    return null;
  }

  const badgeConfig = {
    viewer: {
      icon: Eye,
      label: 'Solo lectura',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      iconColor: 'text-amber-600',
    },
    auditor: {
      icon: AlertCircle,
      label: 'Auditor',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-600',
    },
    compliance_officer: {
      icon: AlertCircle,
      label: 'Cumplimiento',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600',
    },
  };

  const config = badgeConfig[userRole];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
      <Icon className={`h-4 w-4 ${config.iconColor}`} />
      <span className={`text-xs font-medium ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
}
